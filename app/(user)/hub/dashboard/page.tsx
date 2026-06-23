"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText, Users, BookOpen, Clock, TrendingUp,
  ArrowRight, Sparkles, Download, Eye, BarChart3,
} from "lucide-react"

const stats = [
  { label: "Saved Insights", value: "24", icon: FileText, color: "text-[#0058be]", bg: "bg-[#eff4ff]" },
  { label: "Research Hours", value: "142h", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Collections", value: "8", icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
  { label: "Team Members", value: "6", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
]

const recentActivity = [
  { text: "New synthesis: 'Edge AI Deployment Trends'", time: "2h ago", icon: Sparkles, color: "text-[#0058be]", bg: "bg-[#eff4ff]" },
  { text: "You downloaded 'EU AI Act Report'", time: "5h ago", icon: Download, color: "text-green-600", bg: "bg-green-50" },
  { text: "Shared 'Q3 Enterprise Report' with team", time: "1d ago", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { text: "Viewed 'Neural Networks Fundamentals'", time: "2d ago", icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
]

const quickLinks = [
  { label: "Browse Insights", href: "/hub", icon: TrendingUp },
  { label: "Document Library", href: "/hub/documents", icon: FileText },
  { label: "AI Synthesis", href: "/hub/synthesis", icon: Sparkles },
  { label: "Browse Subjects", href: "/hub/subjects", icon: BookOpen },
]

export default function HubDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-6 py-8 max-w-[1100px] mx-auto w-full space-y-8">
        {/* Header */}
        <div>
          <p className="text-[13px] font-semibold text-[#0058be] mb-1 uppercase tracking-widest">Dashboard</p>
          <h1 className="text-[32px] font-bold text-[#121c2a] tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
            Research Overview
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-[20px] p-5 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-[26px] font-bold text-[#121c2a] leading-none">{stat.value}</p>
              <p className="text-[12px] text-[#727785] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6eeff]/60 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Recent Activity
              </h3>
              <BarChart3 size={16} className="text-[#727785]" />
            </div>
            <div className="divide-y divide-[#e6eeff]/60">
              {recentActivity.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-[#f8f9ff]/60 transition-colors">
                  <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#121c2a]">{item.text}</p>
                    <p className="text-[11px] text-[#727785] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6eeff]/60">
              <h3 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Quick Access
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#eff4ff] hover:text-[#0058be] text-[#424754] transition-all group"
                >
                  <link.icon size={16} className="text-[#727785] group-hover:text-[#0058be] transition-colors" />
                  <span className="text-[13px] font-semibold flex-1">{link.label}</span>
                  <ArrowRight size={14} className="text-[#c2c6d6] group-hover:text-[#0058be] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#c2c6d6]/20 text-[12px] text-[#727785]">
        <span className="font-semibold text-[#424754]">Lumis</span>
        <span>© 2024 Lumis AI Research Platform</span>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-[#0058be] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#0058be] transition-colors">Documentation</Link>
        </div>
      </footer>
    </div>
  )
}
