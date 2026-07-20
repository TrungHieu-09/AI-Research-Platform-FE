"use client"

import * as React from "react"
import {
  FileText, Eye, Clock, CheckCircle, XCircle, ChevronLeft, Download,
  Share2, MoreVertical, BookOpen, User, Info, Loader2, CheckCircle2, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const { token } = useAuth()
  const [docId, setDocId] = React.useState<string>("")
  const [doc, setDoc] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [moderating, setModerating] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [showRejectInput, setShowRejectInput] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  React.useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setDocId(resolved.id)
    })
  }, [params])

  const fetchDocument = React.useCallback(async (id: string) => {
    if (!token || !id) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDoc(data)
      } else {
        setError("Không tìm thấy tài liệu hoặc bạn không có quyền truy cập.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ khi truy xuất tài liệu.")
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (docId) fetchDocument(docId)
  }, [docId, fetchDocument])

  const canModerateTo = (status: "APPROVED" | "REJECTED") => {
    if (!doc) return false
    const currentStatus = String(doc.status || "").toUpperCase()
    if (status === "APPROVED") return ["PENDING", "REJECTED"].includes(currentStatus)
    return ["PENDING", "APPROVED"].includes(currentStatus)
  }

  const handleModerate = async (status: "APPROVED" | "REJECTED") => {
    if (!docId || !token) return
    if (!canModerateTo(status)) {
      showToast(status === "REJECTED" ? "Chỉ tài liệu chờ duyệt hoặc đã duyệt mới có thể bị từ chối/gỡ công khai." : "Chỉ tài liệu chờ duyệt hoặc đã bị từ chối mới có thể được duyệt/công khai lại.", "error")
      return
    }
    if (status === "REJECTED" && !rejectionReason.trim()) {
      showToast("Vui lòng nhập lý do từ chối tài liệu.", "error")
      return
    }
    setModerating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${docId}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision: status, action: status, status, rejectionReason: rejectionReason.trim() || undefined, reason: rejectionReason.trim() || undefined })
      })
      if (res.ok) {
        showToast(`Đã ${status === "APPROVED" ? "Duyệt" : "Từ chối/gỡ công khai"} tài liệu thành công!`, "success")
        setShowRejectInput(false)
        fetchDocument(docId)
      } else {
        const err = await res.json().catch(() => ({}))
        const message = String(err.error || err.message || "")
        showToast(
          message || "Lỗi kiểm duyệt tài liệu.",
          "error"
        )
      }
    } catch (e) {
      showToast("Lỗi kết nối kiểm duyệt.", "error")
    } finally {
      setModerating(false)
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {toastMessage && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-white font-semibold text-[13px] animate-in slide-in-from-bottom-2",
          toastMessage.type === "success" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
        )}>
          <CheckCircle2 size={18} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/documents" className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-[#121c2a]">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              {loading ? "Đang tải chi tiết..." : doc?.title || "Chi Tiết Tài Liệu"}
            </h1>
            <p className="text-[#727785] font-medium text-[14px]">Kiểm duyệt chất lượng và phân tích tài liệu nghiên cứu học thuật.</p>
          </div>
        </div>

        {doc && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleModerate("APPROVED")}
              disabled={moderating || !canModerateTo("APPROVED")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all disabled:opacity-50"
            >
              <CheckCircle size={18} />
              <span>{doc.status === "APPROVED" ? "Đã Duyệt" : doc.status === "REJECTED" ? "Công Khai Lại" : "Duyệt Công Khai"}</span>
            </button>
            <button
              onClick={() => setShowRejectInput(!showRejectInput)}
              disabled={moderating || !canModerateTo("REJECTED")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <XCircle size={18} />
              <span>{doc.status === "REJECTED" ? "Đã Từ Chối" : doc.status === "APPROVED" ? "Từ Chối / Gỡ" : "Từ Chối"}</span>
            </button>
          </div>
        )}
      </div>

      {showRejectInput && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
          <label className="text-[13px] font-bold text-red-800 block">{doc?.status === "APPROVED" ? "Lý do gỡ công khai (Gửi thông báo về cho sinh viên):" : "Lý do từ chối tài liệu (Gửi thông báo về cho sinh viên):"}</label>
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={doc?.status === "APPROVED" ? "Ví dụ: Gỡ khỏi diễn đàn vì tài liệu cần rà soát lại..." : "Ví dụ: Tài liệu trùng lặp, hình ảnh mờ, vi phạm bản quyền..."}
            className="w-full px-4 py-2.5 rounded-xl border border-red-300 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRejectInput(false)} className="px-4 py-1.5 text-[12px] font-bold text-[#727785] hover:bg-gray-200 rounded-xl">Hủy</button>
            <button onClick={() => handleModerate("REJECTED")} disabled={moderating || !rejectionReason.trim()} className="px-5 py-1.5 text-[12px] font-bold bg-red-600 text-white rounded-xl shadow hover:bg-red-700 disabled:opacity-50">{doc?.status === "APPROVED" ? "Xác nhận Gỡ công khai" : "Xác nhận Từ Chối"}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={32} className="animate-spin text-[#0058be]" />
          <p className="text-[13px] font-medium">Đang truy xuất thông tin tài liệu từ máy chủ...</p>
        </div>
      ) : error || !doc ? (
        <div className="py-24 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={40} className="mx-auto text-red-500" />
          <p className="text-[16px] font-bold text-[#121c2a]">{error || "Tài liệu không tồn tại"}</p>
          <Link href="/admin/documents" className="inline-block px-5 py-2 bg-[#0058be] text-white font-bold text-[13px] rounded-xl">Quay lại danh sách</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl min-h-[600px] flex flex-col items-center justify-start p-8 border border-[#c2c6d6]/40 shadow-sm relative overflow-hidden">
              <div className="w-full h-14 bg-[#f8f9ff] rounded-2xl border border-[#c2c6d6]/30 flex items-center px-5 justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg uppercase">
                    {doc.mimeType?.includes("pdf") ? "PDF" : doc.mimeType?.includes("word") ? "DOCX" : "DOC"}
                  </span>
                  <span className="text-sm font-semibold text-[#121c2a] truncate max-w-[300px]">{doc.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0058be] text-white text-xs font-bold hover:bg-[#004ca3] transition-colors"
                  >
                    <Download size={14} /> Tải nguyên bản
                  </a>
                </div>
              </div>

              {/* Document Text / Metadata content preview */}
              <div className="w-full max-w-2xl bg-[#f8f9ff]/70 border border-[#c2c6d6]/30 rounded-2xl p-8 text-left space-y-4">
                <h4 className="font-bold text-[#121c2a] text-lg border-b pb-3 border-[#c2c6d6]/30">Nội Dung / Trích Xuất Văn Bản</h4>
                <div className="text-[14px] text-[#424754] leading-relaxed whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
                  {doc.content || "Tài liệu này là tệp đính kèm học thuật dạng nhị phân hoặc chưa có văn bản trích xuất thuần túy. Vui lòng bấm nút Tải nguyên bản ở trên để xem trực tiếp."}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#c2c6d6]/40 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#121c2a] border-b pb-4 border-[#c2c6d6]/30">Thông Tin Bài Đăng</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-[#727785] block uppercase tracking-wide">Trạng thái</span>
                  <span className={cn(
                    "mt-1 px-3 py-1 rounded-full text-xs font-bold inline-block",
                    doc.status === "APPROVED" ? "bg-green-100 text-green-800" : doc.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {doc.status === "APPROVED" ? "Đã Duyệt" : doc.status === "REJECTED" ? "Từ Chối" : "Đang Chờ Duyệt"}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#727785] block uppercase tracking-wide">Người tải lên</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-[#0058be]" />
                    <span className="font-semibold text-[#121c2a]">{doc.user?.name || doc.user?.email || "Sinh viên"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#727785] block uppercase tracking-wide">Lĩnh vực nghiên cứu</span>
                  <div className="flex items-center gap-2 mt-1">
                    <BookOpen size={16} className="text-[#0058be]" />
                    <span className="font-semibold text-[#121c2a]">{doc.subject?.name || doc.subject?.code || "Chung"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#727785] block uppercase tracking-wide">Ngày gửi</span>
                  <span className="mt-1 font-semibold text-[#121c2a] block">
                    {new Date(doc.createdAt).toLocaleDateString("vi-VN")} {new Date(doc.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#727785] block uppercase tracking-wide">Từ khóa / Thẻ</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.isArray(doc.tags) && doc.tags.length > 0 ? doc.tags.map((t: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#eff4ff] text-[#0058be] rounded-lg text-xs font-bold">
                        #{t}
                      </span>
                    )) : <span className="text-gray-400 text-xs">Không có thẻ</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


