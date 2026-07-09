"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Subject Management", href: "/subjects", icon: BookOpen },
  { name: "Document Management", href: "/documents", icon: FileText },
  { name: "System Settings", href: "/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 bg-[#0058be] text-white rounded-xl shadow-md lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all bg-white border-r border-[#c2c6d6]/40 shadow-sm",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 lg:translate-x-0 lg:w-24"
        )}
      >
        <div className="flex flex-col h-full px-5 py-7">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#0058be] flex items-center justify-center shadow-lg shadow-[#0058be]/20 shrink-0">
              <ShieldCheck className="text-white" size={22} />
            </div>
            {isOpen && (
              <div>
                <div className="flex items-center gap-1.5 text-[#0058be] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} />
                  ADMIN CONSOLE
                </div>
                <span className="text-xl font-bold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Lumis Admin
                </span>
              </div>
            )}
          </div>

          {/* Switch to User View Pill */}
          {isOpen && (
            <div className="mb-6 px-1">
              <Link
                href="/user/library"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dee9fc] border border-[#0058be]/15 text-[#0058be] text-[12px] font-bold transition-all group"
              >
                <span>Switch to User View</span>
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group",
                    isActive
                      ? "bg-[#0058be] text-white font-bold shadow-md shadow-[#0058be]/20"
                      : "text-[#424754] font-semibold hover:bg-[#f8f9ff] hover:text-[#0058be]"
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#727785] group-hover:text-[#0058be]"
                    )}
                  />
                  {isOpen && <span className="text-[14px] tracking-tight truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer Area */}
          <div className="mt-auto border-t border-[#c2c6d6]/30 pt-5 space-y-3">
            {isOpen && (
              <div className="px-3 py-2.5 bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#424754] mb-1">
                  <span>SYSTEM STATUS</span>
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Optimal
                  </span>
                </div>
                <p className="text-[11px] text-[#727785]">v2.0 Enterprise · Live</p>
              </div>
            )}

            <Link
              href="/login"
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[#424754] font-semibold hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut size={20} className="text-[#727785] group-hover:text-red-600 shrink-0 transition-colors" />
              {isOpen && <span className="text-[14px] tracking-tight">Log Out</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

