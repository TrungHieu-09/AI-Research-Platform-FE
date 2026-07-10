"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, CheckCircle2, Eye, Search, Shield, User as UserIcon, UserCheck, UserX } from "lucide-react"

import {
  getUserItems,
  getUserTotal,
  getUsers,
  updateUser,
} from "@/features/users/api/users-api"
import type { ManagedUser } from "@/features/users/types"

function formatRole(role: ManagedUser["role"]) {
  return role === "ADMIN" ? "Admin" : "Student"
}

function formatStatus(status: ManagedUser["status"]) {
  return status === "ACTIVE" ? "Active" : "Suspended"
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

function getInitials(name: string) {
  const safeName = name.trim()
  if (!safeName) return "U"

  return safeName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await getUsers({ page: 1, limit: 50 })
      setUsers(getUserItems(response))
      setTotalUsers(getUserTotal(response))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách user.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = searchTerm.toLowerCase()
      const name = user.name ?? ""
      const email = user.email ?? ""

      return (
        name.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword)
      )
    })
  }, [searchTerm, users])

  const activeCount = users.filter((user) => user.status === "ACTIVE").length
  const suspendedCount = users.filter((user) => user.status === "SUSPENDED").length

  async function handleToggleStatus(user: ManagedUser) {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const actionLabel = nextStatus === "SUSPENDED" ? "tạm khóa" : "mở khóa"
    const confirmed = window.confirm(`Bạn có chắc muốn ${actionLabel} tài khoản ${user.name}?`)

    if (!confirmed) return

    try {
      const updatedUser = await updateUser(user.id, { status: nextStatus })
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...updatedUser,
                status: updatedUser.status ?? nextStatus,
              }
            : item,
        ),
      )
      setToastMessage(`Đã ${actionLabel} tài khoản ${user.name}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật user.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121c2a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <span className="text-[13px] font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5">
          User Management
        </h1>
        <p className="text-[#424754] font-medium text-[14px]">
          Monitor accounts, review roles, and update user access across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#c2c6d6]/40 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#eff4ff] text-[#0058be] rounded-2xl">
            <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Tổng tài khoản</p>
            <h4 className="text-2xl font-bold text-[#121c2a]">{totalUsers}</h4>
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

      <div className="bg-white border border-[#c2c6d6]/40 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-2.5 pl-11 pr-4 text-[14px] text-[#121c2a] placeholder:text-[#727785] focus:outline-none focus:border-[#0058be] transition-all"
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/30 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c6d6]/20">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#727785]">
                    Đang tải users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#727785]">
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8f9ff] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] flex items-center justify-center font-bold text-[#0058be] text-[13px] shrink-0">
                          {getInitials(user.name ?? "")}
                        </div>
                        <div>
                          <p className="font-bold text-[#121c2a] leading-tight">{user.name ?? "Unnamed user"}</p>
                          <p className="text-[12px] text-[#727785]">{user.email ?? "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#eff4ff] text-[#0058be]">
                        <Shield size={12} />
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${user.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200/80" : "bg-red-50 text-red-700 border-red-200/80"}`}>
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#424754]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="p-2 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors"
                          title="Xem user"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => void handleToggleStatus(user)}
                          className={`p-2 rounded-xl transition-colors ${
                            user.status === "ACTIVE"
                              ? "text-[#727785] hover:text-red-600 hover:bg-red-50"
                              : "text-[#727785] hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={user.status === "ACTIVE" ? "Tạm khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.status === "ACTIVE" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
