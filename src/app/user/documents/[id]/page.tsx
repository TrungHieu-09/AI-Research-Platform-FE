"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, FileText, Download, Eye, Sparkles, Star,
  Calendar, Hash, User, BookOpen, MessageSquare, Send, CheckCircle2,
  AlertCircle, Loader2, Share2, Bookmark, ExternalLink, Pencil, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { token, user } = useAuth()

  const [doc, setDoc] = React.useState<any | null>(null)
  const [loadingDoc, setLoadingDoc] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [previewObjectUrl, setPreviewObjectUrl] = React.useState("")
  const [previewLoading, setPreviewLoading] = React.useState(false)
  const [previewError, setPreviewError] = React.useState("")
  const [downloading, setDownloading] = React.useState(false)

  // Ratings & Comments State
  const [ratingsData, setRatingsData] = React.useState<{ average: number; total: number; items: any[] }>({
    average: 0,
    total: 0,
    items: [],
  })
  const [loadingRatings, setLoadingRatings] = React.useState(true)
  const [userRating, setUserRating] = React.useState<number>(5)
  const [userComment, setUserComment] = React.useState<string>("")
  const [submittingReview, setSubmittingReview] = React.useState(false)
  const [editingReviewId, setEditingReviewId] = React.useState<string | null>(null)
  const [editRating, setEditRating] = React.useState<number>(5)
  const [editComment, setEditComment] = React.useState<string>("")
  const [updatingReview, setUpdatingReview] = React.useState(false)

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const getReviewUserId = (review: any) => String(review?.userId || review?.user?.id || review?.ownerId || "")

  const isOwnReview = (review: any) => Boolean(user?.id && getReviewUserId(review) === String(user.id))

  const startEditReview = (review: any) => {
    setEditingReviewId(String(review.id || "current-user-review"))
    setEditRating(Number(review.rating || 5))
    setEditComment(String(review.comment || ""))
  }

  const cancelEditReview = () => {
    setEditingReviewId(null)
    setEditRating(5)
    setEditComment("")
  }
  // Fetch Document Details
  const fetchDocument = React.useCallback(async () => {
    if (!id || !token) return
    setLoadingDoc(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDoc(data)
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải tài liệu hoặc tài liệu ở chế độ riêng tư.")
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.")
    } finally {
      setLoadingDoc(false)
    }
  }, [id, token])

  // Fetch Document Ratings / Comments
  const fetchRatings = React.useCallback(async () => {
    if (!id || !token) return
    setLoadingRatings(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}/ratings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRatingsData({
          average: data.average ?? 0,
          total: data.total ?? 0,
          items: Array.isArray(data.items) ? data.items : [],
        })
      }
    } catch (err) {
      console.error("Failed to fetch ratings:", err)
    } finally {
      setLoadingRatings(false)
    }
  }, [id, token])

  React.useEffect(() => {
    fetchDocument()
    fetchRatings()
  }, [fetchDocument, fetchRatings])

  React.useEffect(() => {
    if (!doc?.id || !token) {
      setPreviewObjectUrl("")
      return
    }

    let objectUrl = ""
    let cancelled = false

    async function loadPreview() {
      setPreviewLoading(true)
      setPreviewError("")
      setPreviewObjectUrl("")

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        const res = await fetch(`${baseUrl}/api/documents/${doc.id}/preview`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "Không thể tải bản xem trước tài liệu.")
        }

        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setPreviewObjectUrl(objectUrl)
      } catch (err: any) {
        if (!cancelled) setPreviewError(err.message || "Không thể tải bản xem trước tài liệu.")
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }

    loadPreview()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc?.id, token])

  const handleDownloadDocument = async () => {
    if (!doc?.id || !token) return

    setDownloading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Không thể tải tệp tài liệu.")
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = `${doc.title || "document"}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err: any) {
      showToast(err.message || "Không thể tải tệp tài liệu.", "error")
    } finally {
      setDownloading(false)
    }
  }
  // Submit Rating & Review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !id) return
    setSubmittingReview(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment.trim() || undefined
        })
      })

      if (res.ok) {
        showToast("Đã đăng đánh giá lên diễn đàn thành công.", "success")
        setUserRating(5)
        setUserComment("")
        fetchRatings()
      } else {
        const err = await res.json()
        showToast(err.error || "Không thể gửi đánh giá. Vui lòng thử lại sau.", "error")
      }
    } catch (err) {
      showToast("Không kết nối được máy chủ. Vui lòng thử lại.", "error")
    } finally {
      setSubmittingReview(false)
    }
  }


  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !id) return

    setUpdatingReview(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}/ratings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim() || undefined,
        }),
      })

      if (res.ok) {
        showToast("Đã cập nhật đánh giá của bạn.", "success")
        cancelEditReview()
        fetchRatings()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể cập nhật đánh giá. Vui lòng thử lại.", "error")
      }
    } catch {
      showToast("Không kết nối được máy chủ. Vui lòng thử lại.", "error")
    } finally {
      setUpdatingReview(false)
    }
  }
  if (loadingDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#f8f9ff] gap-3 text-[#727785]">
        <Loader2 size={32} className="animate-spin text-[#0058be]" />
        <p className="text-[14px] font-semibold">Đang tải thông tin chi tiết tài liệu...</p>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#f8f9ff] gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-1">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-[20px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Không tìm thấy tài liệu</h2>
        <p className="text-[14px] text-[#727785] max-w-[448px]">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 bg-[#0058be] text-white rounded-xl text-[13px] font-bold hover:bg-[#004ca3] transition-colors"
        >
          Quay lại Thư viện
        </button>
      </div>
    )
  }

  const isPdf = doc.mimeType?.toLowerCase().includes("pdf") || doc.fileUrl?.toLowerCase().endsWith(".pdf") || doc.title?.toLowerCase().endsWith(".pdf")

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-[13px] font-semibold max-w-[384px]",
            toastMessage.type === "success" 
              ? "bg-white border-[#0058be]/20 text-[#121c2a]" 
              : "bg-red-50 border-red-200 text-red-700"
          )}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="text-[#0058be] shrink-0" size={18} />
            ) : (
              <AlertCircle className="text-red-600 shrink-0" size={18} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Toolbar */}
      <div className="h-14 shrink-0 bg-white/80 backdrop-blur-md border-b border-[#c2c6d6]/40 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 text-[#727785] hover:text-[#121c2a] transition-colors shrink-0"
            title="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-4 w-[1px] bg-[#c2c6d6]/60 shrink-0" />
          <span className="text-[13px] font-bold text-[#0058be] bg-[#eff4ff] px-3 py-1 rounded-lg shrink-0">
            {doc.subject?.name || "Chung"}
          </span>
          <h1 className="text-[15px] font-bold text-[#121c2a] truncate max-w-[420px]" style={{ fontFamily: "Geist, sans-serif" }}>
            {doc.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/user/ai-workspace?docId=${doc.id}`}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0058be] hover:bg-[#004ca3] text-white text-[13px] font-bold shadow-md shadow-[#0058be]/20 transition-all hover:scale-105"
          >
            <Sparkles size={15} />
            Phân tích với AI
          </Link>
          <button
            type="button"
            onClick={handleDownloadDocument}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#c2c6d6]/60 hover:border-[#0058be] text-[#424754] hover:text-[#0058be] text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Tải xuống
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left/Center Column: Embedded Document Preview / Viewer */}
        <section className="flex-1 flex flex-col bg-[#e9effa]/60 p-6 overflow-y-auto items-center justify-start">
          <div className="w-full max-w-[860px] bg-white rounded-3xl shadow-xl border border-[#c2c6d6]/40 flex flex-col overflow-hidden min-h-[640px]">
            {/* Viewer Sub-Header */}
            <div className="h-12 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/80 px-5 flex items-center justify-between text-[12px] font-semibold text-[#727785]">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#0058be]" />
                <span>Trình xem tài liệu · {(doc.fileSize / 1024 / 1024 || 1.2).toFixed(2)} MB · {doc.pageCount || 1} Trang</span>
              </div>
              {previewObjectUrl && (
                <button
                  type="button"
                  onClick={() => window.open(previewObjectUrl, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-1 text-[#0058be] hover:underline"
                >
                  <span>Mở toàn màn hình</span>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>

            {/* Viewer Content Frame */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f1f5f9] min-h-[580px]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 text-[#727785]">
                  <Loader2 size={28} className="animate-spin text-[#0058be]" />
                  <p className="text-[13px] font-semibold">Đang tải bản xem trước từ storage...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-red-200 w-full max-w-[520px] shadow-sm">
                  <AlertCircle size={36} className="text-red-600 mb-3" />
                  <h3 className="text-[17px] font-bold text-[#121c2a] mb-2">Không thể xem tài liệu</h3>
                  <p className="text-[13px] text-[#727785] leading-relaxed">{previewError}</p>
                </div>
              ) : isPdf && previewObjectUrl ? (
                <iframe
                  src={`${previewObjectUrl}#toolbar=0`}
                  className="w-full h-full min-h-[600px] rounded-2xl border border-gray-200 bg-white"
                  title={doc.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-200 w-full max-w-[512px] shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#0058be] mb-4">
                    <FileText size={36} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#121c2a] mb-2">{doc.title}</h3>
                  <p className="text-[13px] text-[#727785] leading-relaxed mb-6">
                    Tài liệu này ở định dạng <strong className="text-[#121c2a]">{doc.mimeType || "DOC/DOCX"}</strong>. Bạn có thể sử dụng Trợ lý AI để trích xuất tóm tắt nội dung tự động hoặc tải về máy để xem chi tiết.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={`/user/ai-workspace?docId=${doc.id}`}
                      className="px-5 py-2.5 bg-[#0058be] text-white rounded-xl text-[13px] font-bold hover:bg-[#004ca3] transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={15} /> Phân tích với AI
                    </Link>
                    <button
                      type="button"
                      onClick={handleDownloadDocument}
                      disabled={downloading}
                      className="px-5 py-2.5 bg-gray-100 text-[#121c2a] rounded-xl text-[13px] font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Tải tệp gốc
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Panel: Contextual Inspector & Academic Reviews */}
        <aside className="w-[380px] shrink-0 bg-white border-l border-[#c2c6d6]/40 flex flex-col overflow-y-auto">
          {/* Inspector Header */}
          <div className="h-14 px-5 border-b border-[#c2c6d6]/30 bg-[#f8f9ff] flex items-center justify-between sticky top-0 z-10">
            <span className="text-[13px] font-bold text-[#121c2a] uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-[#0058be]" /> Thông tin & Thảo luận
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">
              {doc.status}
            </span>
          </div>

          <div className="p-5 space-y-6 flex-1">
            {/* Top Badges & Title */}
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0058be] text-[11px] font-bold">
                  {doc.visibility === "PUBLIC" ? "Cộng đồng công khai" : "Tài liệu cá nhân"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                  {doc.pageCount || 1} trang
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-[#121c2a] leading-snug mb-1" style={{ fontFamily: "Geist, sans-serif" }}>
                {doc.title}
              </h2>
              <p className="text-[13px] font-medium text-[#0058be] flex items-center gap-1.5 mt-1">
                <User size={14} /> Tác giả: {doc.owner?.name || "Người dùng Lumis"}
              </p>
              <p className="text-[12px] text-[#727785] flex items-center gap-1.5 mt-1">
                <Calendar size={13} /> Ngày đăng: {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="h-[1px] bg-[#c2c6d6]/30 w-full" />

            {/* Keywords / Tags */}
            <div>
              <span className="text-[11px] font-bold text-[#727785] uppercase tracking-wider block mb-2">Thẻ phân loại & Từ khóa</span>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags && doc.tags.length > 0 ? (
                  doc.tags.map((t: any) => (
                    <span key={t.id} className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#0058be] font-bold text-[11px]">
                      {t.name}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#0058be] font-bold text-[11px]">#academic-research</span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-[11px]">#lumis-ai</span>
                  </>
                )}
              </div>
            </div>

            {/* Abstract / Description */}
            <div>
              <span className="text-[11px] font-bold text-[#727785] uppercase tracking-wider block mb-2">Tóm tắt / Mô tả tài liệu</span>
              <p className="text-[13px] text-[#424754] leading-relaxed bg-[#f8f9ff] p-3 rounded-xl border border-[#c2c6d6]/30">
                {doc.description || "Tài liệu này chưa có mô tả chi tiết từ tác giả. Hãy phân tích với AI Trợ lý học thuật để trích xuất ngay các luận điểm và khái niệm cốt lõi trong tài liệu này."}
              </p>
            </div>

            <div className="h-[1px] bg-[#c2c6d6]/30 w-full" />

            {/* ─── Ratings & Academic Discussion Section ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#727785] uppercase tracking-wider block">Đánh giá & Thảo luận</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-amber-500">
                      <Star size={16} className="fill-amber-400" />
                      <span className="text-[16px] font-extrabold text-[#121c2a] ml-1.5">
                        {ratingsData.average ? ratingsData.average.toFixed(1) : "5.0"}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#727785] font-medium">
                      ({ratingsData.total} nhận xét)
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Input Form */}
              <form onSubmit={handleAddReview} className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#121c2a]">Gửi nhận xét của bạn</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-0.5 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star size={16} className={cn(star <= userRating ? "fill-amber-400 text-amber-500" : "text-gray-300")} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Chia sẻ quan điểm, câu hỏi hoặc đánh giá học thuật của bạn về tài liệu này..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#c2c6d6]/60 text-[13px] outline-none focus:border-[#0058be] transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[12px] shadow-sm transition-all disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Đăng nhận xét
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3 pt-2">
                {loadingRatings ? (
                  <div className="flex justify-center py-6 text-[#727785]">
                    <Loader2 size={20} className="animate-spin text-[#0058be]" />
                  </div>
                ) : ratingsData.items.length === 0 ? (
                  <p className="text-[13px] text-[#727785] text-center py-6 italic">
                    Chưa có bình luận nào. Hãy là người đầu tiên thảo luận về tài liệu này!
                  </p>
                ) : (
                  ratingsData.items.map((rev: any) => {
                    const ownReview = isOwnReview(rev)
                    const isEditing = editingReviewId === String(rev.id || "current-user-review")

                    return (
                      <div key={rev.id || `${getReviewUserId(rev)}-${rev.createdAt}`} className="bg-[#f8f9ff] border border-[#c2c6d6]/30 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[#0058be] text-white font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
                              {rev.user?.name ? rev.user.name.charAt(0) : "U"}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[13px] font-bold text-[#121c2a] truncate block">{rev.user?.name || "Lumis Scholar"}</span>
                              {ownReview && <span className="text-[10px] font-bold text-[#0058be]">Bình luận của bạn</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} size={12} className="fill-amber-400" />
                              ))}
                            </div>
                            {ownReview && !isEditing && (
                              <button
                                type="button"
                                onClick={() => startEditReview(rev)}
                                className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-[#0058be] border border-[#c2c6d6]/50 hover:bg-[#eff4ff] transition-colors"
                              >
                                <Pencil size={12} /> Sửa
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <form onSubmit={handleUpdateReview} className="ml-8 rounded-2xl border border-[#0058be]/20 bg-white p-3 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[12px] font-bold text-[#121c2a]">Chỉnh sửa đánh giá</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="p-0.5 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    <Star size={16} className={cn(star <= editRating ? "fill-amber-400 text-amber-500" : "text-gray-300")} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              placeholder="Cập nhật bình luận của bạn..."
                              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/60 text-[13px] outline-none focus:border-[#0058be] transition-all resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditReview}
                                disabled={updatingReview}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#424754] font-bold text-[12px] transition-colors disabled:opacity-50"
                              >
                                <X size={13} /> Hủy
                              </button>
                              <button
                                type="submit"
                                disabled={updatingReview}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[12px] shadow-sm transition-all disabled:opacity-50"
                              >
                                {updatingReview ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Lưu thay đổi
                              </button>
                            </div>
                          </form>
                        ) : (
                          rev.comment && (
                            <p className="text-[13px] text-[#424754] leading-relaxed pl-8">
                              {rev.comment}
                            </p>
                          )
                        )}

                        <span className="text-[10px] text-[#727785] block text-right">
                          {new Date(rev.updatedAt || rev.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}




