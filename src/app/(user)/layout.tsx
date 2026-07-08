
import { LandingHeader } from "@/components/layouts/landing-header"
import Link from "next/link"

export default function UserLayout({ children }: { children: React.ReactNode }) {
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
          <span>© 2026 Lumis AI Research Platform</span>
        </div>
        <div className="flex-1 flex justify-end gap-6">
          <Link href="#" className="hover:text-[#0058be] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Documentation</Link>
        </div>
      </footer>
    </div>
  )
}
