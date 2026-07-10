"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Mail, Shield, UserCog } from "lucide-react"

import { getUserItems, getUsers, updateUser } from "@/features/users/api/users-api"
import type { ManagedUser, UserRole, UserStatus } from "@/features/users/types"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [user, setUser] = useState<ManagedUser | null>(null)
  const [role, setRole] = useState<UserRole>("STUDENT")
  const [status, setStatus] = useState<UserStatus>("ACTIVE")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await getUsers({ page: 1, limit: 100 })
      const foundUser = getUserItems(response).find((item) => item.id === id) ?? null
      setUser(foundUser)
      setRole(foundUser?.role ?? "STUDENT")
      setStatus(foundUser?.status ?? "ACTIVE")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải user.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUser()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUser])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setErrorMessage("")
      setSuccessMessage("")
      const updatedUser = await updateUser(id, { role, status })
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              ...updatedUser,
              role: updatedUser.role ?? role,
              status: updatedUser.status ?? status,
            }
          : null,
      )
      setSuccessMessage("Đã cập nhật user.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">User Details</h1>
          <p className="text-on-surface-variant font-medium">Review account details and update role or access status.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="glass-panel p-8 text-on-surface-variant">Loading user...</div>
      ) : !user ? (
        <div className="glass-panel p-8 text-on-surface-variant">User not found.</div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-8 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center font-extrabold text-white text-3xl mb-4 shadow-xl shadow-primary/20">
              {getInitials(user.name)}
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-1">{user.name}</h2>
            <p className="text-on-surface-variant mb-4 flex items-center gap-2"><Mail size={14} />{user.email}</p>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold flex items-center gap-1.5">
              <Shield size={12} />
              {user.role}
            </span>
          </div>

          <div className="lg:col-span-2 glass-panel p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
              <UserCog size={20} />
              Access Control
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Role</label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] outline-none"
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[13px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as UserStatus)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-bold disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
