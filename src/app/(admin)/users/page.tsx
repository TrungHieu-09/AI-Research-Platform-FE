"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Shield,
  User as UserIcon,
  UserCheck,
  UserX,
  Plus,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SYSTEM_USERS, UserDetailItem } from "./usersData"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserDetailItem[]>(SYSTEM_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserDetailItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form states for Add User
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<UserDetailItem["role"]>("Student")
  const [newDepartment, setNewDepartment] = useState("Computer Science")

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchRole = roleFilter === "All" || u.role === roleFilter
      const matchStatus = statusFilter === "All" || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredUsers, currentPage])

  // Stats
  const totalCount = users.length
  const activeCount = users.filter((u) => u.status === "Active").length
  const suspendedCount = users.filter((u) => u.status === "Suspended").length

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const newUserItem: UserDetailItem = {
      id: Date.now(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      department: newDepartment,
      avatar: newName.trim().slice(0, 2).toUpperCase(),
      phone: "+84 900 000 000",
      location: "FPT University HOL, Hanoi",
      bio: "Thành viên mới của hệ thống AI Research Platform.",
      activity: [
        { action: "Tạo tài khoản", detail: "Được khởi tạo bởi Admin", time: "Vừa xong" }
      ]
    }

    setUsers([newUserItem, ...users])
    setIsAddModalOpen(false)
    setNewName("")
    setNewEmail("")
    setNewRole("Student")
    showToast(`Tạo thành công tài khoản cho ${newUserItem.name}`)
  }

  // Toggle Status Handler
  const handleToggleStatus = (user: UserDetailItem) => {
    const nextStatus = user.status === "Active" ? "Suspended" : "Active"
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)))
    showToast(
      nextStatus === "Active"
        ? `Đã kích hoạt lại tài khoản ${user.name}`
        : `Đã tạm khóa tài khoản ${user.name}`
    )
  }

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingUser) return
    setUsers(users.filter((u) => u.id !== deletingUser.id))
    showToast(`Đã xóa vĩnh viễn tài khoản ${deletingUser.name}`)
    setDeletingUser(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121c2a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <span className="text-[13px] font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            User Management
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Quản lý danh sách người dùng, phân quyền truy cập và kiểm soát tài khoản trong hệ thống Lumis AI.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-5 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#c2c6d6]/40 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#eff4ff] text-[#0058be] rounded-2xl">
            <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Tổng tài khoản</p>
            <h4 className="text-2xl font-bold text-[#121c2a]">{totalCount}</h4>
          </div>
        </div>
        <div className="bg-white border border-[#c2c6d6]/40 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Đang hoạt động</p>
            <h4 className="text-2xl font-bold text-[#121c2a]">{activeCount}</h4>
          </div>
        </div>
        <div className="bg-white border border-[#c2c6d6]/40 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Đang tạm khóa</p>
            <h4 className="text-2xl font-bold text-[#121c2a]">{suspendedCount}</h4>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-[#c2c6d6]/40 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm kiếm theo tên, email hoặc bộ môn..."
            className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-2.5 pl-11 pr-4 text-[14px] text-[#121c2a] placeholder:text-[#727785] focus:outline-none focus:border-[#0058be] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#727785]" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-3.5 py-2 text-[13px] font-bold text-[#121c2a] focus:outline-none focus:border-[#0058be]"
            >
              <option value="All">Tất cả vai trò</option>
              <option value="Student">Sinh viên (Student)</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-3.5 py-2 text-[13px] font-bold text-[#121c2a] focus:outline-none focus:border-[#0058be]"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Suspended">Đã tạm khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/30 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Đơn vị / Bộ môn</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c6d6]/20">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#727785]">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="hover:bg-[#f8f9ff] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] flex items-center justify-center font-bold text-[#0058be] text-[13px] shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-[#121c2a] leading-tight group-hover:text-[#0058be] transition-colors">
                            {user.name}
                          </p>
                          <p className="text-[12px] text-[#727785]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#424754]">
                      {user.department || "Chưa xác định"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#eff4ff] text-[#0058be]">
                        <Shield size={12} className="text-[#0058be]" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200/80"
                            : "bg-red-50 text-red-700 border-red-200/80"
                        }`}
                      >
                        {user.status === "Active" ? (
                          <>
                            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                            <span>Hoạt động</span>
                          </>
                        ) : (
                          <>
                            <Ban size={14} className="text-red-600 shrink-0" />
                            <span>Tạm khóa</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#424754]">
                      {user.joinDate}
                    </td>
                    <td
                      className="px-6 py-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Action: View User Info */}
                        <button
                          onClick={() => router.push(`/users/${user.id}`)}
                          title="Xem thông tin người dùng"
                          className="p-2 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Quick Action: Suspend/Activate */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === "Active" ? "Trạng thái: Hoạt động (Nhấn để khóa)" : "Trạng thái: Tạm khóa (Nhấn để mở khóa)"}
                          className={`p-2 rounded-xl transition-colors ${
                            user.status === "Active"
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                        >
                          {user.status === "Active" ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        </button>

                        {/* Quick Action: Delete */}
                        <button
                          onClick={() => setDeletingUser(user)}
                          title="Xóa tài khoản"
                          className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#c2c6d6]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#727785] font-medium">
            Hiển thị{" "}
            <span className="font-bold text-[#121c2a]">
              {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            đến{" "}
            <span className="font-bold text-[#121c2a]">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{" "}
            trong tổng số <span className="font-bold text-[#121c2a]">{filteredUsers.length}</span> người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 bg-white border border-[#c2c6d6]/50 rounded-xl text-[12px] font-bold text-[#424754] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </button>
            <span className="text-[12px] font-bold text-[#121c2a] px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3.5 py-1.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-[12px] font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[500px] shadow-2xl border border-[#c2c6d6]/40 my-8 shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Thêm người dùng mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-[#727785] hover:text-[#121c2a] rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-2.5 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-1.5">Email trường học (Edu Email)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ví dụ: anv@fpt.edu.vn"
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-2.5 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-1.5">Khối / Bộ môn</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Ví dụ: Computer Science"
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-2.5 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-1.5">Phân quyền vai trò</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserDetailItem["role"])}
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-2.5 text-[14px] font-bold text-[#121c2a] focus:border-[#0058be] outline-none"
                >
                  <option value="Student">Sinh viên (Student)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-[#c2c6d6]/50 text-[#424754] font-bold text-[13px] hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl font-bold text-[13px] shadow-md transition-all"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[440px] shadow-2xl border border-[#c2c6d6]/40 my-8 shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Xác nhận xóa tài khoản
                </h3>
                <p className="text-[12px] text-[#727785]">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-[14px] text-[#424754] mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <span className="font-bold text-[#121c2a]">{deletingUser.name}</span> ({deletingUser.email}) khỏi hệ thống Lumis không?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-5 py-2.5 rounded-2xl border border-[#c2c6d6]/50 text-[#424754] font-bold text-[13px] hover:bg-gray-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-[13px] shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


