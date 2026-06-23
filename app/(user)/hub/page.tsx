"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, Bookmark, ArrowRight, Download,
  Calendar, FileText, FolderOpen, Sparkles,
  RotateCcw,
} from "lucide-react"

/* ─── Mock data ─── */
const featuredInsight = {
  tags: ["AI Synthesized", "Market Trends"],
  title: "The Shift Towards Edge Computing in Generative AI Models",
  description:
    "Recent analysis across 40+ academic papers indicates a significant pivot from cloud-reliant LLMs to edge-optimized models. This synthesis highlights the primary drivers: latency reduction, data privacy concerns, and the democratization of inference capabilities. Key findings point to a 3x increase in on-device model deployments year-over-year, with specialized hardware becoming the critical bottleneck...",
  docCount: 40,
  id: "1",
}

const sideInsight = {
  tag: "Consumer Behavior",
  title: "Gen Z Adoption of Spatial Computing",
  description:
    "Early metrics show a 3x higher onboarding rate among Gen Z cohorts via spatial computing compared to traditional web. Key factors include gamification and intuitive physical-digital spaces.",
  date: "Oct 24, 2023",
  id: "2",
}

const smallInsights = [
  {
    id: "3",
    tag: "Regulatory",
    title: "EU AI Act: Compliance Roadmap for Q1",
    description:
      "A consolidated overview of immediate action items required for SaaS platforms operating within the EU, synthesized from recent regulatory guidelines and leading...",
    date: "Oct 22, 2023",
  },
]

const recentReports = [
  {
    id: "r1",
    title: "Q3 Enterprise AI Adoption Report",
    meta: "2.4 MB • Synthesized by Lumis AI",
  },
  {
    id: "r2",
    title: "Competitor Analysis: Spatial Tech",
    meta: "1.8 MB • Uploaded by Research Team",
  },
]

/* ─── Component ─── */
function TagChip({ label, variant = "default" }: { label: string; variant?: "ai" | "default" }) {
  if (variant === "ai") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0058be]/10 text-[#0058be] text-[11px] font-semibold border border-[#0058be]/15">
        <Sparkles size={10} />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#d9e3f6]/60 text-[#424754] text-[11px] font-semibold border border-[#c2c6d6]/40">
      {label}
    </span>
  )
}

export default function InsightsPage() {
  const [search, setSearch] = React.useState("")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top search bar */}
      <div className="sticky top-0 z-20 px-6 pt-4 pb-3 bg-[#f8f9ff]/80 backdrop-blur-md border-b border-[#c2c6d6]/20">
        <div className="flex items-center gap-3 max-w-[560px] px-4 py-2.5 rounded-2xl border border-[#c2c6d6]/50 bg-white shadow-[0_2px_12px_rgba(31,41,55,0.05)] focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all">
          <Search size={15} className="text-[#727785] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search synthesized research..."
            className="flex-1 bg-transparent text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-6 max-w-[1100px] mx-auto w-full">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[13px] font-semibold text-[#0058be] mb-1 tracking-wide uppercase" style={{ letterSpacing: "0.05em" }}>
              Consumer Dashboard
            </p>
            <h1 className="text-[32px] font-bold text-[#121c2a] tracking-tight leading-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              Your Synthesized Insights
            </h1>
          </div>

          {/* Reset / Report action card */}
          <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-[#c2c6d6]/40 shadow-[0_4px_20px_rgba(31,41,55,0.06)] text-[13px] text-[#424754]">
            <RotateCcw size={14} className="text-[#0058be]" />
            <div className="text-left">
              <p className="font-semibold text-[#121c2a] leading-none mb-0.5">Report</p>
              <p className="text-[11px] text-[#727785]">Resets in 14d</p>
            </div>
          </div>
        </div>

        {/* Top row: Featured card + Side card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">

          {/* Featured synthesis card */}
          <div className="relative bg-white rounded-[24px] p-6 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 flex flex-col gap-4 overflow-hidden group hover:shadow-[0_14px_48px_rgba(31,41,55,0.12)] transition-shadow duration-300">
            {/* AI spark animated border */}
            <div className="absolute inset-0 rounded-[24px] pointer-events-none" style={{
              background: "linear-gradient(135deg, rgba(0,88,190,0.06) 0%, transparent 60%)",
            }} />

            {/* Tags + Bookmark */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <TagChip label="AI Synthesized" variant="ai" />
                <TagChip label="Market Trends" />
              </div>
              <button className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-all shrink-0">
                <Bookmark size={16} />
              </button>
            </div>

            {/* Title */}
            <h2 className="text-[22px] font-bold text-[#121c2a] leading-snug tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              {featuredInsight.title}
            </h2>

            {/* Description */}
            <p className="text-[14px] text-[#424754] leading-relaxed line-clamp-4">
              {featuredInsight.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center gap-2 text-[13px] text-[#727785]">
                <span className="font-semibold text-[#121c2a]">{featuredInsight.docCount}+</span>
                <FileText size={13} className="text-[#727785]" />
              </div>
              <Link
                href={`/hub/documents/${featuredInsight.id}`}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0058be] hover:gap-2.5 transition-all group"
              >
                Read Full Synthesis
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Side insight card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 flex flex-col gap-3 hover:shadow-[0_14px_48px_rgba(31,41,55,0.12)] transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <TagChip label={sideInsight.tag} />
            </div>
            <h3 className="text-[17px] font-bold text-[#121c2a] leading-snug tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              {sideInsight.title}
            </h3>
            <p className="text-[13px] text-[#424754] leading-relaxed flex-1 line-clamp-5">
              {sideInsight.description}
            </p>
            <div className="flex items-center gap-1.5 text-[12px] text-[#727785] mt-auto pt-2 border-t border-[#e6eeff]/60">
              <Calendar size={11} />
              {sideInsight.date}
            </div>
          </div>
        </div>

        {/* Bottom row: Small insight + Shared Library */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Small insight card */}
          {smallInsights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-[24px] p-5 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 flex flex-col gap-3 hover:shadow-[0_14px_48px_rgba(31,41,55,0.12)] transition-shadow duration-300">
              <TagChip label={insight.tag} />
              <h3 className="text-[16px] font-bold text-[#121c2a] leading-snug tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                {insight.title}
              </h3>
              <p className="text-[13px] text-[#424754] leading-relaxed flex-1 line-clamp-3">
                {insight.description}
              </p>
              <div className="flex items-center gap-1.5 text-[12px] text-[#727785] mt-auto pt-2 border-t border-[#e6eeff]/60">
                <Calendar size={11} />
                {insight.date}
              </div>
            </div>
          ))}

          {/* Shared Library card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 flex flex-col items-center justify-center gap-3 text-center hover:shadow-[0_14px_48px_rgba(31,41,55,0.12)] transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] flex items-center justify-center">
              <FolderOpen size={28} className="text-[#0058be]" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#121c2a] tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                Shared Library
              </h3>
              <p className="text-[13px] text-[#424754] mt-1">
                Access 12 curated collections from your research team.
              </p>
            </div>
            <Link
              href="/hub/documents"
              className="mt-1 px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[13px] font-semibold transition-all shadow-sm shadow-[#0058be]/20"
            >
              Browse Collections
            </Link>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#e6eeff]/60">
            <h3 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              Recent Reports
            </h3>
            <Link href="/hub/documents" className="text-[13px] font-semibold text-[#0058be] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#e6eeff]/60">
            {recentReports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#f8f9ff]/80 transition-colors group">
                {/* File icon */}
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#121c2a] truncate">{report.title}</p>
                  <p className="text-[12px] text-[#727785]">{report.meta}</p>
                </div>
                <button className="p-2 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Download size={16} />
                </button>
              </div>
            ))}
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
