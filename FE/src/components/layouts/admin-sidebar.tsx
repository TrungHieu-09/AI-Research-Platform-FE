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
        className="fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all bg-secondary-container border-r border-outline-variant",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 lg:translate-x-0 lg:w-24"
        )}
      >
        <div className="flex flex-col h-full px-4 py-8">
          <div className="flex items-center gap-3 px-4 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            {isOpen && (
              <span className="text-2xl font-bold tracking-tight text-on-surface">Lumis</span>
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
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-primary"
                  )}
                >
                  <item.icon
                    size={22}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-on-surface-variant group-hover:text-primary"
                    )}
                  />
                  {isOpen && <span className="text-[15px] font-bold tracking-tight">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-outline-variant pt-6">
            <Link
              href="/login"
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-tertiary-container hover:text-tertiary transition-all group"
            >
              <LogOut size={22} className="group-hover:text-tertiary" />
              {isOpen && <span className="text-[15px] font-bold tracking-tight">Log Out</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
