"use client"

import * as React from "react"
import {
  BookOpen, ChevronLeft, Save, Trash2, FileText, User, Calendar,
  CheckCircle2, AlertCircle, Loader2, Edit, CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const { token } = useAuth()
  const [subId, setSubId] = React.useState<string>("")
  const [subject, setSubject] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Editable form fields
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  React.useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setSubId(resolved.id)
    })
  }, [params])

  const fetchSubject = React.useCallback(async (id: string) => {
    if (!token || !id) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSubject(data)
        setName(data.name || "")
        setCode(data.code || "")
        setDescription(data.description || "")
      } else {
        setError("Không tìm thấy thông tin lĩnh vực nghiên cứu này.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ khi tải chi tiết lĩnh vực nghiên cứu.")
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (subId) fetchSubject(subId)
  }, [subId, fetchSubject])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subId || !token) return
    if (!name.trim() || !code.trim()) {
      showToast("Tên môn và mã môn không được để trống.", "error")
      return
    }
    setSaving(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${subId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, code, description })
      })
      if (res.ok) {
        showToast("Đã lưu cập nhật lĩnh vực nghiên cứu thành công!", "success")
        fetchSubject(subId)
      } else {
        showToast("Lỗi khi cập nhật lĩnh vực nghiên cứu.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!subId || !token) return
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${subject?.name || subId}" khỏi hệ thống không?`)) return
    setDeleting(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${subId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showToast("Đã xóa lĩnh vực nghiên cứu thành công!", "success")
        setTimeout(() => router.push("/admin/subjects"), 1000)
      } else {
        showToast("Lỗi khi xóa lĩnh vực nghiên cứu. Có thể đang có tài liệu gắn với môn này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối khi xóa lĩnh vực nghiên cứu.", "error")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
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
          <Link href="/admin/subjects" className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-[#121c2a]">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              {loading ? "Đang tải lĩnh vực nghiên cứu..." : subject?.name || "Chi Tiết Môn Học"}
            </h1>
            <p className="text-[#727785] font-medium text-[14px]">Quản lý thông tin metadata, mã môn và các tài liệu liên kết.</p>
          </div>
        </div>

        {subject && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-md transition-all disabled:opacity-50 text-[13px]"
            >
              <Trash2 size={17} />
              <span>Xóa Môn Học</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={32} className="animate-spin text-[#0058be]" />
          <p className="text-[13px] font-medium">Đang truy xuất chi tiết lĩnh vực nghiên cứu từ máy chủ...</p>
        </div>
      ) : error || !subject ? (
        <div className="py-24 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={40} className="mx-auto text-red-500" />
          <p className="text-[16px] font-bold text-[#121c2a]">{error || "Lĩnh vực nghiên cứu không tồn tại"}</p>
          <Link href="/admin/subjects" className="inline-block px-5 py-2 bg-[#0058be] text-white font-bold text-[13px] rounded-xl">Quay lại danh sách</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Edit */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#c2c6d6]/40 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-[#121c2a] border-b pb-4 border-[#c2c6d6]/30" style={{ fontFamily: "Geist, sans-serif" }}>
              Cập Nhật Cấu Hình Môn Học
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#424754] uppercase tracking-wide mb-2">Tên Môn Học *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ví dụ: Artificial Intelligence"
                    className="w-full px-4 py-3 rounded-2xl border border-[#c2c6d6]/60 bg-[#f8f9ff]/50 text-[#121c2a] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#424754] uppercase tracking-wide mb-2">Mã Môn (Code) *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Ví dụ: AI302"
                    className="w-full px-4 py-3 rounded-2xl border border-[#c2c6d6]/60 bg-[#f8f9ff]/50 text-[#121c2a] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#424754] uppercase tracking-wide mb-2">Mô Tả / Đề Cương Môn Học</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mô tả tóm tắt kiến thức, mục tiêu lĩnh vực nghiên cứu và tài liệu tham khảo chính..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#c2c6d6]/60 bg-[#f8f9ff]/50 text-[#121c2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] rounded-2xl shadow-lg shadow-[#0058be]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>Lưu Cập Nhật Môn Học</span>
                </button>
              </div>
            </form>
          </div>

          {/* Associated Documents Overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#c2c6d6]/40 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#121c2a] border-b pb-4 border-[#c2c6d6]/30">Tài Liệu Đã Đăng Ký</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#0058be]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0058be] uppercase">Tổng tài liệu môn này</span>
                <span className="text-2xl font-extrabold text-[#0058be] font-mono">
                  {subject._count?.documents || subject.documents?.length || 0}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#727785] uppercase tracking-wide block">Tài liệu mới nhất</span>
                {Array.isArray(subject.documents) && subject.documents.length > 0 ? (
                  subject.documents.slice(0, 5).map((doc: any) => (
                    <Link key={doc.id} href={`/admin/documents/${doc.id}`} className="block p-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors border border-[#c2c6d6]/20">
                      <p className="text-xs font-bold text-[#121c2a] truncate">{doc.title}</p>
                      <p className="text-[11px] text-[#727785] mt-0.5">{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[#727785] italic">Chưa có bài tài liệu nào liên kết với lĩnh vực nghiên cứu này.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
