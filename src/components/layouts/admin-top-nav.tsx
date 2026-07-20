"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

const adminNavLinks = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    activePrefix: "/admin/dashboard",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    activePrefix: "/admin/users",
  },
  {
    name: "Research Areas",
    href: "/admin/subjects",
    icon: BookOpen,
    activePrefix: "/admin/subjects",
  },
  {
    name: "Documents",
    href: "/admin/documents?status=PENDING",
    icon: FileText,
    activePrefix: "/admin/documents",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    activePrefix: "/admin/settings",
  },
]

type AdminNotification = {
  id: string
  type: "USER_REGISTERED" | "DOCUMENT_PENDING"
  title: string
  description: string
  href: string
  createdAt: string
}

const NOTIFY_SEEN_KEY = "lumis_admin_notifications_seen_at"

function normalizeArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.documents)) return payload.documents
  return []
}

function getNotificationTime(item: AdminNotification) {
  const time = new Date(item.createdAt).getTime()
  return Number.isFinite(time) ? time : 0
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(diff) || diff < 0) return "vừa xong"

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "vừa xong"
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

export function AdminTopNav() {
  const pathname = usePathname()
  const { token, user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [notificationOpen, setNotificationOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<AdminNotification[]>([])
  const [pendingDocumentCount, setPendingDocumentCount] = React.useState(0)
  const [seenAt, setSeenAt] = React.useState<number>(() => Date.now())
  const [scrolled, setScrolled] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)
  const notificationRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const storedSeenAt = localStorage.getItem(NOTIFY_SEEN_KEY)
    if (storedSeenAt) {
      setSeenAt(new Date(storedSeenAt).getTime() || Date.now())
      return
    }

    const now = new Date().toISOString()
    localStorage.setItem(NOTIFY_SEEN_KEY, now)
    setSeenAt(new Date(now).getTime())
  }, [])

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      if (profileOpen) setProfileOpen(false)
      if (notificationOpen) setNotificationOpen(false)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [profileOpen, notificationOpen])

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const loadNotifications = React.useCallback(async () => {
    if (!token) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(user?.id ? { "x-user-id": user.id } : {}),
      "x-user-role": "ADMIN",
    }

    try {
      const [usersRes, docsRes] = await Promise.all([
        fetch(`${baseUrl}/api/users?page=1&limit=12`, { headers }).catch(() => null),
        fetch(`${baseUrl}/api/admin/documents?status=PENDING&page=1&pageSize=20`, { headers }).catch(() => null),
      ])

      const usersPayload = usersRes?.ok ? await usersRes.json().catch(() => ({})) : {}
      const docsPayload = docsRes?.ok ? await docsRes.json().catch(() => ({})) : {}
      const pendingDocs = normalizeArray(docsPayload).filter(
        (item: any) => item?.id && String(item?.status).toUpperCase() === "PENDING"
      )
      const pendingTotalValue = Number(docsPayload?.total ?? docsPayload?.totalItems ?? docsPayload?.count)
      const pendingTotal = Number.isFinite(pendingTotalValue) && pendingTotalValue > 0 ? pendingTotalValue : pendingDocs.length
      setPendingDocumentCount(pendingTotal)

      const userItems = normalizeArray(usersPayload)
        .filter((item: any) => item?.id && item?.createdAt)
        .map((item: any): AdminNotification => ({
          id: `user-${item.id}`,
          type: "USER_REGISTERED",
          title: "User mới đăng ký",
          description: `${item.name || item.email || "Người dùng mới"} vừa tạo tài khoản.`,
          href: "/admin/users",
          createdAt: item.createdAt,
        }))

      const documentItems = pendingDocs
        .map((item: any): AdminNotification => ({
          id: `doc-pending-${item.id}`,
          type: "DOCUMENT_PENDING",
          title: "Tài liệu chờ duyệt",
          description: `${item.title || "Tài liệu"} đang chờ admin kiểm duyệt.`,
          href: "/admin/documents?status=PENDING",
          createdAt: item.createdAt || item.updatedAt,
        }))

      const merged = [...userItems, ...documentItems]
        .filter((item) => getNotificationTime(item) > 0)
        .sort((a, b) => getNotificationTime(b) - getNotificationTime(a))
        .slice(0, 8)

      setNotifications(merged)
    } catch {
      // Notification polling should never block admin navigation.
    }
  }, [token, user?.id])

  React.useEffect(() => {
    loadNotifications()
    const timer = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(timer)
  }, [loadNotifications])

  const unreadCount = notifications.filter((item) => getNotificationTime(item) > seenAt).length
  const initials = user?.initials || "AD"
  const displayName = user?.name || "Administrator"
  const displayEmail = user?.email || "Lumis System Admin"

  const openNotifications = () => {
    setNotificationOpen((open) => !open)
    setProfileOpen(false)

    const now = new Date().toISOString()
    localStorage.setItem(NOTIFY_SEEN_KEY, now)
    setSeenAt(new Date(now).getTime())
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-16",
        "border-b border-black/5 bg-[#f8f9ff]/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
        scrolled && "bg-white/90 shadow-sm"
      )}
    >
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 text-[24px] font-extrabold tracking-tighter text-[#0058be] transition-transform hover:scale-[1.02]"
      >
        <ShieldCheck size={24} className="text-[#0058be]" />
        Lumis Admin
      </Link>

      <nav className="hidden lg:flex items-center gap-1">
        {adminNavLinks.map(({ name, href, icon: Icon, activePrefix }) => {
          const active = pathname === href || pathname.startsWith(activePrefix + "/")
          const showPendingBadge = name === "Documents" && pendingDocumentCount > 0

          return (
            <Link
              key={name}
              href={href}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-semibold tracking-wide transition-all",
                active
                  ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/20"
                  : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span>{name}</span>
              {showPendingBadge && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold shadow-sm",
                    active ? "bg-white text-[#0058be]" : "bg-red-600 text-white"
                  )}
                >
                  {pendingDocumentCount > 9 ? "9+" : pendingDocumentCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={openNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#424754] transition-all hover:bg-[#eff4ff] hover:text-[#0058be]"
            title="Thông báo quản trị"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[360px] overflow-hidden rounded-2xl border border-[#c2c6d6]/40 bg-white shadow-xl shadow-black/8">
              <div className="flex items-center justify-between border-b border-[#c2c6d6]/30 bg-[#f8f9ff] px-4 py-3.5">
                <div>
                  <p className="text-[13px] font-extrabold text-[#121c2a]">Thông báo quản trị</p>
                  <p className="text-[11px] font-medium text-[#727785]">User mới đăng ký và tài liệu chờ duyệt</p>
                </div>
                <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-[11px] font-extrabold text-[#0058be]">
                  {notifications.length}
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] font-semibold text-[#727785]">
                    Chưa có thông báo mới.
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = item.type === "USER_REGISTERED" ? UserPlus : CheckCircle2
                    const isUnread = getNotificationTime(item) > seenAt

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNotificationOpen(false)}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#f8f9ff]"
                      >
                        <div className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          item.type === "USER_REGISTERED" ? "bg-[#eff4ff] text-[#0058be]" : "bg-amber-50 text-amber-700"
                        )}>
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-extrabold text-[#121c2a]">{item.title}</p>
                            {isUnread && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[#727785]">{item.description}</p>
                          <p className="mt-1 text-[11px] font-bold text-[#0058be]">{timeAgo(item.createdAt)}</p>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((open) => !open)
              setNotificationOpen(false)
            }}
            className="flex items-center gap-2.5 rounded-full px-3 py-1.5 transition-all hover:bg-[#eff4ff] group"
          >
            <span className="hidden sm:block text-[14px] font-semibold text-[#424754] transition-colors group-hover:text-[#0058be]">
              {displayName}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0058be] to-[#316bf3] text-[12px] font-bold text-white shadow-md shadow-[#0058be]/25">
              {initials}
            </div>
            <ChevronDown
              size={13}
              className={cn("hidden sm:block text-[#727785] transition-transform duration-200", profileOpen && "rotate-180")}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-2xl border border-[#c2c6d6]/40 bg-white shadow-xl shadow-black/8">
              <div className="flex items-center gap-3 border-b border-[#c2c6d6]/30 bg-[#f8f9ff] px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0058be] to-[#316bf3] text-[13px] font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#121c2a]">{displayName}</p>
                  <p className="truncate text-[11px] text-[#727785]">{displayEmail}</p>
                </div>
              </div>

              <div className="py-1 lg:hidden">
                {adminNavLinks.map(({ name, href, icon: Icon, activePrefix }) => {
                  const active = pathname === href || pathname.startsWith(activePrefix + "/")
                  const showPendingBadge = name === "Documents" && pendingDocumentCount > 0

                  return (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold transition-colors",
                        active
                          ? "bg-[#eff4ff] text-[#0058be]"
                          : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
                      )}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{name}</span>
                      {showPendingBadge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white">
                          {pendingDocumentCount > 9 ? "9+" : pendingDocumentCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-[#c2c6d6]/30 py-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut size={14} className="shrink-0" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}






