"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen, Brain, HardDrive,
  Wallet, Settings, LogOut, Search, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Auth helpers (localStorage mock) ─────── */
export interface AuthUser {
  name: string
  email: string
  initials: string
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem("lumis_auth", JSON.stringify(user))
}

export function clearAuthUser() {
  localStorage.removeItem("lumis_auth")
}

function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try { return JSON.parse(localStorage.getItem("lumis_auth") ?? "null") } catch { return null }
}

/* ─── Nav items when logged in ──────────────── */
const appNavLinks = [
  {
    name: "Library",
    href: "/user/library",
    icon: BookOpen,
    activePrefix: "/user/library",
  },
  {
    name: "AI Workspace",
    href: "/user/ai-workspace",
    icon: Brain,
    activePrefix: "/user/ai-workspace",
  },
]

/* ─── Component ─────────────────────────────── */
export function LandingHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)

  const profileRef = React.useRef<HTMLDivElement>(null)

  /* Read auth on mount */
  React.useEffect(() => {
    setUser(getAuthUser())
  }, [])

  /* Scroll handler for show/hide header and scroll shadow */
  React.useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      
      // Update background shadow
      setScrolled(currentY > 8)

      // Always show at the top of the page
      if (currentY <= 10) {
        setIsVisible(true)
        lastY = currentY
        return
      }

      // Check diff to filter small movements
      const diff = currentY - lastY
      if (Math.abs(diff) < 15) {
        return
      }

      if (diff > 0) {
        // Scrolling down -> Hide header
        setIsVisible(false)
        // Also close profile dropdown when header hides to avoid floating menu
        setProfileOpen(false)
      } else {
        // Scrolling up -> Show header
        setIsVisible(true)
      }

      lastY = currentY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Close profile dropdown on outside click */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    clearAuthUser()
    setUser(null)
    setProfileOpen(false)
    router.push("/")
  }

  const isOnUserPage = pathname.startsWith("/user")

  return (
    <header
      id="main-nav"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-16 h-16",
        "bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-black/5 transition-all duration-300 ease-in-out transform",
        scrolled && "shadow-sm bg-white/90",
        isVisible ? "translate-y-0" : "-translate-y-full"
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
              How it works
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-[14px] font-semibold text-[#727785] hover:text-[#424754] transition-colors rounded-xl hover:bg-[#f0f4ff]"
            >
              Pricing
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
              Bảng giá
            </Link>
          </>
        )}
      </nav>

      {/* ── Right side ── */}
      <div className="flex items-center gap-3">
        {user ? (
          /* ── Authenticated: name + avatar + dropdown ── */
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
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
                  <Link
                    href="/user/storage"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <HardDrive size={14} className="shrink-0 text-[#727785]" />
                    Storage
                  </Link>
                  <Link
                    href="/user/payment"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <Wallet size={14} className="shrink-0 text-[#727785]" />
                    Payment Management
                  </Link>
                  <Link
                    href="/user/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be] transition-colors"
                  >
                    <Settings size={14} className="shrink-0 text-[#727785]" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-[#c2c6d6]/30 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} className="shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
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
              Bắt đầu ngay
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
