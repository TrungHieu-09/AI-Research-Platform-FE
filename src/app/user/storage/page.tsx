"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useSpring, useInView } from "framer-motion"
import {
  Search, HardDrive, FileText, FileType2, AlignLeft,
  MoreVertical, Trash2, Download, Share2, Sparkles,
  TrendingUp, Clock, CloudUpload, RefreshCw, ChevronRight,
  AlertCircle, CheckCircle2, Zap, ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Animation Variants ─────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.08, duration: 0.4 } }),
}

/* ─── Animated Number ────────────────────────── */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { damping: 30, stiffness: 80 })
  const [display, setDisplay] = React.useState("0")
  React.useEffect(() => { if (inView) motionVal.set(value) }, [inView, value, motionVal])
  React.useEffect(() => spring.on("change", v => setDisplay(v.toFixed(decimals))), [spring, decimals])
  return <span ref={ref}>{display}</span>
}

/* ─── Mock Data ─────────────────────────────── */
const storageBreakdown = [
  { label: "PDF", gb: 45.2, color: "#e55858", pct: 70.4 },
  { label: "DOCX", gb: 15.1, color: "#0058be", pct: 23.5 },
  { label: "TXT", gb: 4.5, color: "#f59e0b", pct: 7.0 },
]

const totalUsed = 64.8
const totalCap = 128
const usedPct = Math.round((totalUsed / totalCap) * 100)

const fileTypeCards = [
  {
    id: "pdf",
    label: "PDF Docs",
    count: "1,284 documents",
    icon: FileText,
    iconColor: "text-[#e55858]",
    iconBg: "bg-[#fff1f1]",
    size: "45.2 GB",
    trend: "+12 this week",
  },
  {
    id: "docx",
    label: "DOCX Files",
    count: "456 documents",
    icon: FileType2,
    iconColor: "text-[#0058be]",
    iconBg: "bg-[#eff4ff]",
    size: "15.1 GB",
    trend: "+3 this week",
  },
  {
    id: "txt",
    label: "Plain Text",
    count: "2,891 notes",
    icon: AlignLeft,
    iconColor: "text-[#f59e0b]",
    iconBg: "bg-[#fffbeb]",
    size: "4.5 GB",
    trend: "+128 this week",
  },
]

const largestFiles = [
  { name: "Genome_Sequencing_2024_Full.pdf", type: "PDF", size: "2.4 GB", modified: "2 days ago" },
  { name: "Climate_Data_Aggregation_v2.docx", type: "DOCX", size: "840 MB", modified: "5 days ago" },
  { name: "Neural_Network_Architectures_Review.pdf", type: "PDF", size: "620 MB", modified: "1 week ago" },
  { name: "Quantum_Computing_Lecture_Series.pdf", type: "PDF", size: "510 MB", modified: "1 week ago" },
  { name: "BioInformatics_Dataset_2023.txt", type: "TXT", size: "380 MB", modified: "2 weeks ago" },
  { name: "Protein_Folding_Simulation_Raw.docx", type: "DOCX", size: "295 MB", modified: "3 weeks ago" },
]

const recentUploads = [
  { name: "Thesis_Proposal_Draft_1.txt", size: "12 KB", time: "2 hours ago" },
  { name: "Astro_Physics_Survey_Results.pdf", size: "18.5 MB", time: "Yesterday" },
  { name: "ML_Conference_Notes_NeurIPS.docx", size: "4.2 MB", time: "2 days ago" },
  { name: "Epigenetics_Review_2024.pdf", size: "7.8 MB", time: "3 days ago" },
]

/* ─── Helpers ─────────────────────────────── */
function fileTypeIcon(type: string) {
  if (type === "PDF") return { icon: FileText, color: "text-[#e55858]", bg: "bg-[#fff1f1]" }
  if (type === "DOCX") return { icon: FileType2, color: "text-[#0058be]", bg: "bg-[#eff4ff]" }
  return { icon: AlignLeft, color: "text-[#f59e0b]", bg: "bg-[#fffbeb]" }
}

/* ─── File Row Dropdown ─────────────────────── */
function FileRowMenu() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-xl text-[#727785] hover:bg-[#f0f4ff] hover:text-[#0058be] transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-[#c2c6d6]/50 rounded-2xl shadow-xl shadow-black/8 py-1 overflow-hidden">
          {[
            { icon: Download, label: "Download" },
            { icon: Share2, label: "Share" },
            { icon: Trash2, label: "Delete", danger: true },
          ].map(({ icon: Icon, label, danger }) => (
            <button
              key={label}
              className={cn(
                "flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium transition-colors",
                danger
                  ? "text-red-500 hover:bg-red-50"
                  : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────── */
export default function StoragePage() {
  const [search, setSearch] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<"all" | "PDF" | "DOCX" | "TXT">("all")

  const filtered = largestFiles.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === "all" || f.type === activeFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9ff]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 pb-20">

        {/* ── Page Header ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
          initial="hidden" animate="visible" variants={fadeUp}
        >
          <div>
            <motion.div
              className="flex items-center gap-1.5 text-[#0058be] text-[11px] font-bold uppercase tracking-wider mb-1.5"
              variants={fadeUp} custom={0}
            >
              <HardDrive size={12} />
              CLOUD STORAGE
            </motion.div>
            <motion.h1
              className="text-[28px] font-bold text-[#121c2a] tracking-tight leading-none mb-2"
              style={{ fontFamily: "Geist, sans-serif" }}
              variants={fadeUp} custom={1}
            >
              Storage
            </motion.h1>
            <motion.p className="text-[14px] text-[#424754]" variants={fadeUp} custom={2}>
              Manage your research files, monitor usage, and optimise storage space.
            </motion.p>
          </div>

          {/* Search */}
          <motion.div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-[#c2c6d6]/50 bg-white shadow-sm w-full sm:w-[300px] focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all"
            variants={fadeUp} custom={3}
          >
            <Search size={15} className="text-[#727785] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search research files..."
              className="flex-1 bg-transparent text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none"
            />
          </motion.div>
        </motion.div>

        {/* ── Storage Usage Card ── */}
        <motion.div
          className="bg-white border border-[#c2c6d6]/40 rounded-3xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0,88,190,0.10)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-1">
                TOTAL STORAGE
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[36px] font-bold text-[#0058be] leading-none"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  <AnimatedNumber value={totalUsed} decimals={1} /> GB
                </span>
                <span className="text-[16px] text-[#424754] font-medium">
                  of {totalCap} GB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] text-[#727785]"><AnimatedNumber value={usedPct} />% used</p>
                <p className="text-[12px] text-[#424754] font-medium">{totalCap - totalUsed} GB free</p>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/user/payment"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[13px] font-semibold transition-all shadow-md shadow-[#0058be]/20 whitespace-nowrap"
                >
                  <ArrowUpRight size={15} />
                  Upgrade Plan
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Multi-segment progress bar */}
          <div className="w-full h-3 bg-[#f0f4ff] rounded-full overflow-hidden flex mb-3.5">
            {storageBreakdown.map((seg, i) => (
              <motion.div
                key={seg.label}
                className="h-full"
                style={{ backgroundColor: seg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${seg.pct}%` }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {storageBreakdown.map((seg, i) => (
              <motion.div
                key={seg.label}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[12px] text-[#424754] font-medium">
                  {seg.label} ({seg.gb} GB)
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── File Type Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {fileTypeCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.id}
                className="bg-white border border-[#c2c6d6]/40 rounded-3xl p-5 shadow-sm cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(0,88,190,0.12)", borderColor: "rgba(0,88,190,0.25)" }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-4", card.iconBg)}
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon size={22} className={card.iconColor} />
                </motion.div>
                <h3
                  className="text-[17px] font-bold text-[#121c2a] mb-0.5"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  {card.label}
                </h3>
                <p className="text-[13px] text-[#727785] mb-3">{card.count}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#0058be]">{card.size}</span>
                  <span className="text-[11px] text-[#727785] bg-[#f8f9ff] border border-[#c2c6d6]/40 px-2 py-1 rounded-md">
                    {card.trend}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Optimization Banner ── */}
        <motion.div
          className="bg-gradient-to-r from-[#0058be] to-[#316bf3] rounded-3xl p-6 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          whileHover={{ scale: 1.005 }}
        >
          <motion.div
            className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-24 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold text-white mb-1" style={{ fontFamily: "Geist, sans-serif" }}>
                Optimization Opportunity
              </h3>
              <p className="text-[13px] text-white/80 leading-relaxed">
                Lumis AI found <span className="font-semibold text-white">4.2 GB</span> of duplicate research papers across your library. Merge them to free up space.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="flex items-center gap-1.5 text-[13px] font-semibold text-white/90 hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap">
                Review Duplicates
                <ChevronRight size={14} />
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#0058be] rounded-2xl text-[13px] font-bold hover:bg-[#eff4ff] transition-colors shadow-md whitespace-nowrap">
                <Zap size={14} />
                Auto-Clean
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-4 border-t border-white/15 relative z-10">
            {[
              { icon: CheckCircle2, label: "Duplicates found", value: "4.2 GB" },
              { icon: TrendingUp, label: "Potential savings", value: "6.5%" },
              { icon: RefreshCw, label: "Last scanned", value: "2 hrs ago" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} className="text-white/70" />
                <span className="text-[12px] text-white/70">{label}:</span>
                <span className="text-[12px] font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Main Grid: Files + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Largest Files Table */}
          <div className="bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-[#c2c6d6]/30">
              <div>
                <h2 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Largest Files
                </h2>
                <p className="text-[13px] text-[#727785] mt-0.5">
                  Files consuming the most storage space
                </p>
              </div>
              {/* Filter chips */}
              <div className="flex items-center gap-1 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-1 w-fit">
                {(["all", "PDF", "DOCX", "TXT"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                      activeFilter === f
                        ? "bg-[#0058be] text-white shadow-sm"
                        : "text-[#424754] hover:text-[#0058be]"
                    )}
                  >
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Col headers */}
            <div className="grid grid-cols-[minmax(0,1fr)_80px_100px_40px] gap-4 px-6 py-3 bg-[#f8f9ff]/60 border-b border-[#c2c6d6]/20 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
              <div>File Name</div>
              <div>Type</div>
              <div>Size</div>
              <div />
            </div>

            <div className="divide-y divide-[#c2c6d6]/20">
              <AnimatePresence mode="popLayout">
              {filtered.map((file, i) => {
                const { icon: Icon, color, bg } = fileTypeIcon(file.type)
                return (
                  <motion.div
                    key={file.name}
                    className="grid grid-cols-[minmax(0,1fr)_80px_100px_40px] gap-4 px-6 py-4 hover:bg-[#f8f9ff] transition-colors items-center"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: "#f8f9ff" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                        <Icon size={16} className={color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#121c2a] truncate">{file.name}</p>
                        <p className="text-[11px] text-[#727785]">{file.modified}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#727785] bg-[#f8f9ff] border border-[#c2c6d6]/40 px-2 py-1 rounded-md w-fit">
                      {file.type}
                    </span>
                    <span className="text-[13px] font-semibold text-[#424754]">{file.size}</span>
                    <FileRowMenu />
                  </motion.div>
                )
              })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle size={32} className="text-[#c2c6d6] mb-3" />
                  <p className="text-[14px] font-medium text-[#727785]">No files match your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Recently Uploaded */}
            <div className="bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2c6d6]/30">
                <h3 className="text-[15px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Recently Uploaded
                </h3>
                <Link
                  href="/user/upload"
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#0058be] hover:underline"
                >
                  Upload <CloudUpload size={13} />
                </Link>
              </div>
              <div className="divide-y divide-[#c2c6d6]/20">
                {recentUploads.map((f, i) => {
                  const ext = f.name.endsWith(".pdf") ? "PDF" : f.name.endsWith(".docx") ? "DOCX" : "TXT"
                  const { icon: Icon, color, bg } = fileTypeIcon(ext)
                  return (
                    <motion.div
                      key={f.name}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-[#f8f9ff] transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                    >
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", bg)}>
                        <Icon size={16} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#121c2a] truncate">{f.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={11} className="text-[#727785] shrink-0" />
                          <span className="text-[11px] text-[#727785]">{f.time}</span>
                          <span className="text-[11px] text-[#727785]">• {f.size}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Cloud Sync Card */}
            <div className="bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] border border-[#0058be]/15 rounded-3xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0058be]/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-[#0058be]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                    Cloud Sync
                  </h4>
                  <p className="text-[12px] text-[#424754] mt-0.5 leading-relaxed">
                    Securely synced with institutional repository. Last sync:{" "}
                    <span className="font-medium text-[#0058be]">5 min ago</span>.
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#0058be]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0058be] rounded-full" style={{ width: "51%" }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-[#727785]">Synced</span>
                <span className="text-[11px] font-medium text-[#0058be]">51% of capacity</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#c2c6d6]/40 rounded-3xl p-5 shadow-sm">
              <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">
                Quick Actions
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { icon: Download, label: "Export all files" },
                  { icon: RefreshCw, label: "Scan for duplicates" },
                  { icon: Trash2, label: "Empty trash", danger: true },
                ].map(({ icon: Icon, label, danger }) => (
                  <button
                    key={label}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left",
                      danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
