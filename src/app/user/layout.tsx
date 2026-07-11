"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LandingHeader } from "@/components/layouts/landing-header"
import { useAuth } from "@/features/auth/auth-context"
import Link from "next/link"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  // Show spinner while rehydrating auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <span className="material-symbols-outlined text-[40px] text-[#0058be] animate-spin">progress_activity</span>
      </div>
    )
  }

  // Don't render user pages for unauthenticated users
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col">
      {/* Shared landing-style top header */}
      <LandingHeader />

      {/* Main content — offset by fixed header height */}
      <main className="flex-1 flex flex-col pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#c2c6d6]/30 bg-white/50 backdrop-blur-sm py-4 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between text-[13px] font-medium text-[#727785] gap-4">
        <div className="flex-1 flex justify-start">
          <span className="font-bold text-[#424754]">Lumis</span>
        </div>
        <div className="flex-1 flex justify-center">
          <span>© 2026 Nền tảng Nghiên cứu AI Lumis</span>
        </div>
        <div className="flex-1 flex justify-end gap-6">
          <Link href="#" className="hover:text-[#0058be] transition-colors">Chính sách bảo mật</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Điều khoản dịch vụ</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Tài liệu hướng dẫn</Link>
        </div>
      </footer>
    </div>
  )
}
