"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Bookmark,
  Bot,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react"

import { sendChatMessage } from "@/features/ai/api/ai-api"
import {
  bookmarkDocument,
  createDocumentRating,
  getDocumentRatings,
  getPublicForumDocument,
  removeDocumentBookmark,
  updateDocumentRating,
} from "@/features/forum/api/forum-api"
import {
  ForumAuroraBackdrop,
  ForumMetricRail,
  ForumScrollProgress,
  ForumSectionReveal,
  ForumSoftPulse,
} from "@/features/forum/components/forum-effects"
import type { ForumRatingItem, ForumRatingsResponse, PublicForumDocument } from "@/features/forum/types"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

const RATINGS_FETCH_PAGE_SIZE = 1000
const RATINGS_PAGE_SIZE = 5
const FORUM_LIKES_STORAGE_KEY = "lumis_forum_likes"

interface ForumLikeState {
  documents: Record<string, boolean>
  documentCounts: Record<string, number>
  ratings: Record<string, boolean>
  ratingCounts: Record<string, number>
}

const emptyForumLikeState: ForumLikeState = {
  documents: {},
  documentCounts: {},
  ratings: {},
  ratingCounts: {},
}

function readForumLikeState(): ForumLikeState {
  if (typeof window === "undefined") return emptyForumLikeState

  try {
    const rawState = window.localStorage.getItem(FORUM_LIKES_STORAGE_KEY)
    if (!rawState) return emptyForumLikeState

    const parsed = JSON.parse(rawState) as Partial<ForumLikeState>

    return {
      documents: parsed.documents ?? {},
      documentCounts: parsed.documentCounts ?? {},
      ratings: parsed.ratings ?? {},
      ratingCounts: parsed.ratingCounts ?? {},
    }
  } catch {
    return emptyForumLikeState
  }
}

function getDocumentLikeBase(document: PublicForumDocument) {
  return document.likeCount ?? document.likedCount ?? 0
}

function getRatingLikeBase(rating: ForumRatingItem) {
  return rating.likeCount ?? rating.likedCount ?? 0
}

function formatDate(value?: string) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString("vi-VN")
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

function getRatingAuthor(rating: ForumRatingItem) {
  return rating.user ?? rating.author ?? null
}

function resolveDocumentFileUrl(fileUrl?: string | null) {
  if (!fileUrl) return ""

  if (/^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl
  if (fileUrl.startsWith("/api/")) return fileUrl

  const normalizedKey = fileUrl.startsWith("/")
    ? fileUrl.slice(1)
    : fileUrl.startsWith("documents/")
      ? fileUrl
      : `documents/${fileUrl}`

  return `/api/documents/mock-upload?key=${encodeURI(normalizedKey)}`
}

function normalizeRatings(response?: Partial<ForumRatingsResponse> | null): ForumRatingsResponse {
  const items = response?.items ?? response?.data ?? response?.ratings ?? []

  return {
    average: Number(response?.average ?? 0),
    total: Number(response?.total ?? items.length),
    items: Array.isArray(items) ? items : [],
    page: response?.page,
    pageSize: response?.pageSize,
    totalPages: response?.totalPages,
  }
}

function RatingStars({
  value,
  onChange,
  readonly = false,
}: {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "text-amber-400 transition-transform",
            readonly ? "cursor-default" : "hover:scale-110",
          )}
        >
          <Star size={readonly ? 16 : 22} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  )
}

export default function ForumDocumentDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const documentId = params.id

  const [document, setDocument] = React.useState<PublicForumDocument | null>(null)
  const [ratings, setRatings] = React.useState<ForumRatingsResponse>({ average: 0, total: 0, items: [] })
  const [ratingValue, setRatingValue] = React.useState(5)
  const [comment, setComment] = React.useState("")
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [aiQuestion, setAiQuestion] = React.useState("")
  const [aiAnswer, setAiAnswer] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | undefined>()
  const [ratingsPage, setRatingsPage] = React.useState(1)
  const [editingRatingId, setEditingRatingId] = React.useState<string | null>(null)
  const [editRatingValue, setEditRatingValue] = React.useState(5)
  const [editComment, setEditComment] = React.useState("")
  const [likeState, setLikeState] = React.useState<ForumLikeState>(emptyForumLikeState)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmittingRating, setIsSubmittingRating] = React.useState(false)
  const [isTogglingBookmark, setIsTogglingBookmark] = React.useState(false)
  const [isAskingAi, setIsAskingAi] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const ratingsTotalPages = Math.max(1, Math.ceil(ratings.items.length / RATINGS_PAGE_SIZE))
  const visibleRatings = React.useMemo(() => {
    const startIndex = (ratingsPage - 1) * RATINGS_PAGE_SIZE
    return ratings.items.slice(startIndex, startIndex + RATINGS_PAGE_SIZE)
  }, [ratings.items, ratingsPage])

  const isDocumentLiked = document
    ? likeState.documents[documentId] ?? Boolean(document.isLiked)
    : false
  const documentLikeCount = document
    ? getDocumentLikeBase(document) + (likeState.documentCounts[documentId] ?? 0)
    : 0

  function isOwnRating(item: ForumRatingItem) {
    if (!user) return false
    return item.userId === user.id || item.authorId === user.id || item.user?.id === user.id || item.author?.id === user.id
  }

  const loadDetail = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const [documentResponse, ratingsResponse] = await Promise.all([
        getPublicForumDocument(documentId),
        getDocumentRatings(documentId, {
          page: 1,
          pageSize: RATINGS_FETCH_PAGE_SIZE,
        }).catch(() => ({ average: 0, total: 0, items: [] })),
      ])

      setDocument(documentResponse)
      setIsBookmarked(Boolean(documentResponse.isBookmarked))
      setRatings(normalizeRatings(ratingsResponse))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải chi tiết tài liệu.")
      setDocument(null)
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  React.useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  React.useEffect(() => {
    setLikeState(readForumLikeState())
  }, [])

  React.useEffect(() => {
    setRatingsPage((currentPage) => Math.min(currentPage, ratingsTotalPages))
  }, [ratingsTotalPages])

  function handleStartEditRating(item: ForumRatingItem) {
    setEditingRatingId(item.id)
    setEditRatingValue(item.rating)
    setEditComment(item.comment ?? "")
    setErrorMessage("")
  }

  function handleCancelEditRating() {
    setEditingRatingId(null)
    setEditRatingValue(5)
    setEditComment("")
  }

  function persistLikeState(nextState: ForumLikeState) {
    setLikeState(nextState)
    window.localStorage.setItem(FORUM_LIKES_STORAGE_KEY, JSON.stringify(nextState))
  }

  function handleToggleDocumentLike() {
    const wasLiked = Boolean(likeState.documents[documentId] ?? document?.isLiked)
    const nextState: ForumLikeState = {
      documents: {
        ...likeState.documents,
        [documentId]: !wasLiked,
      },
      documentCounts: {
        ...likeState.documentCounts,
        [documentId]: Math.max(0, (likeState.documentCounts[documentId] ?? 0) + (wasLiked ? -1 : 1)),
      },
      ratings: likeState.ratings,
      ratingCounts: likeState.ratingCounts,
    }

    persistLikeState(nextState)
  }

  function isRatingLiked(item: ForumRatingItem) {
    return likeState.ratings[item.id] ?? Boolean(item.isLiked)
  }

  function getRatingLikeCount(item: ForumRatingItem) {
    return getRatingLikeBase(item) + (likeState.ratingCounts[item.id] ?? 0)
  }

  function handleToggleRatingLike(item: ForumRatingItem) {
    const wasLiked = isRatingLiked(item)
    const nextState: ForumLikeState = {
      documents: likeState.documents,
      documentCounts: likeState.documentCounts,
      ratings: {
        ...likeState.ratings,
        [item.id]: !wasLiked,
      },
      ratingCounts: {
        ...likeState.ratingCounts,
        [item.id]: Math.max(0, (likeState.ratingCounts[item.id] ?? 0) + (wasLiked ? -1 : 1)),
      },
    }

    persistLikeState(nextState)
  }

  async function handleSubmitRating(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmittingRating(true)
      setErrorMessage("")
      const payload = { rating: ratingValue, comment: comment.trim() }
      await createDocumentRating(documentId, payload)

      const latestRatings = await getDocumentRatings(documentId, {
        page: 1,
        pageSize: RATINGS_FETCH_PAGE_SIZE,
      })
      setRatings(normalizeRatings(latestRatings))
      setRatingsPage(1)
      setRatingValue(5)
      setComment("")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể gửi đánh giá.")
    } finally {
      setIsSubmittingRating(false)
    }
  }

  async function handleSubmitEditRating(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmittingRating(true)
      setErrorMessage("")
      await updateDocumentRating(documentId, {
        rating: editRatingValue,
        comment: editComment.trim(),
      })

      const latestRatings = await getDocumentRatings(documentId, {
        page: 1,
        pageSize: RATINGS_FETCH_PAGE_SIZE,
      })
      setRatings(normalizeRatings(latestRatings))
      handleCancelEditRating()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật bình luận.")
    } finally {
      setIsSubmittingRating(false)
    }
  }

  async function handleToggleBookmark() {
    try {
      setIsTogglingBookmark(true)
      setErrorMessage("")

      if (isBookmarked) {
        await removeDocumentBookmark(documentId)
        setIsBookmarked(false)
      } else {
        await bookmarkDocument(documentId)
        setIsBookmarked(true)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật bookmark.")
    } finally {
      setIsTogglingBookmark(false)
    }
  }

  async function handleAskAi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!aiQuestion.trim()) return

    try {
      setIsAskingAi(true)
      setErrorMessage("")
      const response = await sendChatMessage({
        message: aiQuestion.trim(),
        sessionId,
        documentId,
        scope: "SINGLE_DOCUMENT",
      })

      setSessionId(response.sessionId)
      setAiAnswer(response.answer ?? response.message ?? "AI chưa trả về nội dung.")
      setAiQuestion("")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể hỏi AI về tài liệu này.")
    } finally {
      setIsAskingAi(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f9ff]">
        <span className="material-symbols-outlined animate-spin text-[40px] text-[#0058be]">progress_activity</span>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">Không thể mở tài liệu Forum.</p>
          <p className="mt-2 text-[14px]">{errorMessage || "Tài liệu không tồn tại hoặc chưa được public."}</p>
          <Link href="/user/forum" className="mt-4 inline-flex font-bold text-[#0058be]">
            Quay lại Forum
          </Link>
        </div>
      </div>
    )
  }

  const previewUrl = resolveDocumentFileUrl(document.fileUrl)

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff] px-6 py-8 md:px-10">
      <ForumScrollProgress />
      <ForumAuroraBackdrop />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <Link
          href="/user/forum"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d9e3f7] bg-white px-3 text-[13px] font-bold text-[#424754] transition-colors hover:bg-[#eff4ff] hover:text-[#0058be]"
        >
          <ArrowLeft size={15} />
          Quay lại Forum
        </Link>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <ForumMetricRail
          items={[
            { label: "Views", value: document.viewCount ?? 0, helper: "Auto-incremented", tone: "blue" },
            { label: "Rating", value: ratings.average.toFixed(1), helper: `${ratings.total} community votes`, tone: "amber" },
            { label: "Pages", value: document.pageCount ?? 0, helper: "Document length", tone: "green" },
            { label: "AI scope", value: "Single", helper: "RAG over this file", tone: "violet" },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <main className="space-y-6">
            <ForumSectionReveal>
            <article className="relative overflow-hidden rounded-[28px] border border-[#c2c6d6]/40 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#0058be]/10 blur-3xl" />
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-700">
                  APPROVED
                </span>
                <span className="rounded-full border border-[#0058be]/20 bg-[#eff4ff] px-3 py-1.5 text-[12px] font-bold text-[#0058be]">
                  <ForumSoftPulse>PUBLIC</ForumSoftPulse>
                </span>
                {document.subject ? (
                  <span className="rounded-full border border-[#d9e3f7] bg-[#f8f9ff] px-3 py-1.5 text-[12px] font-bold text-[#424754]">
                    {document.subject.code || document.subject.name}
                  </span>
                ) : null}
              </div>

              <h1 className="mb-4 text-[30px] font-bold leading-tight tracking-tight text-[#121c2a] md:text-[36px]">
                {document.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#727785]">
                <span>By <span className="font-bold text-[#424754]">{document.owner?.name ?? "Unknown author"}</span></span>
                <span>{formatDate(document.createdAt)}</span>
                <span className="inline-flex items-center gap-1"><Eye size={14} /> {document.viewCount ?? 0} views</span>
                <span className="inline-flex items-center gap-1"><Star size={14} /> {ratings.average.toFixed(1)} ({ratings.total})</span>
                <span className="inline-flex items-center gap-1"><Heart size={14} /> {documentLikeCount} thích</span>
              </div>

              {document.description ? (
                <p className="mb-6 whitespace-pre-line text-[15px] leading-8 text-[#424754]">{document.description}</p>
              ) : null}

              <div className="relative overflow-hidden rounded-[24px] border border-[#c2c6d6]/40 bg-[#f8f9ff] shadow-inner">
                <div className="absolute left-4 top-4 z-10 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0058be] shadow-sm backdrop-blur">
                  Live preview
                </div>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title={document.title}
                    className="h-[620px] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-[#727785]">
                    <FileText size={36} />
                    <p className="text-[14px] font-semibold">Không có file preview.</p>
                  </div>
                )}
              </div>
            </article>
            </ForumSectionReveal>

            <ForumSectionReveal>
            <section className="rounded-[28px] border border-[#c2c6d6]/40 bg-white/80 p-6 shadow-sm backdrop-blur-xl md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[#121c2a]">Đánh giá & bình luận</h2>
                  <p className="mt-1 text-[13px] text-[#727785]">
                    {ratings.total} lượt đánh giá · đang hiển thị {visibleRatings.length}/{ratings.items.length} bình luận · trung bình {ratings.average.toFixed(1)}/5
                  </p>
                </div>
                <RatingStars value={Math.round(ratings.average)} readonly />
              </div>

              <form onSubmit={handleSubmitRating} className="mb-6 rounded-[22px] border border-[#d9e3f7] bg-[#f8f9ff] p-4">
                <label className="mb-2 block text-[13px] font-bold text-[#424754]">
                  Gửi đánh giá của bạn
                </label>
                <RatingStars value={ratingValue} onChange={setRatingValue} />
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="Nhận xét về nội dung, độ hữu ích hoặc cách dùng tài liệu..."
                  className="mt-3 w-full resize-y rounded-2xl border border-[#c2c6d6] bg-white p-3.5 text-[14px] leading-6 text-[#121c2a] outline-none placeholder:text-[#adb1bb] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0058be] px-5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#2170e4] disabled:opacity-60"
                  >
                    {isSubmittingRating ? (
                      <span className="material-symbols-outlined animate-spin text-[17px]">progress_activity</span>
                    ) : (
                      <Send size={15} />
                    )}
                    Gửi đánh giá
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {visibleRatings.length > 0 ? visibleRatings.map((item) => {
                  const author = getRatingAuthor(item)
                  const canEdit = isOwnRating(item)
                  const likedRating = isRatingLiked(item)
                  const ratingLikeCount = getRatingLikeCount(item)
                  return (
                    <article key={item.id} className="rounded-[20px] border border-[#c2c6d6]/40 bg-white p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eff4ff] text-[12px] font-bold text-[#0058be]">
                            {getInitials(author?.name)}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#121c2a]">{author?.name ?? "Student"}</p>
                            <p className="text-[12px] text-[#727785]">{formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <RatingStars value={item.rating} readonly />
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => handleStartEditRating(item)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                                editingRatingId === item.id
                                  ? "bg-[#0058be] text-white"
                                  : "border border-[#d9e3f7] bg-[#eff4ff] text-[#0058be] hover:bg-[#dee9fc]",
                              )}
                            >
                              <Pencil size={12} />
                              {editingRatingId === item.id ? "Đang sửa" : "Sửa"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {item.comment ? (
                        <p className="whitespace-pre-line text-[14px] leading-6 text-[#424754]">{item.comment}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRatingLike(item)}
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-colors",
                            likedRating
                              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                              : "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
                          )}
                        >
                          <Heart size={13} fill={likedRating ? "currentColor" : "none"} />
                          {likedRating ? "Đã thích" : "Thích"}
                        </button>
                        <span className="text-[12px] font-semibold text-[#727785]">
                          {ratingLikeCount} lượt thích
                        </span>
                      </div>
                      {editingRatingId === item.id ? (
                        <form
                          onSubmit={handleSubmitEditRating}
                          className="mt-4 rounded-[18px] border border-[#0058be]/20 bg-[#f8f9ff] p-4"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <label className="text-[13px] font-bold text-[#424754]">
                              Chỉnh sửa bình luận
                            </label>
                            <button
                              type="button"
                              onClick={handleCancelEditRating}
                              className="inline-flex items-center gap-1 rounded-full border border-[#c2c6d6]/70 bg-white px-3 py-1 text-[12px] font-bold text-[#727785] transition-colors hover:bg-[#eff4ff] hover:text-[#424754]"
                            >
                              <X size={13} />
                              Hủy
                            </button>
                          </div>
                          <RatingStars value={editRatingValue} onChange={setEditRatingValue} />
                          <textarea
                            value={editComment}
                            onChange={(event) => setEditComment(event.target.value)}
                            rows={3}
                            placeholder="Cập nhật nội dung bình luận..."
                            className="mt-3 w-full resize-y rounded-2xl border border-[#c2c6d6] bg-white p-3.5 text-[14px] leading-6 text-[#121c2a] outline-none placeholder:text-[#adb1bb] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                          />
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEditRating}
                              className="inline-flex h-10 items-center rounded-xl border border-[#c2c6d6]/70 bg-white px-4 text-[13px] font-bold text-[#424754] transition-colors hover:bg-[#eff4ff]"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingRating}
                              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0058be] px-5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#2170e4] disabled:opacity-60"
                            >
                              {isSubmittingRating ? (
                                <span className="material-symbols-outlined animate-spin text-[17px]">progress_activity</span>
                              ) : (
                                <Send size={15} />
                              )}
                              Lưu chỉnh sửa
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </article>
                  )
                }) : (
                  <div className="rounded-[20px] border border-[#c2c6d6]/40 bg-white p-6 text-center text-[14px] font-semibold text-[#727785]">
                    Chưa có bình luận cho tài liệu này.
                  </div>
                )}
              </div>

              {ratings.items.length > RATINGS_PAGE_SIZE ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d9e3f7] pt-4">
                  <p className="text-[13px] font-semibold text-[#727785]">
                    Trang bình luận {ratingsPage} / {ratingsTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={ratingsPage <= 1}
                      onClick={() => setRatingsPage((value) => Math.max(1, value - 1))}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#c2c6d6]/60 bg-white px-3 text-[13px] font-bold text-[#424754] transition-colors hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                      Trước
                    </button>
                    <button
                      type="button"
                      disabled={ratingsPage >= ratingsTotalPages}
                      onClick={() => setRatingsPage((value) => Math.min(ratingsTotalPages, value + 1))}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#c2c6d6]/60 bg-white px-3 text-[13px] font-bold text-[#424754] transition-colors hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
            </ForumSectionReveal>
          </main>

          <aside className="space-y-5">
            <ForumSectionReveal>
            <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={isTogglingBookmark}
                className={cn(
                  "mb-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[14px] font-bold transition-all",
                  isBookmarked
                    ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/20"
                    : "border border-[#0058be]/20 bg-[#eff4ff] text-[#0058be] hover:bg-[#dee9fc]",
                )}
              >
                {isTogglingBookmark ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
                )}
                {isBookmarked ? "Đã lưu tài liệu" : "Lưu tài liệu"}
              </button>

              <button
                type="button"
                onClick={handleToggleDocumentLike}
                className={cn(
                  "mb-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[14px] font-bold transition-all",
                  isDocumentLiked
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
                )}
              >
                <Heart size={17} fill={isDocumentLiked ? "currentColor" : "none"} />
                {isDocumentLiked ? `Đã thích · ${documentLikeCount}` : `Thích tài liệu · ${documentLikeCount}`}
              </button>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-3">
                  <p className="text-[20px] font-bold text-[#121c2a]">{document.viewCount ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#727785]">Views</p>
                </div>
                <div className="rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-3">
                  <p className="text-[20px] font-bold text-[#121c2a]">{ratings.total}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#727785]">Ratings</p>
                </div>
                <div className="rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-3">
                  <p className="text-[20px] font-bold text-[#121c2a]">{documentLikeCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#727785]">Likes</p>
                </div>
              </div>
            </section>
            </ForumSectionReveal>

            <ForumSectionReveal>
            <section className="relative overflow-hidden rounded-[24px] border border-[#0058be]/15 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#0058be]/10 blur-2xl" />
              <h2 className="mb-2 flex items-center gap-2 text-[16px] font-bold text-[#121c2a]">
                <Bot size={18} className="text-[#0058be]" />
                Hỏi AI về tài liệu
              </h2>
              <p className="mb-4 text-[13px] leading-6 text-[#727785]">
                AI sẽ trả lời theo scope <span className="font-bold text-[#424754]">SINGLE_DOCUMENT</span>.
              </p>

              <form onSubmit={handleAskAi} className="space-y-3">
                <textarea
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  rows={4}
                  placeholder="Ví dụ: Giải thích phần chính của tài liệu này..."
                  className="w-full resize-y rounded-2xl border border-[#c2c6d6] bg-[#f8f9ff] p-3.5 text-[14px] leading-6 text-[#121c2a] outline-none placeholder:text-[#adb1bb] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
                <button
                  type="submit"
                  disabled={isAskingAi || !aiQuestion.trim()}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0058be] px-5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#2170e4] disabled:opacity-60"
                >
                  {isAskingAi ? (
                    <span className="material-symbols-outlined animate-spin text-[17px]">progress_activity</span>
                  ) : (
                    <Sparkles size={15} />
                  )}
                  Ask AI
                </button>
              </form>

              {aiAnswer ? (
                <div className="mt-4 rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-4">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#0058be]">AI Answer</p>
                  <p className="whitespace-pre-line text-[14px] leading-6 text-[#424754]">{aiAnswer}</p>
                </div>
              ) : null}
            </section>
            </ForumSectionReveal>

            <ForumSectionReveal>
            <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <h2 className="mb-3 flex items-center gap-2 text-[16px] font-bold text-[#121c2a]">
                <MessageCircle size={18} className="text-[#0058be]" />
                Thông tin
              </h2>
              <div className="space-y-3 text-[13px] text-[#424754]">
                <p><span className="font-bold">Môn học:</span> {document.subject?.name ?? "N/A"}</p>
                <p><span className="font-bold">Số trang:</span> {document.pageCount ?? 0}</p>
                <p><span className="font-bold">Loại file:</span> {document.mimeType || "N/A"}</p>
              </div>
            </section>
            </ForumSectionReveal>
          </aside>
        </div>
      </div>
    </div>
  )
}
