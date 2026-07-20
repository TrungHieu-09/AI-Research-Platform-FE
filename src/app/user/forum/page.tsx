"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}




/* 
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}


interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}


interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}

*/