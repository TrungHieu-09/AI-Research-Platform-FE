"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles, ArrowRight, FileText, Zap,
  Brain, RefreshCw, Bookmark, Share2, ChevronDown,
} from "lucide-react"

const syntheses = [
  {
    id: "s1",
    tags: ["AI Synthesized", "Market Trends"],
    title: "The Shift Towards Edge Computing in Generative AI Models",
    summary: "Recent analysis across 40+ academic papers indicates a significant pivot from cloud-reliant LLMs to edge-optimized models. This synthesis highlights primary drivers: latency reduction, data privacy concerns, and the democratization of inference capabilities.",
    docCount: 40,
    model: "Lumis AI v2",
    date: "Oct 24, 2023",
    confidence: 94,
  },
  {
    id: "s2",
    tags: ["AI Synthesized", "Regulatory"],
    title: "EU AI Act: Compliance Roadmap for SaaS Platforms",
    summary: "A consolidated overview of immediate action items required for SaaS platforms operating within the EU. Synthesized from recent regulatory guidelines, legal briefs, and leading compliance frameworks across 28 jurisdictions.",
    docCount: 23,
    model: "Lumis AI v2",
    date: "Oct 22, 2023",
    confidence: 91,
  },
  {
    id: "s3",
    tags: ["AI Synthesized", "Consumer Behavior"],
    title: "Gen Z Adoption Patterns in Spatial Computing Interfaces",
    summary: "Early metrics show a 3x higher onboarding rate among Gen Z cohorts via spatial computing compared to traditional web. Key factors include gamification loops, intuitive physical-digital spaces, and reduced cognitive overhead.",
    docCount: 18,
    model: "Lumis AI v2",
    date: "Oct 20, 2023",
    confidence: 88,
  },
]

function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 90 ? "text-green-600 bg-green-50" : value >= 80 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {value}% confidence
    </span>
  )
}

export default function SynthesisPage() {
  const [generating, setGenerating] = React.useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-6 py-8 max-w-[1100px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] font-semibold text-[#0058be] mb-1 uppercase tracking-widest">AI Synthesis</p>
            <h1 className="text-[32px] font-bold text-[#121c2a] tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              Synthesize Research
            </h1>
            <p className="text-[14px] text-[#424754] mt-1">AI-powered cross-document analysis and insight generation.</p>
          </div>
          <button
            onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2500) }}
            className="flex items-center gap-2 px-5 py-3 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[14px] font-semibold transition-all shadow-md shadow-[#0058be]/20 active:scale-[0.98]"
          >
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
            {generating ? "Generating..." : "New Synthesis"}
          </button>
        </div>

        {/* Generation banner (if generating) */}
        {generating && (
          <div className="bg-[#eff4ff] border border-[#0058be]/20 rounded-2xl px-5 py-4 flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-[#0058be]/10 flex items-center justify-center shrink-0">
              <Brain size={16} className="text-[#0058be] animate-pulse" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#121c2a]">AI is synthesizing across your library...</p>
              <p className="text-[12px] text-[#424754]">Analyzing semantic relationships, extracting key insights, generating cross-references.</p>
            </div>
          </div>
        )}

        {/* Synthesis request box */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-[#0058be]" />
            <span className="text-[14px] font-bold text-[#121c2a]">New Synthesis Request</span>
          </div>
          <textarea
            placeholder="Describe what you want to synthesize... e.g. 'What are the key differences between transformer architectures across the papers in my library?'"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-[#c2c6d6]/50 bg-[#f8f9ff] text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none focus:border-[#0058be]/40 focus:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all resize-none"
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#727785] font-medium">Sources:</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c2c6d6]/50 bg-[#f8f9ff] text-[12px] font-semibold text-[#424754] hover:border-[#0058be]/30 transition-all">
                All Library <ChevronDown size={12} />
              </button>
            </div>
            <button
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2500) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#0058be]/20"
            >
              <Sparkles size={13} />
              Generate Synthesis
            </button>
          </div>
        </div>

        {/* Past syntheses */}
        <div>
          <h2 className="text-[16px] font-bold text-[#121c2a] mb-4" style={{ fontFamily: "Geist, sans-serif" }}>
            Recent Syntheses
          </h2>
          <div className="space-y-4">
            {syntheses.map((syn) => (
              <div key={syn.id} className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_rgba(31,41,55,0.08)] border border-[#e6eeff]/60 hover:shadow-[0_14px_48px_rgba(31,41,55,0.12)] transition-shadow duration-300 group">
                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {syn.tags.map((tag, i) => (
                    <span key={tag} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${i === 0 ? "bg-[#0058be]/10 text-[#0058be] border-[#0058be]/15" : "bg-[#d9e3f6]/60 text-[#424754] border-[#c2c6d6]/40"}`}>
                      {i === 0 && <Sparkles size={9} />}
                      {tag}
                    </span>
                  ))}
                  <ConfidenceBadge value={syn.confidence} />
                  <span className="ml-auto text-[11px] text-[#727785]">{syn.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-[18px] font-bold text-[#121c2a] leading-snug tracking-tight mb-2 group-hover:text-[#0058be] transition-colors" style={{ fontFamily: "Geist, sans-serif" }}>
                  {syn.title}
                </h3>

                {/* Summary */}
                <p className="text-[13px] text-[#424754] leading-relaxed line-clamp-3 mb-4">
                  {syn.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e6eeff]/60">
                  <div className="flex items-center gap-3 text-[12px] text-[#727785]">
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} />
                      <strong className="text-[#121c2a]">{syn.docCount}+</strong> sources
                    </span>
                    <span>by {syn.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-all">
                      <Bookmark size={14} />
                    </button>
                    <button className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-all">
                      <Share2 size={14} />
                    </button>
                    <Link
                      href={`/hub/documents/${syn.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-all"
                    >
                      Read Full <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
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
