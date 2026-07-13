"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, ChevronDown, Upload, List, LayoutGrid,
  FolderOpen, Plus, Tag, X, FileText, Check, Sparkles,
  MoreVertical, Calendar, Hash, Users, BookOpen, Download, Trash2, Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

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
  const { token } = useAuth()
  const [search, setSearch] = React.useState("")
  const [selectedDocs, setSelectedDocs] = React.useState<string[]>([])
  const [docs, setDocs] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch("/api/documents", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.items) {
        setDocs(data.items.map((item: any) => {
          let type = "DOC";
          let iconBg = "bg-gray-100";
          let iconColor = "text-gray-500";
          if (item.mimeType?.includes("pdf")) {
            type = "PDF"; iconBg = "bg-red-50"; iconColor = "text-red-500";
          } else if (item.mimeType?.includes("word") || item.mimeType?.includes("document")) {
            type = "DOCX"; iconBg = "bg-blue-50"; iconColor = "text-blue-500";
          } else if (item.mimeType?.includes("text")) {
            type = "TXT";
          }
          return {
            id: item.id,
            title: item.title,
            type,
            iconColor,
            iconBg,
            authors: "You",
            year: new Date(item.createdAt).getFullYear(),
            collection: item.subject?.name || "N/A",
            status: item.status,
            raw: item
          };
        }));
        if (data.items.length > 0) setSelectedDocs([data.items[0].id]);
      }
    })
    .catch(console.error)
  }, [token])

  const filteredDocs = React.useMemo(() => {
    return docs.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()))
  }, [docs, search])

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? [] : [id])
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/documents/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id));
        if (selectedDocs.includes(id)) {
          setSelectedDocs(prev => prev.filter(selId => selId !== id));
        }
      } else {
        const error = await res.json();
        alert(error.error || "Có lỗi xảy ra khi xóa tài liệu.");
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến máy chủ.");
    }
  }
  
  const selectedDocDetails = docs.find(d => d.id === selectedDocs[0])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff]">
      {/* Top Header Section */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-[#0058be] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={12} />
              THƯ VIỆN NGHIÊN CỨU AI
            </div>
            <h1 className="text-[28px] font-bold text-[#121c2a] tracking-tight leading-none mb-2" style={{ fontFamily: "Geist, sans-serif" }}>
              Thư viện
            </h1>
            <p className="text-[14px] text-[#424754]">
              Duyệt, tổ chức và truy vấn tài liệu nghiên cứu của bạn với ngữ cảnh AI từ Lumis.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">142</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">TÀI LIỆU</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">14</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">BỘ SƯU TẬP</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">62</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">THẺ</span>
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
              placeholder="Tìm kiếm tài liệu..."
              className="flex-1 bg-transparent text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c2c6d6]/50 rounded-2xl text-[13px] font-semibold text-[#424754] hover:bg-gray-50 shadow-sm transition-all">
              Sắp xếp: Ngày thêm
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
              Tải lên
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
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Bộ sưu tập</h3>
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
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Thẻ</h3>
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
            <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider px-1">Không gian làm việc</h3>

            {/* 2x2 stat grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Tài liệu", value: "248", icon: "description" },
                { label: "AI Chat", value: "105", icon: "forum" },
                { label: "Bộ sưu tập", value: "14", icon: "folder" },
                { label: "Thẻ", value: "62", icon: "label" },
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
                <span className="text-[11px] font-bold text-[#424754] uppercase tracking-wide">Lưu trữ</span>
                <span className="text-[11px] font-semibold text-[#0058be]">2.1 / 5 GB</span>
              </div>
              <div className="w-full h-1.5 bg-[#e6eeff] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3] rounded-full" style={{ width: "42%" }} />
              </div>
              <p className="text-[10px] text-[#727785] mt-1.5 font-medium">Đã dùng 42% · Gói Miễn phí</p>
            </div>

            {/* AI Insight snippet */}
            <div className="bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] border border-[#0058be]/15 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0058be]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[10px] font-bold text-[#0058be] uppercase tracking-wide">Góc nhìn AI</span>
              </div>
              <p className="text-[11px] text-[#424754] leading-relaxed line-clamp-3">
                Trùng lặp phương pháp luận 87% giữa các bài báo về Neural Plasticity. Phát hiện 2 khoảng trống nghiên cứu.
              </p>
            </div>
          </div>
        </div>

        {/* Center - Document Index */}
        <div className="flex-1 bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#c2c6d6]/30">
            <div>
              <h2 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Danh mục tài liệu
              </h2>
              <p className="text-[13px] text-[#727785] mt-0.5">
                {filteredDocs.length} tài liệu phù hợp trong không gian làm việc hiện tại.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/user/ai-workspace${selectedDocs.length > 0 ? `?docId=${selectedDocs[0]}` : ""}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0058be] hover:bg-[#004ca3] text-white text-[12px] font-semibold shadow-sm transition-colors"
              >
                <Sparkles size={14} />
                Phân tích với AI
              </Link>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_100px_160px_40px] gap-4 px-6 py-3 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/50 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
            <div className="w-[20px]"></div>
            <div>Tiêu đề & Tác giả</div>
            <div>Năm</div>
            <div>Bộ sưu tập</div>
            <div></div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.map((doc) => (
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
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  {doc.raw?.fileUrl && (
                    <a
                      href={doc.raw.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors"
                      title="Xem tài liệu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye size={16} />
                    </a>
                  )}
                  {doc.raw?.fileUrl && (
                    <a
                      href={doc.raw.fileUrl}
                      download
                      className="p-1.5 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors"
                      title="Tải xuống"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                    className="p-1.5 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                    title="Xóa tài liệu"
                  >
                    <Trash2 size={16} />
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
              <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">CHI TIẾT</p>
              <h3 className="text-[15px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Chi tiết tài liệu</h3>
            </div>
            <div className="flex items-center gap-1">
              {selectedDocDetails?.raw?.fileUrl && (
                <a
                  href={selectedDocDetails.raw.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors"
                  title="Xem tài liệu"
                >
                  <Eye size={16} />
                </a>
              )}
              {selectedDocDetails && (
                <button 
                  onClick={() => handleDeleteDocument(selectedDocDetails.id)}
                  className="p-1.5 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Xóa tài liệu"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setSelectedDocs([])}
                className="p-1.5 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl transition-colors"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Featured Card */}
          {selectedDocDetails ? (
            <>
              <div className="bg-gradient-to-br from-[#0058be] to-[#004ca3] rounded-2xl p-5 text-white shadow-md shadow-[#0058be]/20 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                  <FileText size={20} className="text-white" />
                </div>
                <h4 className="text-[16px] font-bold leading-snug mb-2">{selectedDocDetails.title}</h4>
                <p className="text-[12px] text-white/80 leading-relaxed">{selectedDocDetails.authors}</p>
              </div>

              {/* Metadata Grid */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Siêu dữ liệu</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                    <Calendar size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Năm</p>
                    <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocDetails.year}</p>
                  </div>
                  <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                    <Hash size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Trạng thái</p>
                    <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocDetails.status}</p>
                  </div>
                  <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                    <FolderOpen size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Bộ sưu tập</p>
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{selectedDocDetails.collection}</p>
                  </div>
                  <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
                    <Users size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Tác giả</p>
                    <p className="text-[13px] font-bold text-[#121c2a]">1</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-[13px] text-[#727785] text-center mt-10">
              Chọn một tài liệu để xem chi tiết
            </div>
          )}

          {/* Tags */}
          <div>
            <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Thẻ</h4>
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
