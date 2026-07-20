"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen, Brain, HardDrive,
  Wallet, Settings, LogOut, Search, ChevronDown, MessageSquare,
  Bell, CheckCircle2, XCircle, Clock, Moon, Sun
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"
import { useTheme } from "@/features/theme/theme-context"

/* ─── Nav items when logged in ──────────────── */
const appNavLinks = [
  {
    name: "Thư viện",
    href: "/user/library",
    icon: BookOpen,
    activePrefix: "/user/library",
  },
  {
    name: "Diễn đàn",
    href: "/user/forum",
    icon: MessageSquare,
    activePrefix: "/user/forum",
  },
  {
    name: "Không gian AI",
    href: "/user/ai-workspace",
    icon: Brain,
    activePrefix: "/user/ai-workspace",
  },
]


type UserNotification = {
  id: string
  title: string
  content: string
  createdAt: string
  tone: "success" | "error" | "info"
}

const USER_NOTIFY_SEEN_KEY = "lumis_user_notifications_seen_at"

function normalizeNotificationArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.notifications)) return payload.notifications
  return []
}

function getUserNotificationTime(item: UserNotification) {
  const time = new Date(item.createdAt).getTime()
  return Number.isFinite(time) ? time : 0
}

function userTimeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(diff) || diff < 0) return "vừa xong"

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "vừa xong"
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  return `${Math.floor(hours / 24)} ngày trước`
}
/* ─── Component ─────────────────────────────── */
export function LandingHeader() {
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [profileOpen, setProfileOpen] = React.useState(false)
  const [notificationOpen, setNotificationOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<UserNotification[]>([])
  const [seenAt, setSeenAt] = React.useState<number>(() => Date.now())
  const [scrolled, setScrolled] = React.useState(false)

  const profileRef = React.useRef<HTMLDivElement>(null)
  const notificationRef = React.useRef<HTMLDivElement>(null)

  /* Scroll handler */
  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      if (profileOpen) setProfileOpen(false)
      if (notificationOpen) setNotificationOpen(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [profileOpen, notificationOpen])

  /* Close dropdown on outside click */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (profileRef.current && !profileRef.current.contains(target))
        setProfileOpen(false)
      if (notificationRef.current && !notificationRef.current.contains(target))
        setNotificationOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  React.useEffect(() => {
    const storedSeenAt = localStorage.getItem(USER_NOTIFY_SEEN_KEY)
    if (storedSeenAt) {
      setSeenAt(new Date(storedSeenAt).getTime() || Date.now())
      return
    }

    const now = new Date().toISOString()
    localStorage.setItem(USER_NOTIFY_SEEN_KEY, now)
    setSeenAt(new Date(now).getTime())
  }, [])

  const loadUserNotifications = React.useCallback(async () => {
    if (!token) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

    try {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const payload = await res.json().catch(() => ({}))
      const mapped = normalizeNotificationArray(payload)
        .map((item: any): UserNotification => {
          const title = String(item.title || item.type || "Thông báo")
          const content = String(item.content || item.message || item.description || "Bạn có một cập nhật mới.")
          const text = `${title} ${content}`.toLowerCase()

          return {
            id: String(item.id || `${title}-${item.createdAt || item.updatedAt || Date.now()}`),
            title,
            content,
            createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
            tone: text.includes("từ chối") || text.includes("rejected") ? "error" : text.includes("duyệt") || text.includes("approved") ? "success" : "info",
          }
        })
        .filter((item) => getUserNotificationTime(item) > 0)
        .sort((a, b) => getUserNotificationTime(b) - getUserNotificationTime(a))
        .slice(0, 10)

      setNotifications(mapped)
    } catch {
      // Notification loading must not block navigation.
    }
  }, [token])

  React.useEffect(() => {
    if (!user) return

    loadUserNotifications()
    const timer = window.setInterval(loadUserNotifications, 30000)
    return () => window.clearInterval(timer)
  }, [user, loadUserNotifications])

  const unreadCount = notifications.filter((item) => getUserNotificationTime(item) > seenAt).length

  const openNotifications = () => {
    setNotificationOpen((open) => !open)
    setProfileOpen(false)

    const now = new Date().toISOString()
    localStorage.setItem(USER_NOTIFY_SEEN_KEY, now)
    setSeenAt(new Date(now).getTime())
  }
  const handleLogout = () => {
    setNotificationOpen(false)
    setProfileOpen(false)
    logout()
  }

  const isOnUserPage = pathname.startsWith("/user")

  return (
    <header
      id="main-nav"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-16 h-16",
        "bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-black/5 transition-all duration-300 ease-in-out",
        scrolled && "shadow-sm bg-white/90"
      )}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        className="text-[24px] font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0058be] to-[#316bf3] hover:scale-[1.02] transition-transform shrink-0"
      >
        Lumis
      </Link>

      {/* ── Center Nav ── */}
      <nav className="hidden md:flex items-center gap-1">
        {user ? (
          /* ── Authenticated nav: Library + AI Workspace + How it works + Pricing ── */
          <>
            {appNavLinks.map(({ name, href, icon: Icon, activePrefix }) => {
              const active = pathname.startsWith(activePrefix)
              return (
                <Link
                  key={name}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-semibold tracking-wide transition-all",
                    active
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/20"
                      : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {name}
                </Link>
              )
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-[#c2c6d6]/60 mx-2" />

            <Link
              href="/#how-it-works"
              className="px-3 py-2 text-[14px] font-semibold text-[#727785] hover:text-[#424754] transition-colors rounded-xl hover:bg-[#f0f4ff]"
            >
              Cách hoạt động
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-[14px] font-semibold text-[#727785] hover:text-[#424754] transition-colors rounded-xl hover:bg-[#f0f4ff]"
            >
              Gói dịch vụ
            </Link>
          </>
        ) : (
          /* ── Guest nav: Features + How it works + Pricing ── */
          <>
            <Link
              href="/#features"
              className="px-4 py-2 text-[14px] font-semibold text-[#424754] hover:text-[#0058be] transition-colors rounded-xl hover:bg-[#eff4ff]"
            >
              Tính năng
            </Link>
            <Link
              href="/#how-it-works"
              className="px-4 py-2 text-[14px] font-semibold text-[#424754] hover:text-[#0058be] transition-colors rounded-xl hover:bg-[#eff4ff]"
            >
              Cách hoạt động
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-[14px] font-semibold text-[#424754] hover:text-[#0058be] transition-colors rounded-xl hover:bg-[#eff4ff]"
            >
              Gói dịch vụ
            </Link>
          </>
        )}
      </nav>

      {/* ── Right side ── */}
      <div className="flex items-center gap-3">
        {user ? (
          /* ── Authenticated: name + avatar + dropdown ── */
          <>
            {user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0058be] text-white text-[12px] font-bold shadow-sm hover:bg-[#004ca3] transition-all"
                title="Quay lại Admin Console"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                <span>Quay lại Admin</span>
              </Link>
            )}
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#424754] transition-all hover:bg-[#eff4ff] hover:text-[#0058be]"
              title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={openNotifications}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#424754] transition-all hover:bg-[#eff4ff] hover:text-[#0058be]"
                title="Thông báo"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[380px] overflow-hidden rounded-2xl border border-[#c2c6d6]/40 bg-white shadow-xl shadow-black/8">
                  <div className="flex items-center justify-between border-b border-[#c2c6d6]/30 bg-[#f8f9ff] px-4 py-3.5">
                    <div>
                      <p className="text-[13px] font-extrabold text-[#121c2a]">Thông báo</p>
                      <p className="text-[11px] font-medium text-[#727785]">Cập nhật duyệt tài liệu và phản hồi từ admin</p>
                    </div>
                    <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-[11px] font-extrabold text-[#0058be]">
                      {notifications.length}
                    </span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[13px] font-semibold text-[#727785]">
                        Chưa có thông báo mới.
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const Icon = item.tone === "error" ? XCircle : item.tone === "success" ? CheckCircle2 : Clock
                        const isUnread = getUserNotificationTime(item) > seenAt

                        return (
                          <div key={item.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#f8f9ff]">
                            <div
                              className={cn(
                                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                item.tone === "error"
                                  ? "bg-red-50 text-red-700"
                                  : item.tone === "success"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-[#eff4ff] text-[#0058be]"
                              )}
                            >
                              <Icon size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-extrabold text-[#121c2a]">{item.title}</p>
                                {isUnread && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
                              </div>
                              <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#727785]">{item.content}</p>
                              <p className="mt-1 text-[11px] font-bold text-[#0058be]">{userTimeAgo(item.createdAt)}</p>
                            </div>
                          </div>
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
                setProfileOpen(!profileOpen)
                setNotificationOpen(false)
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-[#eff4ff] transition-all group"
            >
              <span className="hidden sm:block text-[14px] font-semibold text-[#424754] group-hover:text-[#0058be] transition-colors">
                {user.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0058be] to-[#316bf3] flex items-center justify-center text-white text-[12px] font-bold shadow-md shadow-[#0058be]/25 shrink-0">
                {user.initials}
              </div>
              <ChevronDown
                size={13}
                className={cn("text-[#727785] transition-transform duration-200 hidden sm:block", profileOpen && "rotate-180")}
              />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-[#c2c6d6]/40 rounded-2xl shadow-xl shadow-black/8 overflow-hidden">
                {/* User info header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0058be] to-[#316bf3] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#727785] truncate">{user.email}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-bold text-[#0058be] bg-[#eff4ff]/70 hover:bg-[#eff4ff] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0058be]">admin_panel_settings</span>
                      Quay lại Admin Console
                    </Link>
                  )}
                  <Link
                    href="/user/storage"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <HardDrive size={14} className="shrink-0 text-[#727785]" />
                    Lưu trữ
                  </Link>
                  <Link
                    href="/user/payment"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <Wallet size={14} className="shrink-0 text-[#727785]" />
                    Quản lý thanh toán
                  </Link>
                  <Link
                    href="/user/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <Settings size={14} className="shrink-0 text-[#727785]" />
                    Cài đặt
                  </Link>
                </div>

                <div className="border-t border-[#c2c6d6]/30 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} className="shrink-0" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
        ) : (
          /* ── Guest: search + login + get started ── */
          <>
            <button className="hidden md:flex items-center text-[#424754] hover:text-[#121c2a] transition-colors p-2 rounded-full hover:bg-[#f0f4ff]">
              <Search size={18} />
            </button>
            <Link
              href="/login"
              className="text-[14px] font-semibold text-[#0058be] hover:text-[#2170e4] transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="bg-[#0058be] hover:bg-[#2170e4] text-white text-[14px] font-semibold py-2 px-5 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Bắt đầu
            </Link>
          </>
        )}
      </div>
    </header>
  )
}


