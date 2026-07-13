"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Bookmark,
  Bot,
  Eye,
  FileText,
  MessageCircle,
  Send,
  Sparkles,
  Star,
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
import type { ForumRatingItem, ForumRatingsResponse, PublicForumDocument } from "@/features/forum/types"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

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
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmittingRating, setIsSubmittingRating] = React.useState(false)
  const [isTogglingBookmark, setIsTogglingBookmark] = React.useState(false)
  const [isAskingAi, setIsAskingAi] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const myRating = React.useMemo(() => {
    if (!user) return null
    return ratings.items.find((item) => item.userId === user.id || item.authorId === user.id || item.user?.id === user.id || item.author?.id === user.id) ?? null
  }, [ratings.items, user])

  const loadDetail = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const [documentResponse, ratingsResponse] = await Promise.all([
        getPublicForumDocument(documentId),
        getDocumentRatings(documentId).catch(() => ({ average: 0, total: 0, items: [] })),
      ])

      setDocument(documentResponse)
      setIsBookmarked(Boolean(documentResponse.isBookmarked))
      setRatings({
        average: ratingsResponse.average ?? 0,
        total: ratingsResponse.total ?? 0,
        items: ratingsResponse.items ?? [],
      })
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
    if (myRating) {
      setRatingValue(myRating.rating)
      setComment(myRating.comment ?? "")
    }
  }, [myRating])

  async function handleSubmitRating(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmittingRating(true)
      setErrorMessage("")
      const payload = { rating: ratingValue, comment: comment.trim() }
      const response = myRating
        ? await updateDocumentRating(documentId, payload)
        : await createDocumentRating(documentId, payload)

      setRatings({
        average: response.average ?? 0,
        total: response.total ?? 0,
        items: response.items ?? [],
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể gửi đánh giá.")
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
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

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <main className="space-y-6">
            <article className="rounded-[28px] border border-[#c2c6d6]/40 bg-white/80 p-6 shadow-sm md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-700">
                  APPROVED
                </span>
                <span className="rounded-full border border-[#0058be]/20 bg-[#eff4ff] px-3 py-1.5 text-[12px] font-bold text-[#0058be]">
                  PUBLIC
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
              </div>

              {document.description ? (
                <p className="mb-6 whitespace-pre-line text-[15px] leading-8 text-[#424754]">{document.description}</p>
              ) : null}

              <div className="overflow-hidden rounded-[24px] border border-[#c2c6d6]/40 bg-[#f8f9ff]">
                {document.fileUrl ? (
                  <iframe
                    src={document.fileUrl}
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

            <section className="rounded-[28px] border border-[#c2c6d6]/40 bg-white/80 p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[#121c2a]">Đánh giá & bình luận</h2>
                  <p className="mt-1 text-[13px] text-[#727785]">
                    {ratings.total} lượt đánh giá · trung bình {ratings.average.toFixed(1)}/5
                  </p>
                </div>
                <RatingStars value={Math.round(ratings.average)} readonly />
              </div>

              <form onSubmit={handleSubmitRating} className="mb-6 rounded-[22px] border border-[#d9e3f7] bg-[#f8f9ff] p-4">
                <label className="mb-2 block text-[13px] font-bold text-[#424754]">
                  {myRating ? "Cập nhật đánh giá của bạn" : "Gửi đánh giá của bạn"}
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
                    {myRating ? "Cập nhật" : "Gửi đánh giá"}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {ratings.items.length > 0 ? ratings.items.map((item) => {
                  const author = getRatingAuthor(item)
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
                        <RatingStars value={item.rating} readonly />
                      </div>
                      {item.comment ? (
                        <p className="whitespace-pre-line text-[14px] leading-6 text-[#424754]">{item.comment}</p>
                      ) : null}
                    </article>
                  )
                }) : (
                  <div className="rounded-[20px] border border-[#c2c6d6]/40 bg-white p-6 text-center text-[14px] font-semibold text-[#727785]">
                    Chưa có bình luận cho tài liệu này.
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-3">
                  <p className="text-[20px] font-bold text-[#121c2a]">{document.viewCount ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#727785]">Views</p>
                </div>
                <div className="rounded-2xl border border-[#d9e3f7] bg-[#f8f9ff] p-3">
                  <p className="text-[20px] font-bold text-[#121c2a]">{ratings.total}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#727785]">Ratings</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#0058be]/15 bg-white/80 p-5 shadow-sm">
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

            <section className="rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm">
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
          </aside>
        </div>
      </div>
    </div>
  )
}
