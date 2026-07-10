"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Subject Management", href: "/admin/subjects", icon: BookOpen },
  { name: "Document Management", href: "/admin/documents", icon: FileText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0058be] text-white rounded-md lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all bg-white border-r border-[#c2c6d6]/40 shadow-sm",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 lg:translate-x-0 lg:w-24"
        )}
      >
        <div className="flex flex-col h-full px-4 py-8">
          <div className="flex items-center gap-3 px-4 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0058be] to-[#316bf3] flex items-center justify-center shadow-lg shadow-[#0058be]/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            {isOpen && (
              <span className="text-[24px] font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0058be] to-[#316bf3]">Lumis</span>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group",
                    isActive
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/20"
                      : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  <item.icon
                    size={22}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-[#727785] group-hover:text-[#0058be]"
                    )}
                  />
                  {isOpen && <span className="text-[14px] font-semibold tracking-tight">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-[#c2c6d6]/40 pt-6">
            <Link
              href="/login"
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut size={22} className="" />
              {isOpen && <span className="text-[14px] font-semibold tracking-tight">Log Out</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
