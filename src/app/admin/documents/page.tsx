"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  FileText, Eye, Download, Clock, CheckCircle, XCircle,
  Search, Plus, Filter, AlertCircle, CheckCircle2, Loader2,
  RefreshCw, Ban, ChevronLeft, ChevronRight, X
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export default function DocumentsPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [documents, setDocuments] = useState<any[]>([])
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Moderation modal state
  const [selectedDocForReject, setSelectedDocForReject] = useState<any | null>(null)
  const [selectedPrivateDoc, setSelectedPrivateDoc] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [moderatingId, setModeratingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchDocuments = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      })
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      if (visibilityFilter !== "ALL") params.append("visibility", visibilityFilter)
      if (searchTerm.trim()) params.append("search", searchTerm.trim())

      const res = await fetch(`${baseUrl}/api/admin/documents?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setDocuments(Array.isArray(data.items) ? data.items : [])
        setTotalDocuments(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách tài liệu từ máy chủ.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [token, currentPage, statusFilter, visibilityFilter, searchTerm])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])
  const isPrivateDocument = (doc: any) => String(doc?.visibility || "").toUpperCase() === "PRIVATE"

  const handleViewDocument = (doc: any) => {
    if (isPrivateDocument(doc)) {
      setSelectedPrivateDoc(doc)
      return
    }

    router.push(`/admin/documents/${doc.id}`)
  }

  const canRejectDocument = (doc: any) => doc.visibility === "PUBLIC" && ["PENDING", "APPROVED"].includes(String(doc.status || "").toUpperCase())
  const canRepublishDocument = (doc: any) => doc.visibility === "PUBLIC" && String(doc.status || "").toUpperCase() === "REJECTED"

  const openRejectModal = (doc: any) => {
    if (!canRejectDocument(doc)) {
      showToast("Chỉ tài liệu công khai đang chờ duyệt hoặc đã duyệt mới có thể bị từ chối.", "error")
      return
    }

    setSelectedDocForReject(doc)
  }

  // Handle Moderate (Approve / Reject)
  const handleModerate = async (docId: string, decision: "APPROVED" | "REJECTED", reason?: string) => {
    if (!token) return
    setModeratingId(docId)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${docId}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          decision,
          action: decision,
          status: decision,
          rejectionReason: reason?.trim() || undefined,
          reason: reason?.trim() || undefined,
        })
      })

      if (res.ok) {
        showToast(decision === "APPROVED" ? "Đã duyệt bài đăng/tài liệu thành công!" : "Đã từ chối/gỡ công khai bài đăng tài liệu.", "success")
        setSelectedDocForReject(null)
        setRejectionReason("")
        fetchDocuments()
      } else {
        const err = await res.json().catch(() => ({}))
        const message = String(err.error || err.message || "")
        showToast(
          message || "Không thể thực hiện thao tác kiểm duyệt.",
          "error"
        )
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setModeratingId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-[13px] font-semibold max-w-sm",
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

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Kiểm Duyệt & Quản Lý Tài Liệu
            </h1>
            <button
              onClick={fetchDocuments}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Duyệt hoặc từ chối các bài đăng chia sẻ công khai lên diễn đàn, quản lý vòng đời tài liệu toàn hệ thống.
          </p>
        </div>
        <Link 
          href="/admin/documents/upload"
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Đăng Tài Liệu Mới</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setCurrentPage(1); fetchDocuments(); } }}
            placeholder="Tìm kiếm theo tiêu đề tài liệu, tên hoặc email tác giả..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">⏳ Chờ duyệt (Pending)</option>
            <option value="APPROVED">✅ Đã duyệt (Approved)</option>
            <option value="REJECTED">❌ Đã từ chối (Rejected)</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => { setVisibilityFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả quyền hạn</option>
            <option value="PUBLIC">🌐 Công khai (Public)</option>
            <option value="PRIVATE">🔒 Riêng tư (Private)</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785]">
            <Loader2 size={36} className="animate-spin text-[#0058be]" />
            <p className="text-[14px] font-semibold">Đang tải danh sách tài khoản tài liệu...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600 space-y-3">
            <AlertCircle size={32} className="mx-auto" />
            <p className="text-[14px] font-bold">{error}</p>
            <button onClick={fetchDocuments} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center text-[#727785] space-y-3">
            <FileText size={36} className="mx-auto text-[#c2c6d6]" />
            <p className="text-[15px] font-bold text-[#121c2a]">Không có tài liệu nào trong danh sách hiện tại</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/40 text-[#727785] text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Tài liệu & Tác giả</th>
                  <th className="py-4 px-6">Lĩnh vực nghiên cứu</th>
                  <th className="py-4 px-6">Định dạng</th>
                  <th className="py-4 px-6">Quyền hạn & Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác Kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/30 text-[13px]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f8f9ff]/70 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                                                    <button
                            type="button"
                            onClick={() => handleViewDocument(doc)}
                            className="font-bold text-[#121c2a] hover:text-[#0058be] transition-colors line-clamp-1 text-left"
                          >
                            {doc.title}
                          </button>
                          <p className="text-[12px] text-[#727785] truncate">
                            Bởi: <strong className="text-[#424754]">{doc.owner?.name || doc.owner?.email || "Sinh viên"}</strong> · {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-[#424754]">
                      <span className="bg-[#f8f9ff] px-2.5 py-1 rounded-lg border border-[#c2c6d6]/40 text-[11px]">
                        {doc.subject?.name || doc.subject?.code || "Chung"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-[#727785] text-[12px] font-medium">
                      {(doc.fileSize / 1024 / 1024 || 1.2).toFixed(2)} MB · {doc.pageCount || 1} trang
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1",
                          doc.visibility === "PUBLIC" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {doc.visibility === "PUBLIC" ? "🌐 Công khai" : "🔒 Riêng tư"}
                        </span>

                        {doc.visibility === "PUBLIC" && (
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1",
                            doc.status === "APPROVED" ? "bg-green-100 text-green-700" : doc.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                          )}>
                            {doc.status === "APPROVED" ? <CheckCircle size={12} /> : doc.status === "REJECTED" ? <XCircle size={12} /> : <Clock size={12} />}
                            {doc.status === "APPROVED" ? "Đã duyệt" : doc.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"}
                          </span>
                        )}
                      </div>
                      {doc.rejectionReason && (
                        <p className="text-[11px] text-red-600 mt-1 line-clamp-1 italic">Lý do: {doc.rejectionReason}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                                                <button
                          type="button"
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 bg-[#eff4ff] text-[#0058be] hover:bg-[#dee9fc] rounded-xl transition-colors"
                          title={isPrivateDocument(doc) ? "Không được xem tài liệu riêng tư" : "Xem chi tiết & kiểm duyệt tài liệu"}
                        >
                          <Eye size={15} />
                        </button>

                        {doc.visibility === "PUBLIC" && doc.status === "PENDING" && (
                          <button
                            onClick={() => handleModerate(doc.id, "APPROVED")}
                            disabled={moderatingId === doc.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[12px] rounded-xl shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Duyệt cho phép hiển thị trên Diễn đàn"
                          >
                            <CheckCircle size={13} /> Duyệt
                          </button>
                        )}

                        {canRejectDocument(doc) && (
                          <button
                            onClick={() => openRejectModal(doc)}
                            disabled={moderatingId === doc.id}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[12px] rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50"
                            title={doc.status === "APPROVED" ? "Từ chối/gỡ tài liệu đã duyệt khỏi diễn đàn" : "Từ chối bài chia sẻ"}
                          >
                            <Ban size={13} /> {doc.status === "APPROVED" ? "Gỡ công khai" : "Từ chối"}
                          </button>
                        )}
                        {canRepublishDocument(doc) && (
                          <button
                            onClick={() => handleModerate(doc.id, "APPROVED")}
                            disabled={moderatingId === doc.id}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[12px] rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Công khai lại tài liệu đã bị từ chối"
                          >
                            <CheckCircle size={13} /> Công khai lại
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9ff] border-t border-[#c2c6d6]/40 text-[13px] font-semibold text-[#424754]">
            <span>Hiển thị trang {currentPage} / {totalPages} (Tổng {totalDocuments} tài liệu)</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-[#c2c6d6]/60 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-[#c2c6d6]/60 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Private Document Notice Modal */}
      {selectedPrivateDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div
            className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border border-[#c2c6d6]/40 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setSelectedPrivateDoc(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#727785] transition-colors hover:bg-gray-100 hover:text-[#121c2a]"
              aria-label="Đóng thông báo tài liệu riêng tư"
            >
              <X size={18} />
            </button>

            <div className="bg-gradient-to-br from-[#eff4ff] via-white to-[#f8f9ff] px-6 pb-5 pt-7 sm:px-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0058be]/10 text-[#0058be] shadow-sm">
                <Eye size={26} />
              </div>
              <h3 className="pr-10 text-2xl font-extrabold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Không thể xem tài liệu riêng tư
              </h3>
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                Tài liệu này đang ở chế độ <strong>Riêng tư</strong>, chỉ chủ sở hữu mới có quyền mở nội dung gốc. Admin chỉ quản lý thông tin hệ thống và kiểm duyệt tài liệu công khai.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5 sm:px-8">
              <div className="rounded-2xl border border-[#c2c6d6]/40 bg-[#f8f9ff] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#727785]">Tài liệu</p>
                <p className="mt-1 break-words text-[15px] font-extrabold text-[#121c2a]">{selectedPrivateDoc.title || "Tài liệu không tên"}</p>
                <p className="mt-2 text-[12px] font-medium text-[#727785]">
                  Chủ sở hữu: <span className="font-bold text-[#424754]">{selectedPrivateDoc.owner?.name || selectedPrivateDoc.owner?.email || "Sinh viên"}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-[13px] font-semibold leading-relaxed">
                    Nếu cần kiểm tra nội dung file riêng tư, hãy yêu cầu sinh viên chuyển tài liệu sang chế độ công khai hoặc gửi quyền truy cập hợp lệ.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPrivateDoc(null)}
                  className="rounded-xl bg-[#0058be] px-6 py-2.5 text-[14px] font-bold text-white shadow-md shadow-[#0058be]/20 transition-all hover:bg-[#004ca3]"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reject Modal */}
      {selectedDocForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div
            className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto"
            style={{ width: "min(92vw, 560px)", minWidth: "320px" }}
          >
            <button
              onClick={() => setSelectedDocForReject(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-red-700 leading-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                {selectedDocForReject.status === "APPROVED" ? "Gỡ tài liệu khỏi công khai" : "Từ chối kiểm duyệt tài liệu"}
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 break-words pr-8">
                Tài liệu: <strong className="text-[#121c2a]">{selectedDocForReject.title}</strong>
              </p>
            </div>

            <div>
              <label className="text-[13px] font-bold text-[#424754] block mb-2">{selectedDocForReject.status === "APPROVED" ? "Lý do gỡ công khai (Gửi đến sinh viên)" : "Lý do từ chối (Gửi đến sinh viên)"}</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={selectedDocForReject.status === "APPROVED" ? "Ví dụ: Gỡ khỏi diễn đàn vì tài liệu cần rà soát lại..." : "Ví dụ: Vi phạm bản quyền, định dạng mờ, không đúng chủ đề lĩnh vực nghiên cứu..."}
                className="w-full min-h-32 p-3.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] sm:text-[14px] outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDocForReject(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[13px] sm:text-[14px] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleModerate(selectedDocForReject.id, "REJECTED", rejectionReason)}
                disabled={!rejectionReason.trim() || moderatingId === selectedDocForReject.id}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] sm:text-[14px] shadow-md transition-all disabled:opacity-40"
              >
                {selectedDocForReject.status === "APPROVED" ? "Xác nhận Gỡ công khai" : "Xác nhận Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}






