"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"

import {
  getDocumentRatings,
  getPublicForumDocuments,
} from "@/features/forum/api/forum-api"
import {
  ForumAuroraBackdrop,
  ForumDocumentSkeletonList,
  ForumMetricRail,
  ForumSectionReveal,
  ForumSoftPulse,
} from "@/features/forum/components/forum-effects"
import type { ForumDocumentSort, PublicForumDocument } from "@/features/forum/types"
import { getSubjects } from "@/features/subjects/api/subjects-api"
import type { Subject } from "@/features/subjects/types"
import { cn } from "@/lib/utils"

const sortOptions: Array<{ label: string; value: ForumDocumentSort }> = [
  { label: "Mới nhất", value: "newest" },
  { label: "Nhiều lượt xem", value: "popular" },
  { label: "Đánh giá cao", value: "top_rated" },
]

function formatDate(value?: string) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("vi-VN")
}

function getInitials(name?: string | null) {
  return (name || "User")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getRatingAverage(document: PublicForumDocument) {
  return document.ratingAverage ?? document.averageRating ?? 0
}

function getRatingCount(document: PublicForumDocument) {
  return document.ratingCount ?? document.totalRatings ?? 0
}

function getCommentCount(document: PublicForumDocument) {
  return getRatingCount(document)
}

function getBookmarkCount(document: PublicForumDocument) {
  return document.bookmarkCount ?? document.savedCount ?? 0
}

function ForumDocumentCard({ document }: { document: PublicForumDocument }) {
  const excerpt =
    document.description && document.description.length > 180
      ? `${document.description.slice(0, 180)}...`
      : document.description || "Tài liệu công khai đã được duyệt trên Lumis Forum."

  return (
    <Link
      href={`/user/forum/${document.id}`}
      className="group relative block overflow-hidden rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0058be]/25 hover:shadow-[0_14px_40px_rgba(0,65,145,0.08)]"
    >
      <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[#0058be]/5 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
          <FileText size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
              APPROVED
            </span>
            <span className="rounded-full border border-[#0058be]/20 bg-[#eff4ff] px-2.5 py-1 text-[11px] font-bold text-[#0058be]">
              PUBLIC
            </span>
            {document.subject ? (
              <span className="rounded-full border border-[#d9e3f7] bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-bold text-[#424754]">
                {document.subject.code || document.subject.name}
              </span>
            ) : null}
          </div>

          <h2 className="mb-2 text-[18px] font-bold leading-snug text-[#121c2a] transition-colors group-hover:text-[#0058be]">
            {document.title}
          </h2>

          <p className="mb-4 text-[14px] leading-6 text-[#424754]">{excerpt}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#727785]">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eff4ff] text-[10px] font-bold text-[#0058be]">
                {getInitials(document.owner?.name)}
              </span>
              {document.owner?.name ?? "Unknown author"}
            </span>
            <span>{formatDate(document.createdAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={14} />
              {document.viewCount ?? 0} views
            </span>
            <span className="inline-flex items-center gap-1">
              <Star size={14} />
              {getRatingAverage(document).toFixed(1)} ({getRatingCount(document)})
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={14} />
              {getCommentCount(document)} bình luận
            </span>
            <span className="inline-flex items-center gap-1">
              <Bookmark size={14} />
              {getBookmarkCount(document)} saves
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Views", value: Math.min(100, (document.viewCount ?? 0) * 8) },
              { label: "Rating", value: Math.min(100, getRatingAverage(document) * 20) },
              { label: "Comments", value: Math.min(100, getCommentCount(document) * 12) },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl bg-[#f8f9ff] px-3 py-2">
                <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#727785]">
                  <span>{metric.label}</span>
                  <span>{Math.round(metric.value)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#dfe9fc]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0058be] to-[#8bb5ff] transition-all duration-500 group-hover:from-[#2170e4]"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ForumPage() {
  const [documents, setDocuments] = React.useState<PublicForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [search, setSearch] = React.useState("")
  const [subjectId, setSubjectId] = React.useState("")
  const [sort, setSort] = React.useState<ForumDocumentSort>("newest")
  const [page, setPage] = React.useState(1)
  const [filteredTotal, setFilteredTotal] = React.useState(0)
  const [totalPublicDocuments, setTotalPublicDocuments] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState("")

  React.useEffect(() => {
    getSubjects({ status: "ACTIVE" })
      .then(setSubjects)
      .catch(() => setSubjects([]))
  }, [])

  React.useEffect(() => {
    let ignore = false

    async function loadPublicDocumentTotal() {
      try {
        const response = await getPublicForumDocuments({
          page: 1,
          pageSize: 1,
          sort: "newest",
        })

        if (!ignore) {
          setTotalPublicDocuments(response.total ?? response.items.length)
        }
      } catch {
        if (!ignore) setTotalPublicDocuments(0)
      }
    }

    void loadPublicDocumentTotal()

    return () => {
      ignore = true
    }
  }, [])

  React.useEffect(() => {
    let ignore = false

    async function loadDocuments() {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const response = await getPublicForumDocuments({
          page,
          pageSize: 12,
          subjectId: subjectId || undefined,
          search,
          sort,
        })

        if (ignore) return
        const items = response.items ?? []
        const enrichedItems = await Promise.all(
          items.map(async (document) => {
            try {
              const ratingSummary = await getDocumentRatings(document.id)

              return {
                ...document,
                ratingAverage: ratingSummary.average ?? getRatingAverage(document),
                ratingCount: ratingSummary.total ?? getRatingCount(document),
                totalRatings: ratingSummary.total ?? document.totalRatings,
              }
            } catch {
              return document
            }
          }),
        )

        if (ignore) return
        setDocuments(enrichedItems)
        setFilteredTotal(response.total ?? 0)
        setTotalPages(response.totalPages || 1)
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách Forum.")
          setDocuments([])
          setFilteredTotal(0)
          setTotalPages(1)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    const timeout = window.setTimeout(loadDocuments, 250)
    return () => {
      ignore = true
      window.clearTimeout(timeout)
    }
  }, [page, search, sort, subjectId])

  const selectedSubject = subjects.find((subject) => subject.id === subjectId)

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff] px-6 py-8 md:px-10">
      <ForumAuroraBackdrop />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0058be]">
              <ForumSoftPulse>
                <Sparkles size={12} />
              </ForumSoftPulse>
              LUMIS PUBLIC FORUM
            </div>
            <h1 className="mb-2 text-[30px] font-bold tracking-tight text-[#121c2a] md:text-[34px]">
              Forum tài liệu
            </h1>
            <p className="max-w-2xl text-[14px] leading-6 text-[#424754]">
              Khám phá tài liệu public đã được duyệt, lọc theo môn học, đánh giá và lưu tài liệu hữu ích.
            </p>
          </div>

          <Link
            href="/user/upload"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 text-[14px] font-bold text-white shadow-md shadow-[#0058be]/20 transition-all hover:bg-[#2170e4]"
          >
            <Upload size={16} />
            Upload tài liệu
          </Link>
        </header>

        <ForumMetricRail
          items={[
            { label: "Public docs", value: totalPublicDocuments, helper: "Approved resources", tone: "blue" },
            { label: "Subjects", value: subjects.length, helper: "Active filters", tone: "green" },
            { label: "Current page", value: `${page}/${totalPages}`, helper: "Pagination state", tone: "amber" },
            { label: "Sort mode", value: sort.replace("_", " "), helper: "Feed ranking", tone: "violet" },
          ]}
        />

        <ForumSectionReveal>
        <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#c2c6d6]/50 bg-[#f8f9ff] px-4 py-3 focus-within:border-[#0058be]/50 focus-within:ring-4 focus-within:ring-[#0058be]/10">
              <Search size={17} className="shrink-0 text-[#727785]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo tiêu đề hoặc mô tả..."
                className="w-full bg-transparent text-[14px] text-[#121c2a] outline-none placeholder:text-[#727785]"
              />
            </div>

            <select
              value={subjectId}
              onChange={(event) => {
                setSubjectId(event.target.value)
                setPage(1)
              }}
              className="h-11 rounded-2xl border border-[#c2c6d6]/50 bg-[#f8f9ff] px-4 text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be]/50"
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code ? `${subject.code} · ${subject.name}` : subject.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as ForumDocumentSort)
                setPage(1)
              }}
              className="h-11 rounded-2xl border border-[#c2c6d6]/50 bg-[#f8f9ff] px-4 text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be]/50"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>
        </ForumSectionReveal>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <ForumSectionReveal>
            <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#121c2a]">
                <BookOpen size={17} className="text-[#0058be]" />
                Môn học
              </h2>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSubjectId("")
                    setPage(1)
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-[13px] font-bold transition-all",
                    !subjectId ? "bg-[#0058be] text-white" : "text-[#424754] hover:bg-[#eff4ff]",
                  )}
                >
                  Tất cả tài liệu
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => {
                      setSubjectId(subject.id)
                      setPage(1)
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition-all",
                      subjectId === subject.id ? "bg-[#0058be] text-white" : "text-[#424754] hover:bg-[#eff4ff]",
                    )}
                  >
                    <span className="block truncate">{subject.name}</span>
                    {subject.code ? (
                      <span className={cn("text-[11px]", subjectId === subject.id ? "text-white/75" : "text-[#727785]")}>
                        {subject.code}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
            </ForumSectionReveal>
          </aside>

          <main className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-[#727785]">
                Hiển thị {documents.length} / {filteredTotal} tài liệu
                {selectedSubject ? ` · ${selectedSubject.name}` : ""}
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {isLoading ? (
              <ForumDocumentSkeletonList count={4} />
            ) : documents.length > 0 ? (
              documents.map((document) => (
                <ForumSectionReveal key={document.id}>
                  <ForumDocumentCard document={document} />
                </ForumSectionReveal>
              ))
            ) : (
              <div className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                  <FileText size={26} />
                </div>
                <h2 className="text-[18px] font-bold text-[#121c2a]">Chưa có tài liệu public</h2>
                <p className="mt-2 text-[14px] text-[#727785]">Thử đổi bộ lọc hoặc upload tài liệu public để admin duyệt.</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-[13px] font-semibold text-[#727785]">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#c2c6d6]/50 bg-white px-4 py-2 text-[13px] font-bold text-[#424754] disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#c2c6d6]/50 bg-white px-4 py-2 text-[13px] font-bold text-[#424754] disabled:opacity-40"
                >
                  Sau
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
