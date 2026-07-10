import { AdminSidebar } from "@/components/layouts/admin-sidebar"
import Link from "next/link"
import { Sparkles, Shield, Bell } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#121c2a]">
      <AdminSidebar />
      <div className="flex-1 lg:ml-72 flex flex-col transition-all duration-300 min-h-screen">
        {/* Sleek Admin Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-[#c2c6d6]/40 px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] border border-[#0058be]/20 text-[#0058be] text-[11px] font-bold tracking-wider uppercase">
              <Sparkles size={12} />
              ADMINISTRATIVE WORKSPACE
            </div>
            <span className="hidden sm:inline-block text-[13px] text-[#727785] font-medium">
              System Control & Moderation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[13px] font-semibold text-[#424754] hover:text-[#0058be] transition-colors"
            >
              Live Site
            </Link>
            <Link
              href="/user/library"
              className="text-[13px] font-semibold text-[#424754] hover:text-[#0058be] transition-colors"
            >
              User Library
            </Link>
            <div className="h-4 w-px bg-[#c2c6d6]/50" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-[#121c2a] leading-none">Administrator</p>
                <p className="text-[11px] text-[#727785] leading-none mt-0.5">Lumis System Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

