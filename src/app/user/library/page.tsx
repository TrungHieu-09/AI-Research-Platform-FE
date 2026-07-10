"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, ChevronDown, Upload, List, LayoutGrid,
  FolderOpen, Plus, Tag, X, FileText, Check, Sparkles,
  MoreVertical, Calendar, Hash, Users, BookOpen, Download
} from "lucide-react"
import { cn } from "@/lib/utils"

/* --- Mock Data --- */
const collections = [
  { name: "All Documents", count: 142, active: true },
  { name: "Thesis Research", count: 45 },
  { name: "Literature Reviews", count: 23 },
  { name: "Data Sets", count: 12 },
  { name: "Machine Learning", count: 89 },
  { name: "Neuroscience", count: 12 },
]

const tags = [
  { name: "#neural-networks", color: "bg-[#eff4ff] text-[#0058be]" },
  { name: "#important", color: "bg-orange-50 text-orange-600" },
  { name: "#to-read", color: "bg-red-50 text-red-600" },
  { name: "#cvpr-2023", color: "bg-[#eff4ff] text-[#0058be]" },
  { name: "#nlp", color: "bg-gray-100 text-gray-600" },
]

const documents = [
  {
    id: 1,
    title: "Attention Is All You Need",
    type: "PDF",
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar",
    year: 2017,
    collection: "Machine Learning",
    selected: true,
  },
  {
    id: 2,
    title: "Language Models are Few-Shot Learners",
    type: "DOCX",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    authors: "Tom B. Brown, Benjamin Mann, Nick Ryder",
    year: 2020,
    collection: "Machine Learning",
  },
  {
    id: 3,
    title: "Deep Residual Learning for Image Recognition",
    type: "PPTX",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren",
    year: 2016,
    collection: "Machine Learning",
  },
  {
    id: 4,
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    type: "TXT",
    iconColor: "text-gray-500",
    iconBg: "bg-gray-100",
    authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee",
    year: 2019,
    collection: "Thesis Research",
  },
  {
    id: 5,
    title: "Generative Adversarial Nets",
    type: "PDF",
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    authors: "Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza",
    year: 2014,
    collection: "Literature Reviews",
  },
]

export default function LibraryPage() {
  const [search, setSearch] = React.useState("")
  const [selectedDocs, setSelectedDocs] = React.useState<number[]>([1])

  const toggleDoc = (id: number) => {
    setSelectedDocs(prev => prev.includes(id) ? [] : [id])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff]">
      {/* Top Header Section */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-[#0058be] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={12} />
              AI RESEARCH LIBRARY
            </div>
            <h1 className="text-[28px] font-bold text-[#121c2a] tracking-tight leading-none mb-2" style={{ fontFamily: "Geist, sans-serif" }}>
              Library
            </h1>
            <p className="text-[14px] text-[#424754]">
              Browse, organize, and query your research documents with Lumis AI context.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">142</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">DOCS</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">14</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">COLLECTIONS</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">62</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">TAGS</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-[480px] px-4 py-2.5 rounded-2xl border border-[#c2c6d6]/50 bg-white shadow-sm focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all">
            <Search size={16} className="text-[#727785] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 bg-transparent text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c2c6d6]/50 rounded-2xl text-[13px] font-semibold text-[#424754] hover:bg-gray-50 shadow-sm transition-all">
              Sort: Date Added
              <ChevronDown size={14} className="text-[#727785]" />
            </button>
            <div className="flex items-center bg-white border border-[#c2c6d6]/50 rounded-2xl p-1 shadow-sm">
              <button className="p-1.5 text-[#424754] bg-gray-100 rounded-xl">
                <List size={16} />
              </button>
              <button className="p-1.5 text-[#727785] hover:text-[#424754] rounded-xl transition-colors">
                <LayoutGrid size={16} />
              </button>
            </div>
            <Link href="/user/upload" className="flex items-center gap-2 px-6 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[14px] font-semibold transition-all shadow-md shadow-[#0058be]/20">
              <Upload size={16} />
              Upload
            </Link>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 flex gap-6">
        
        {/* Left Sidebar - Collections & Tags */}
        <div className="w-[240px] shrink-0 flex flex-col gap-8 overflow-y-auto pr-2 pb-10">
          {/* Collections */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Collections</h3>
              <button className="text-[#727785] hover:text-[#121c2a] transition-colors"><Plus size={14} /></button>
            </div>
            <div className="flex flex-col gap-0.5">
              {collections.map((col) => (
                <button
                  key={col.name}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                    col.active 
                      ? "bg-[#0058be] text-white shadow-sm" 
                      : "text-[#424754] hover:bg-white hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {col.active ? (
                      <FolderOpen size={15} className="shrink-0" fill="currentColor" fillOpacity={0.2} />
                    ) : (
                      <FolderOpen size={15} className="shrink-0 text-[#727785]" />
                    )}
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold shrink-0 ml-2",
                    col.active ? "text-white/80" : "text-[#727785]"
                  )}>
                    {col.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Tags</h3>
              <button className="text-[#727785] hover:text-[#121c2a] transition-colors"><Plus size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-2 px-1">
              {tags.map((tag) => (
                <span
                  key={tag.name}
                  className={cn("px-2.5 py-1 rounded-md text-[11px] font-semibold", tag.color)}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* ── Mini Workspace Overview (Dashboard merged) ── */}
          <div className="mt-2 space-y-3">
            <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider px-1">Workspace</h3>

            {/* 2x2 stat grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Docs", value: "248", icon: "description" },
                { label: "AI Chats", value: "105", icon: "forum" },
                { label: "Collections", value: "14", icon: "folder" },
                { label: "Tags", value: "62", icon: "label" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white border border-[#c2c6d6]/40 rounded-xl p-2.5 shadow-sm hover:border-[#0058be]/30 transition-colors">
                  <span className="material-symbols-outlined text-[13px] text-[#727785] block mb-1">{icon}</span>
                  <p className="text-[17px] font-extrabold text-[#0058be] leading-none mb-0.5 tracking-tight">{value}</p>
                  <p className="text-[10px] text-[#727785] font-semibold uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Storage mini bar */}
            <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#424754] uppercase tracking-wide">Storage</span>
                <span className="text-[11px] font-semibold text-[#0058be]">2.1 / 5 GB</span>
              </div>
              <div className="w-full h-1.5 bg-[#e6eeff] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3] rounded-full" style={{ width: "42%" }} />
              </div>
              <p className="text-[10px] text-[#727785] mt-1.5 font-medium">42% used · Free plan</p>
            </div>

            {/* AI Insight snippet */}
            <div className="bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] border border-[#0058be]/15 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0058be]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[10px] font-bold text-[#0058be] uppercase tracking-wide">AI Insight</span>
              </div>
              <p className="text-[11px] text-[#424754] leading-relaxed line-clamp-3">
                87% methodological overlap across Neural Plasticity papers. 2 research gaps identified.
              </p>
            </div>
          </div>
        </div>

        {/* Center - Document Index */}
        <div className="flex-1 bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#c2c6d6]/30">
            <div>
              <h2 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Document Index
              </h2>
              <p className="text-[13px] text-[#727785] mt-0.5">
                8 matching documents in the current workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/user/ai-workspace${selectedDocs.length > 0 ? `?docId=${selectedDocs[0]}` : ""}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0058be] hover:bg-[#004ca3] text-white text-[12px] font-semibold shadow-sm transition-colors"
              >
                <Sparkles size={14} />
                Analyze with AI
              </Link>
              <div className="px-3 py-1.5 rounded-full bg-[#eff4ff] border border-[#0058be]/20 text-[#0058be] text-[12px] font-semibold">
                AI-ready
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_100px_160px_40px] gap-4 px-6 py-3 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/50 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
            <div className="w-[20px]"></div>
            <div>Title & Authors</div>
            <div>Year</div>
            <div>Collection</div>
            <div></div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)_100px_160px_40px] gap-4 px-6 py-4 border-b border-[#c2c6d6]/20 hover:bg-[#f8f9ff] transition-colors items-center group",
                  selectedDocs.includes(doc.id) && "bg-[#eff4ff]/40"
                )}
              >
                <div className="w-[20px] flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    checked={selectedDocs.includes(doc.id)} 
                    onChange={() => toggleDoc(doc.id)}
                    className="w-4 h-4 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be]" 
                  />
                </div>
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", doc.iconBg)}>
                    <FileText size={16} className={doc.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[14px] font-bold text-[#121c2a] truncate">{doc.title}</p>
                      <span className="text-[9px] font-bold text-[#727785] bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{doc.type}</span>
                    </div>
                    <p className="text-[12px] text-[#727785] truncate">{doc.authors}</p>
                  </div>
                </div>
                <div className="text-[13px] font-medium text-[#424754]">{doc.year}</div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#424754] bg-white border border-[#c2c6d6]/40 px-2 py-1 rounded-md shadow-sm w-fit">
                  <FolderOpen size={12} className="text-[#727785]" />
                  <span className="truncate">{doc.collection}</span>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Inspector */}
        <div className="w-[320px] shrink-0 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-3xl p-5 shadow-sm overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">Inspector</p>
              <h3 className="text-[15px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Document Details</h3>
            </div>
            <button className="p-1.5 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Featured Card */}
          <div className="bg-gradient-to-br from-[#0058be] to-[#004ca3] rounded-2xl p-5 text-white shadow-md shadow-[#0058be]/20 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
              <FileText size={20} className="text-white" />
            </div>
            <h4 className="text-[16px] font-bold leading-snug mb-2">Attention Is All You Need</h4>
            <p className="text-[12px] text-white/80 leading-relaxed">Ashish Vaswani, Noam Shazeer, Niki Parmar</p>
          </div>

          {/* Metadata Grid */}
          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Metadata</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                <Calendar size={14} className="text-[#0058be] mb-2" />
                <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Year</p>
                <p className="text-[13px] font-bold text-[#121c2a]">2017</p>
              </div>
              <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                <Hash size={14} className="text-[#0058be] mb-2" />
                <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Status</p>
                <p className="text-[13px] font-bold text-[#121c2a]">Published</p>
              </div>
              <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                <FolderOpen size={14} className="text-[#0058be] mb-2" />
                <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Collection</p>
                <p className="text-[13px] font-bold text-[#121c2a]">Machine Learning</p>
              </div>
              <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                <Users size={14} className="text-[#0058be] mb-2" />
                <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Authors</p>
                <p className="text-[13px] font-bold text-[#121c2a]">3</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-[#eff4ff] text-[#0058be] rounded-md text-[11px] font-semibold">#neural-networks</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-semibold">#nlp</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
