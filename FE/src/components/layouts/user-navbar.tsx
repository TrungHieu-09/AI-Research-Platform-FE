"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Share2,
  Brain,
  Wallet,
  Settings,
  Plus,
  Sparkles,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/hub/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/hub/library", icon: BookOpen },
  { name: "Shared Documents", href: "/hub/shared", icon: Share2 },
  { name: "AI Workspace", href: "/hub/ai-workspace", icon: Brain },
  { name: "Payment Management", href: "/hub/payment", icon: Wallet },
]

export function ResearchSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const isActive = (href: string) => {
    if (href === "/hub") return pathname === "/hub"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md border border-[#c2c6d6]/40 rounded-xl shadow-sm lg:hidden"
      >
        {mobileOpen ? <X size={18} className="text-[#121c2a]" /> : <Menu size={18} className="text-[#121c2a]" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[230px] flex flex-col",
          "bg-white/70 backdrop-blur-[12px] border-r border-white/50",
          "shadow-[1px_0_0_0_rgba(194,198,214,0.4)]",
          "transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <Link href="/hub" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-[#0058be] flex items-center justify-center shadow-md shadow-[#0058be]/25 shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#121c2a] leading-none tracking-tight">Lumis</p>
              <p className="text-[11px] text-[#424754] font-medium leading-none mt-0.5">Research Workspace</p>
            </div>
          </Link>
        </div>

        {/* New Request button */}
        <div className="px-4 mb-5">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[13px] font-semibold transition-all shadow-md shadow-[#0058be]/20 active:scale-[0.98]">
            <Plus size={16} strokeWidth={2.5} />
            New Request
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150 group",
                  active
                    ? "bg-[#0058be] text-white shadow-sm shadow-[#0058be]/20"
                    : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                )}
              >
                <item.icon
                  size={18}
                  className={cn("shrink-0 transition-colors", active ? "text-white" : "text-[#727785] group-hover:text-[#0058be]")}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Settings */}
        <div className="px-3 pb-6 pt-4 border-t border-[#c2c6d6]/30 mt-2">
          <Link
            href="/hub/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150 group",
              isActive("/hub/settings")
                ? "bg-[#0058be] text-white shadow-sm shadow-[#0058be]/20"
                : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            <Settings
              size={18}
              className={cn("shrink-0 transition-colors", isActive("/hub/settings") ? "text-white" : "text-[#727785] group-hover:text-[#0058be]")}
            />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
