"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search, Filter, Shield, User as UserIcon, UserCheck, UserX,
  Plus, Eye, Ban, CheckCircle2, Trash2, X, AlertTriangle,
  ChevronLeft, ChevronRight, Loader2, Crown, RefreshCw
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export default function UsersPage() {
  const router = useRouter()
  const { token, user: currentUser } = useAuth()

  const [users, setUsers] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Modals & Toast state
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      if (roleFilter !== "All") params.append("role", roleFilter.toUpperCase())
      if (statusFilter !== "All") params.append("status", statusFilter.toUpperCase())

      const res = await fetch(`${baseUrl}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data.items) ? data.items : [])
        setTotalUsers(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách người dùng.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [token, currentPage, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter local search term
  const displayedUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    return users.filter((u) => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  // Handle Update User (Role / Status / Tier)
  const handleUpdateUser = async (userId: string, updates: { role?: string; status?: string; tier?: string }) => {
    if (!token) return
    setUpdating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        showToast("Cập nhật thông tin tài khoản thành công!", "success")
        setIsEditModalOpen(false)
        fetchUsers()
      } else {
        const err = await res.json()
        showToast(err.error || "Bạn không thể thao tác với tài khoản này.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-8">
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
              <AlertTriangle className="text-red-600 shrink-0" size={18} />
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
              Quản lý Người dùng & Phân quyền
            </h1>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Quản lý tài khoản sinh viên, cấp quyền truy cập cao cấp (`Premium`) hoặc phân quyền quản trị (`Admin`).
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#c2c6d6]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setCurrentPage(1); fetchUsers(); } }}
            placeholder="Tìm kiếm theo tên hoặc địa chỉ email sinh viên..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="STUDENT">Sinh viên (Student)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] cursor-pointer"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="SUSPENDED">Đã khóa (Suspended)</option>
            <option value="UNVERIFIED">Chưa xác thực</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785]">
            <Loader2 size={36} className="animate-spin text-[#0058be]" />
            <p className="text-[14px] font-semibold">Đang tải danh sách tài khoản hệ thống...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600 space-y-3">
            <AlertTriangle size={32} className="mx-auto" />
            <p className="text-[14px] font-bold">{error}</p>
            <button onClick={fetchUsers} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-16 text-center text-[#727785] space-y-3">
            <UserIcon size={36} className="mx-auto text-[#c2c6d6]" />
            <p className="text-[15px] font-bold text-[#121c2a]">Không tìm thấy người dùng nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/40 text-[#727785] text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Tài khoản & Email</th>
                  <th className="py-4 px-6">Vai trò (Role)</th>
                  <th className="py-4 px-6">Gói AI (Tier)</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Tài liệu / Phiên AI</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/30 text-[13px]">
                {displayedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f9ff]/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#0058be] font-extrabold text-[13px] flex items-center justify-center shrink-0 uppercase">
                          {u.name ? u.name.charAt(0) : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#121c2a] truncate">{u.name || "Chưa đặt tên"}</p>
                          <p className="text-[12px] text-[#727785] truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1",
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-[#f8f9ff] text-[#424754] border border-[#c2c6d6]/60"
                      )}>
                        {u.role === "ADMIN" && <Shield size={12} />}
                        {u.role === "ADMIN" ? "Quản trị viên" : "Sinh viên"}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1",
                        u.tier === "PREMIUM" ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm" : "bg-gray-100 text-gray-600"
                      )}>
                        {u.tier === "PREMIUM" && <Crown size={12} className="text-amber-600" />}
                        {u.tier === "PREMIUM" ? "PREMIUM" : "FREE"}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5",
                        u.status === "ACTIVE" ? "bg-green-100 text-green-700" : u.status === "SUSPENDED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", u.status === "ACTIVE" ? "bg-green-600" : u.status === "SUSPENDED" ? "bg-red-600" : "bg-gray-500")} />
                        {u.status === "ACTIVE" ? "Hoạt động" : u.status === "SUSPENDED" ? "Đã khóa" : "Chưa xác thực"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-[#424754]">
                      <span className="text-[#0058be]">{u._count?.documents || 0}</span> tài liệu / <span className="text-purple-600">{u._count?.chatSessions || 0}</span> phòng AI
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dee9fc] text-[#0058be] font-bold text-[12px] transition-colors"
                      >
                        Phân quyền & Tùy chỉnh
                      </button>
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
            <span>Hiển thị trang {currentPage} / {totalPages} (Tổng {totalUsers} người dùng)</span>
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

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-2xl p-6 sm:p-8 w-full max-w-[620px] max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-[#0058be] uppercase tracking-wider bg-[#eff4ff] px-3 py-1 rounded-full">
                ADMIN PRIVILEGES
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-3 font-sans">
                Điều chỉnh quyền tài khoản
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#727785] mt-1.5 font-sans">
                Tài khoản: <strong className="text-[#121c2a]">{selectedUser.name} ({selectedUser.email})</strong>
              </p>
            </div>

            <div className="space-y-5 pt-1">
              {/* Role setting */}
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2 font-sans">Vai trò hệ thống (Role)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { role: "STUDENT" })}
                    disabled={updating || selectedUser.role === "STUDENT"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.role === "STUDENT" ? "bg-[#0058be] text-white border-[#0058be] shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <span>Sinh viên</span>
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { role: "ADMIN" })}
                    disabled={updating || selectedUser.role === "ADMIN"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.role === "ADMIN" ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <Shield size={16} className="shrink-0" /> <span>Quản trị viên</span>
                  </button>
                </div>
              </div>

              {/* Tier setting */}
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2 font-sans">Gói tài khoản AI (Tier)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { tier: "FREE" })}
                    disabled={updating || selectedUser.tier === "FREE"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.tier === "FREE" ? "bg-gray-700 text-white border-gray-700 shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <span>FREE (Tiêu chuẩn)</span>
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { tier: "PREMIUM" })}
                    disabled={updating || selectedUser.tier === "PREMIUM"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.tier === "PREMIUM" ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <Crown size={16} className="shrink-0" /> <span>PREMIUM (Vô giới hạn)</span>
                  </button>
                </div>
              </div>

              {/* Status setting */}
              <div>
                <label className="text-[13px] sm:text-[14px] font-bold text-[#424754] block mb-2 font-sans">Trạng thái khóa / mở khóa</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { status: "ACTIVE" })}
                    disabled={updating || selectedUser.status === "ACTIVE"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.status === "ACTIVE" ? "bg-green-600 text-white border-green-600 shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <UserCheck size={16} className="shrink-0" /> <span>Hoạt động</span>
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, { status: "SUSPENDED" })}
                    disabled={updating || selectedUser.status === "SUSPENDED"}
                    className={cn(
                      "py-3.5 px-4 rounded-xl font-bold text-[14px] border transition-all flex items-center justify-center gap-2 text-center",
                      selectedUser.status === "SUSPENDED" ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-[#f8f9ff] text-[#424754] border-[#c2c6d6]/60 hover:bg-gray-100"
                    )}
                  >
                    <UserX size={16} className="shrink-0" /> <span>Khóa tài khoản</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
