"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
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
    href: "/admin/documents",
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

export function AdminTopNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      if (profileOpen) setProfileOpen(false)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [profileOpen])

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initials = user?.initials || "AD"
  const displayName = user?.name || "Administrator"
  const displayEmail = user?.email || "Lumis System Admin"

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

          return (
            <Link
              key={name}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-semibold tracking-wide transition-all",
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
      </nav>

      <div className="flex items-center gap-3">

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((open) => !open)}
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
                      {name}
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

