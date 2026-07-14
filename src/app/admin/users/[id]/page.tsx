"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  MapPin,
  Phone,
  History,
  Ban,
  Trash2,
  CheckCircle2,
  X,
  Edit3,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { SYSTEM_USERS, UserDetailItem } from "../usersData"

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userIdNum = Number(params?.id) || 1
  const foundUser = SYSTEM_USERS.find((u) => u.id === userIdNum) || SYSTEM_USERS[0]

  const [user, setUser] = useState<UserDetailItem>(foundUser)

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit Form States
  const [editName, setEditName] = useState(user.name)
  const [editPhone, setEditPhone] = useState(user.phone)
  const [editLocation, setEditLocation] = useState(user.location)
  const [editRole, setEditRole] = useState(user.role)
  const [editBio, setEditBio] = useState(user.bio)

  useEffect(() => {
    const updated = SYSTEM_USERS.find((u) => u.id === Number(params?.id)) || SYSTEM_USERS[0]
    setUser(updated)
    setEditName(updated.name)
    setEditPhone(updated.phone)
    setEditLocation(updated.location)
    setEditRole(updated.role)
    setEditBio(updated.bio)
  }, [params?.id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleToggleSuspend = () => {
    const nextStatus = user.status === "Active" ? "Suspended" : "Active"
    setUser({ ...user, status: nextStatus })
    showToast(
      nextStatus === "Active"
        ? `Đã kích hoạt lại tài khoản ${user.name}`
        : `Đã tạm khóa tài khoản ${user.name}`
    )
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setUser({
      ...user,
      name: editName,
      phone: editPhone,
      location: editLocation,
      role: editRole,
      bio: editBio,
    })
    setIsEditModalOpen(false)
    showToast("Đã cập nhật thông tin hồ sơ người dùng thành công")
  }

  const handleDeleteAccount = () => {
    showToast(`Đã xóa tài khoản ${user.name}`)
    setTimeout(() => {
      router.push("/admin/users")
    }, 1000)
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

      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2.5 bg-white border border-[#c2c6d6]/40 hover:bg-[#eff4ff] hover:text-[#0058be] rounded-2xl transition-all shadow-sm"
          >
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-[#121c2a]"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              User Details
            </h1>
            <p className="text-[#424754] font-medium text-[14px]">
              Xem chi tiết hồ sơ, quyền hạn và nhật ký hoạt động của {user.name}.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToggleSuspend}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all text-[14px] shadow-sm ${
              user.status === "Active"
                ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Ban size={18} />
            <span>{user.status === "Active" ? "Tạm khóa (Suspend)" : "Mở khóa (Activate)"}</span>
          </button>

          <button
            onClick={() => {
              setEditName(user.name)
              setEditPhone(user.phone)
              setEditLocation(user.location)
              setEditRole(user.role)
              setEditBio(user.bio)
              setIsEditModalOpen(true)
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all text-[14px]"
          >
            <Edit3 size={18} />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Basic Info */}
        <div className="space-y-7">
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
              {user.avatar}
            </div>
            <h2
              className="text-2xl font-bold text-[#121c2a] mb-1"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              {user.name}
            </h2>
            <p className="text-[#727785] text-[13px] mb-4">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
              <span className="px-3.5 py-1.5 bg-[#eff4ff] text-[#0058be] rounded-full text-[12px] font-bold flex items-center gap-1.5">
                <Shield size={13} />
                {user.role}
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border flex items-center gap-1.5 ${
                  user.status === "Active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {user.status === "Active" ? (
                  <>
                    <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                    <span>Hoạt động</span>
                  </>
                ) : (
                  <>
                    <Ban size={15} className="text-red-600 shrink-0" />
                    <span>Tạm khóa</span>
                  </>
                )}
              </span>
            </div>
            <div className="w-full pt-6 border-t border-[#c2c6d6]/30 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#121c2a]">124</p>
                <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Tài liệu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#121c2a]">1.2k</p>
                <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Lượt tải</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
            <h3
              className="text-[12px] font-bold text-[#727785] uppercase tracking-wider"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#f8f9ff] text-[#0058be] rounded-2xl border border-[#c2c6d6]/40">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Email</p>
                  <p className="text-[14px] font-bold text-[#121c2a]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#f8f9ff] text-[#0058be] rounded-2xl border border-[#c2c6d6]/40">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Số điện thoại</p>
                  <p className="text-[14px] font-bold text-[#121c2a]">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#f8f9ff] text-[#0058be] rounded-2xl border border-[#c2c6d6]/40">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Cơ sở / Địa điểm</p>
                  <p className="text-[14px] font-bold text-[#121c2a]">{user.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#f8f9ff] text-[#0058be] rounded-2xl border border-[#c2c6d6]/40">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-[#727785] font-bold uppercase tracking-wider">Ngày tham gia</p>
                  <p className="text-[14px] font-bold text-[#121c2a]">{user.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience & Activity */}
        <div className="lg:col-span-2 space-y-7">
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
            <h3
              className="text-xl font-bold text-[#121c2a]"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              Giới thiệu (Bio)
            </h3>
            <p className="text-[#424754] leading-relaxed font-medium text-[14px]">{user.bio}</p>
            <div className="pt-6 border-t border-[#c2c6d6]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#c2c6d6]/40">
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-1">Khoa / Bộ môn</p>
                <p className="text-[14px] font-bold text-[#121c2a]">Information Technology</p>
              </div>
              <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#c2c6d6]/40">
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-1">Học kỳ hiện tại</p>
                <p className="text-[14px] font-bold text-[#121c2a]">Summer 2024</p>
              </div>
            </div>
          </div>

          {/* Activity History Card */}
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3
                className="text-xl font-bold text-[#121c2a]"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Nhật ký hoạt động (Activity History)
              </h3>
            </div>

            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#c2c6d6]/40">
              {user.activity.map((act, i) => (
                <div key={i} className="relative flex gap-6 items-start">
                  <div className="relative z-10 w-10 h-10 rounded-2xl bg-white border-2 border-[#0058be] flex items-center justify-center shrink-0 shadow-sm">
                    <History size={16} className="text-[#0058be]" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <p className="text-[15px] font-bold text-[#121c2a]">{act.action}</p>
                      <span className="text-[12px] font-bold text-[#727785]">{act.time}</span>
                    </div>
                    <p className="text-[13px] text-[#424754] bg-[#f8f9ff] p-4 rounded-2xl border border-[#c2c6d6]/40 inline-block font-mono">
                      {act.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="flex justify-end pt-2">
            {user.role !== "Admin" && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all text-[13px] border border-red-200/60"
              >
                <Trash2 size={16} />
                <span>Xóa tài khoản này</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Edit Profile */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg sm:max-w-xl shadow-2xl border border-[#c2c6d6]/40 my-8 shrink-0 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Chỉnh sửa hồ sơ người dùng
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-[#727785] hover:text-[#121c2a] rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-2">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-xl px-4 py-3 text-[13px] sm:text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-xl px-4 py-3 text-[13px] sm:text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-2">Địa điểm / Cơ sở</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-xl px-4 py-3 text-[13px] sm:text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#424754] mb-2">Giới thiệu ngắn (Bio)</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-xl px-4 py-3 text-[13px] sm:text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[13px] sm:text-[14px] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl font-bold text-[13px] sm:text-[14px] shadow-md transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-[#c2c6d6]/40 my-8 shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Xác nhận xóa tài khoản
                </h3>
                <p className="text-[13px] text-[#727785] mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-[14px] sm:text-[15px] text-[#424754] mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <span className="font-bold text-[#121c2a]">{user.name}</span> ({user.email}) khỏi hệ thống không?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl border border-[#c2c6d6]/50 text-[#424754] font-bold text-[13px] sm:text-[14px] hover:bg-gray-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-[13px] sm:text-[14px] shadow-md transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


