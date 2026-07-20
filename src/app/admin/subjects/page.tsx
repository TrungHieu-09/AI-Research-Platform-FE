"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  BookOpen, Plus, Search, Filter, Trash2, CheckCircle, XCircle,
  AlertCircle, CheckCircle2, Loader2, RefreshCw, Edit, Hash, Target, X
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export default function SubjectsPage() {
  const router = useRouter()
  const { token, user } = useAuth()

  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal & Toast state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCode, setNewCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
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
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Research Areas Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Research Area Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
/* 
 const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}const adminHeaders = useMemo(() => ({
 const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
   const adminHeaders = useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
  }), [token, user?.id])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (statusFilter !== "ALL") params.append("status", statusFilter)

      const res = await fetch(`${baseUrl}/api/subjects?${params.toString()}`, {
        headers: adminHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []))
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách lĩnh vực nghiên cứu từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, adminHeaders])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Handle Create Research Area
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim() || !newCode.trim()) return
    setCreating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          status: "ACTIVE"
        })
      })

      if (res.ok) {
        showToast("Đã thêm lĩnh vực nghiên cứu mới vào danh mục học thuật!", "success")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewCode("")
        fetchSubjects()
      } else {
        const err = await res.json()
        showToast(err.error || "Mã lĩnh vực nghiên cứu hoặc tên đã tồn tại trong hệ thống.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Research Area
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực nghiên cứu "${name}" không?`)) return
    setDeletingSubjectId(id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: adminHeaders
      })

      if (res.ok) {
        setSubjects((current) => current.filter((subject) => subject.id !== id))
        showToast(`Đã xóa lĩnh vực nghiên cứu ${name} thành công.`, "success")
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Không thể xóa lĩnh vực nghiên cứu này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản lý lĩnh vực nghiên cứu
            </h1>
            <button
              onClick={fetchSubjects}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tổ chức cơ sở dữ liệu lĩnh vực nghiên cứu, mã lĩnh vực giúp AI phân loại tài liệu chính xác cho sinh viên.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm lĩnh vực mới</span>
        </button>
      </div>

  
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { fetchSubjects(); } }}
            placeholder="Tìm kiếm lĩnh vực nghiên cứu theo tên (ví dụ: Toán cao cấp, AI, Mạng máy tính...)"
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">✅ Hoạt động (Active)</option>
            <option value="SUSPENDED">⏸️ Đã tạm dừng (Suspended)</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải danh mục lĩnh vực nghiên cứu hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchSubjects} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-16 text-center text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <BookOpen size={36} className="mx-auto text-[#c2c6d6]" />
          <p className="text-[15px] font-bold text-[#121c2a]">Chưa có lĩnh vực nghiên cứu nào trong danh mục</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
          >
            + Khởi tạo lĩnh vực nghiên cứu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#c2c6d6]/40 hover:border-[#0058be] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm shadow-[#0058be]/10">
                    <BookOpen size={20} />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1",
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status === "ACTIVE" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {sub.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-1" style={{ fontFamily: "Geist, sans-serif" }}>
                    {sub.name}
                  </h3>
                  <p className="text-[12px] font-extrabold text-[#727785] mt-0.5 tracking-wider uppercase flex items-center gap-1">
                    <Hash size={12} className="text-[#0058be]" /> Mã lĩnh vực: <span className="text-[#0058be]">{sub.code}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#c2c6d6]/30 flex items-center justify-between">
                <span className="text-[12px] text-[#727785] font-semibold">
                  Tài liệu: <strong className="text-[#121c2a]">{sub._count?.documents || sub.documentsCount || 0}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    disabled={deletingSubjectId === sub.id}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa lĩnh vực nghiên cứu"
                  >
                    {deletingSubjectId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                RESEARCH TAXONOMY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Khởi tạo Lĩnh vực nghiên cứu
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Thêm lĩnh vực nghiên cứu mới để sinh viên phân loại tài liệu tải lên chính xác.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-1 font-sans">
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Tên lĩnh vực nghiên cứu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Trí tuệ nhân tạo, Cấu trúc dữ liệu..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2">Mã lĩnh vực <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: AI, HCI, NLP, DATA..."
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[14px] font-bold text-[#0058be] outline-none focus:border-[#0058be] transition-colors uppercase"
                />
                <p className="text-[12px] text-[#727785] mt-1.5">Mã lĩnh vực phải là duy nhất trên toàn hệ thống.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md disabled:opacity-40 flex items-center gap-2 transition-all"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Tạo lĩnh vực</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
 */






