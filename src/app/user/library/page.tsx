"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, ChevronDown, Upload, List, LayoutGrid,
  FolderOpen, Plus, Tag, X, FileText, Check, Sparkles,
  MoreVertical, Calendar, Hash, Users, BookOpen, Download, Trash2, Eye,
  Bookmark, Share2, FolderPlus, Loader2, AlertCircle, CheckCircle2, Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function LibraryPage() {
  const { token } = useAuth()
  
  // State for search and filters
  const [search, setSearch] = React.useState("")
  const [activeCol, setActiveCol] = React.useState<string>("all") // "all", "bookmarked", or collectionId/name
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest" | "title">("newest")
  
  // State for data
  const [docs, setDocs] = React.useState<any[]>([])
  const [collections, setCollections] = React.useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = React.useState(true)
  
  // Selection state
  const [selectedDocs, setSelectedDocs] = React.useState<string[]>([])
  
  // Modals state
  const [isCreateColModalOpen, setIsCreateColModalOpen] = React.useState(false)
  const [newColName, setNewColName] = React.useState("")
  const [newColDesc, setNewColDesc] = React.useState("")
  const [creatingCol, setCreatingCol] = React.useState(false)

  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [shareDocId, setShareDocId] = React.useState<string | null>(null)
  const [shareInput, setShareInput] = React.useState("")
  const [sharePermission, setSharePermission] = React.useState<"view" | "comment" | "edit">("view")
  const [sharing, setSharing] = React.useState(false)

  const [isAddToColModalOpen, setIsAddToColModalOpen] = React.useState(false)
  const [targetDocIdForCol, setTargetDocIdForCol] = React.useState<string | null>(null)
  const [selectedColForAdd, setSelectedColForAdd] = React.useState<string>("")
  const [addingToCol, setAddingToCol] = React.useState(false)

  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Fetch Documents & Collections from API
  const fetchAllData = React.useCallback(async () => {
    if (!token) return
    setLoadingDocs(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const [docsRes, colsRes] = await Promise.all([
        fetch(`${baseUrl}/api/documents`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/collections`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        if (docsData && docsData.items) {
          const mapped = docsData.items.map((item: any) => {
            let type = "DOC"
            let iconBg = "bg-gray-100"
            let iconColor = "text-gray-500"
            if (item.mimeType?.toLowerCase().includes("pdf")) {
              type = "PDF"; iconBg = "bg-red-50"; iconColor = "text-red-500"
            } else if (item.mimeType?.toLowerCase().includes("word") || item.mimeType?.toLowerCase().includes("document")) {
              type = "DOCX"; iconBg = "bg-blue-50"; iconColor = "text-blue-500"
            } else if (item.mimeType?.toLowerCase().includes("text")) {
              type = "TXT"
            }
            
            const isBookmarked = item.bookmarks && Array.isArray(item.bookmarks) && item.bookmarks.length > 0
            const collectionNames = item.collections?.map((c: any) => c.collection?.name || "").filter(Boolean) || []
            const firstCol = collectionNames[0] || item.subject?.name || "Chung"

            return {
              id: item.id,
              title: item.title || "Tài liệu không tên",
              type,
              iconColor,
              iconBg,
              authors: "Bạn (Chủ sở hữu)",
              year: new Date(item.createdAt).getFullYear(),
              createdAt: item.createdAt,
              collection: firstCol,
              collectionList: item.collections || [],
              isBookmarked,
              status: item.status || "APPROVED",
              tags: item.tags || [],
              raw: item
            }
          })
          setDocs(mapped)
          if (mapped.length > 0 && selectedDocs.length === 0) {
            setSelectedDocs([mapped[0].id])
          }
        }
      }

      if (colsRes.ok) {
        const colsData = await colsRes.json()
        if (Array.isArray(colsData)) {
          setCollections(colsData)
        }
      }
    } catch (err) {
      console.error("Failed to fetch library data:", err)
    } finally {
      setLoadingDocs(false)
    }
  }, [token])

  React.useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Compute unique tags dynamically
  const allTags = React.useMemo(() => {
    const map = new Map<string, string>()
    docs.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((t: any) => {
          if (t.name) map.set(t.name, t.name)
        })
      }
    })
    const list = Array.from(map.values())
    // If no real tags yet, add some nice defaults for visualization
    if (list.length === 0) {
      return ["#neural-networks", "#thesis", "#important", "#ai-research", "#cvpr-2024"]
    }
    return list
  }, [docs])

  // Filter and sort documents
  const filteredDocs = React.useMemo(() => {
    return docs.filter(doc => {
      // Search check
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.raw?.description?.toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      // Collection check
      if (activeCol === "bookmarked") {
        if (!doc.isBookmarked) return false
      } else if (activeCol !== "all") {
        const inCol = doc.collectionList?.some((c: any) => 
          c.collection?.id === activeCol || c.collection?.name === activeCol
        ) || doc.collection === activeCol
        if (!inCol) return false
      }

      // Tag check
      if (activeTag) {
        const hasTag = doc.tags?.some((t: any) => t.name === activeTag) || activeTag === "#important" && doc.isBookmarked
        if (!hasTag) return false
      }

      return true
    }).sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return a.title.localeCompare(b.title)
    })
  }, [docs, search, activeCol, activeTag, sortOrder])

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? [] : [id])
  }

  // Handle Bookmark Toggle
  const handleToggleBookmark = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const target = docs.find(d => d.id === docId)
    if (!target) return

    const wasBookmarked = target.isBookmarked
    // Optimistic UI update
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, isBookmarked: !wasBookmarked } : d))

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/bookmarks/${docId}`, {
        method: wasBookmarked ? "DELETE" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) {
        // revert
        setDocs(prev => prev.map(d => d.id === docId ? { ...d, isBookmarked: wasBookmarked } : d))
        showToast("Không thể thay đổi trạng thái đánh dấu.", "error")
      } else {
        showToast(wasBookmarked ? "Đã gỡ đánh dấu tài liệu." : "Đã đánh dấu tài liệu quan trọng!", "success")
      }
    } catch (err) {
      setDocs(prev => prev.map(d => d.id === docId ? { ...d, isBookmarked: wasBookmarked } : d))
      showToast("Lỗi kết nối máy chủ.", "error")
    }
  }

  // Handle Create Collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return
    setCreatingCol(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: newColName.trim(), description: newColDesc.trim() })
      })

      if (res.ok) {
        const newCol = await res.json()
        setCollections(prev => [newCol, ...prev])
        setActiveCol(newCol.id)
        setIsCreateColModalOpen(false)
        setNewColName("")
        setNewColDesc("")
        showToast(`Đã tạo bộ sưu tập "${newCol.name}"!`, "success")
      } else {
        const err = await res.json()
        showToast(err.error || "Tên bộ sưu tập không hợp lệ.", "error")
      }
    } catch (err) {
      showToast("Không thể kết nối máy chủ.", "error")
    } finally {
      setCreatingCol(false)
    }
  }

  // Handle Add Document to Collection
  const handleAddDocToCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetDocIdForCol || !selectedColForAdd) return
    setAddingToCol(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/collections/${selectedColForAdd}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ documentId: targetDocIdForCol })
      })

      if (res.ok) {
        showToast("Đã thêm tài liệu vào bộ sưu tập!", "success")
        setIsAddToColModalOpen(false)
        fetchAllData()
      } else {
        const err = await res.json()
        showToast(err.error || "Tài liệu có thể đã nằm trong bộ sưu tập này.", "error")
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setAddingToCol(false)
    }
  }

  // Handle Share Document
  const handleShareDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareDocId || !shareInput.trim()) return
    setSharing(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${shareDocId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sharedWith: shareInput.trim(),
          permission: sharePermission
        })
      })

      if (res.ok) {
        showToast(`Đã chia sẻ tài liệu thành công cho ${shareInput}!`, "success")
        setIsShareModalOpen(false)
        setShareInput("")
      } else {
        const err = await res.json()
        showToast(err.error || "Không tìm thấy người dùng hoặc quyền không hợp lệ.", "error")
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setSharing(false)
    }
  }

  // Handle Delete Document
  const handleDeleteDocument = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này vào thùng rác?")) return
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id))
        if (selectedDocs.includes(id)) {
          setSelectedDocs(prev => prev.filter(selId => selId !== id))
        }
        showToast("Đã chuyển tài liệu vào thùng rác.", "success")
      } else {
        const error = await res.json()
        showToast(error.error || "Có lỗi xảy ra khi xóa tài liệu.", "error")
      }
    } catch (error) {
      showToast("Không thể kết nối đến máy chủ.", "error")
    }
  }
  
  const selectedDocDetails = docs.find(d => d.id === selectedDocs[0])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-[13px] font-semibold max-w-sm",
            toastMessage.type === "success" 
              ? "bg-white border-[#0058be]/20 text-[#121c2a]" 
              : "bg-red-50 border-red-200 text-red-700"
          )}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="text-[#0058be] shrink-0" size={18} />
            ) : (
              <AlertCircle className="text-red-600 shrink-0" size={18} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-[#0058be] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={12} />
              THƯ VIỆN NGHIÊN CỨU AI
            </div>
            <h1 className="text-[28px] font-bold text-[#121c2a] tracking-tight leading-none mb-2" style={{ fontFamily: "Geist, sans-serif" }}>
              Kho Tài liệu & Bộ sưu tập
            </h1>
            <p className="text-[14px] text-[#424754]">
              Duyệt, tổ chức và hỏi đáp trực tiếp với AI về các nghiên cứu và tài liệu của bạn.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[92px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">{docs.length}</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">TÀI LIỆU</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[92px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">{collections.length}</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">BỘ SƯU TẬP</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[92px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">{docs.filter(d => d.isBookmarked).length}</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">QUAN TRỌNG</span>
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
              placeholder="Tìm kiếm tài liệu theo tiêu đề hoặc mô tả..."
              className="flex-1 bg-transparent text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#727785] hover:text-[#121c2a]">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="px-4 py-2.5 bg-white border border-[#c2c6d6]/50 rounded-2xl text-[13px] font-semibold text-[#424754] hover:bg-gray-50 shadow-sm transition-all outline-none cursor-pointer"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
              <option value="title">Sắp xếp: Theo tiêu đề (A-Z)</option>
            </select>

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
              <button 
                onClick={() => setIsCreateColModalOpen(true)}
                className="text-[#0058be] hover:bg-[#eff4ff] p-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                title="Tạo bộ sưu tập mới"
              >
                <Plus size={14} /> Thêm
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {/* All documents */}
              <button
                onClick={() => { setActiveCol("all"); setActiveTag(null); }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                  activeCol === "all" 
                    ? "bg-[#0058be] text-white shadow-sm" 
                    : "text-[#424754] hover:bg-white hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FolderOpen size={15} className={cn("shrink-0", activeCol === "all" ? "text-white" : "text-[#727785]")} />
                  <span className="truncate">Tất cả tài liệu</span>
                </div>
                <span className={cn("text-[11px] font-semibold shrink-0 ml-2", activeCol === "all" ? "text-white/80" : "text-[#727785]")}>
                  {docs.length}
                </span>
              </button>

              {/* Bookmarked documents */}
              <button
                onClick={() => { setActiveCol("bookmarked"); setActiveTag(null); }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                  activeCol === "bookmarked" 
                    ? "bg-[#0058be] text-white shadow-sm" 
                    : "text-[#424754] hover:bg-white hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Star size={15} className={cn("shrink-0", activeCol === "bookmarked" ? "text-yellow-300 fill-yellow-300" : "text-amber-500")} />
                  <span className="truncate">Đã đánh dấu</span>
                </div>
                <span className={cn("text-[11px] font-semibold shrink-0 ml-2", activeCol === "bookmarked" ? "text-white/80" : "text-[#727785]")}>
                  {docs.filter(d => d.isBookmarked).length}
                </span>
              </button>

              {/* Dynamic Collections */}
              {collections.map((col) => {
                const count = docs.filter(d => d.collectionList?.some((c: any) => c.collection?.id === col.id || c.collection?.name === col.name) || d.collection === col.name).length
                const isActive = activeCol === col.id || activeCol === col.name
                return (
                  <button
                    key={col.id || col.name}
                    onClick={() => { setActiveCol(col.id || col.name); setActiveTag(null); }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                      isActive 
                        ? "bg-[#0058be] text-white shadow-sm" 
                        : "text-[#424754] hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderOpen size={15} className={cn("shrink-0", isActive ? "text-white" : "text-[#0058be]")} />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className={cn("text-[11px] font-semibold shrink-0 ml-2", isActive ? "text-white/80" : "text-[#727785]")}>
                      {col._count?.documents ?? count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Thẻ phân loại</h3>
              {activeTag && (
                <button 
                  onClick={() => setActiveTag(null)}
                  className="text-[11px] text-[#0058be] hover:underline font-semibold"
                >
                  Xóa lọc
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 px-1">
              {allTags.map((tag) => {
                const isSelected = activeTag === tag
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(isSelected ? null : tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                      isSelected 
                        ? "bg-[#0058be] text-white shadow-sm scale-105" 
                        : "bg-[#eff4ff] text-[#0058be] hover:bg-[#dee9fc]"
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mini Workspace Overview */}
          <div className="mt-2 space-y-3">
            <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider px-1">Không gian lưu trữ</h3>

            <div className="bg-white border border-[#c2c6d6]/40 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#424754] uppercase tracking-wide">Dung lượng</span>
                <span className="text-[11px] font-semibold text-[#0058be]">{docs.length * 15} MB / 5 GB</span>
              </div>
              <div className="w-full h-2 bg-[#e6eeff] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3] rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(5, (docs.length * 15 / 5000) * 100))}%` }} 
                />
              </div>
              <p className="text-[10px] text-[#727785] mt-2 font-medium">Gói nghiên cứu tiêu chuẩn · Không giới hạn AI</p>
            </div>

            {/* AI Insight snippet */}
            <div className="bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] border border-[#0058be]/20 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={14} className="text-[#0058be]" />
                <span className="text-[10px] font-bold text-[#0058be] uppercase tracking-wide">Trợ lý học thuật AI</span>
              </div>
              <p className="text-[11px] text-[#424754] leading-relaxed">
                Tài liệu của bạn đã sẵn sàng cho việc trích xuất luận điểm và lập biểu đồ tri thức tự động với AI Workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Center - Document Index */}
        <div className="flex-1 bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#c2c6d6]/30">
            <div>
              <h2 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                {activeCol === "all" ? "Danh mục tất cả tài liệu" : activeCol === "bookmarked" ? "Tài liệu được đánh dấu quan trọng" : `Bộ sưu tập: ${collections.find(c => c.id === activeCol || c.name === activeCol)?.name || activeCol}`}
              </h2>
              <p className="text-[13px] text-[#727785] mt-0.5">
                {loadingDocs ? "Đang tải dữ liệu..." : `${filteredDocs.length} tài liệu phù hợp trong không gian làm việc hiện tại.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/user/ai-workspace${selectedDocs.length > 0 ? `?docId=${selectedDocs[0]}` : ""}`}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0058be] hover:bg-[#004ca3] text-white text-[13px] font-semibold shadow-md shadow-[#0058be]/20 transition-all hover:scale-105"
              >
                <Sparkles size={15} />
                Phân tích với AI
              </Link>
            </div>
          </div>

          {/* Table Header */}
          {(loadingDocs || filteredDocs.length > 0) && (
            <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_90px_160px_130px] gap-3 px-6 py-3.5 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/50 text-[11px] font-bold text-[#727785] uppercase tracking-wider items-center">
              <div className="w-[20px]"></div>
              <div className="w-[24px]"></div>
              <div>Tiêu đề & Tác giả</div>
              <div>Năm</div>
              <div>Bộ sưu tập</div>
              <div className="text-right">Thao tác</div>
            </div>
          )}

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {loadingDocs ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[260px] text-[#727785] gap-3">
                <Loader2 size={28} className="animate-spin text-[#0058be]" />
                <p className="text-[13px] font-medium">Đang đồng bộ thư viện tài liệu...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[380px] p-6 lg:p-10 bg-gradient-to-b from-[#f8f9ff]/40 to-white">
                <div className="w-full max-w-4xl bg-gradient-to-r from-[#eff4ff]/90 via-white to-[#f8f9ff]/90 border border-[#0058be]/20 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8 text-left transition-all hover:shadow-md">
                  {/* Left Icon Badge */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0058be] to-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-[#0058be]/25">
                      <FolderOpen size={44} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                      <Sparkles size={20} />
                    </div>
                  </div>

                  {/* Right Content & Actions Horizontal Flow */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#0058be]/10 text-[#0058be] inline-block">
                        KHÔNG GIAN LÀM VIỆC TRỐNG
                      </span>
                      <h3 className="text-2xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                        Chưa có tài liệu nào phù hợp
                      </h3>
                    </div>

                    <p className="text-[14px] text-[#424754] leading-relaxed w-full">
                      Bạn có thể thay đổi từ khóa tìm kiếm hoặc tải lên tài liệu PDF/DOCX mới để bắt đầu nghiên cứu và trích xuất tri thức AI tự động.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link 
                        href="/user/upload" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0058be] hover:bg-[#004ca3] text-white text-[14px] font-bold rounded-2xl shadow-md shadow-[#0058be]/20 transition-all hover:scale-105"
                      >
                        <Plus size={18} />
                        <span>Tải tài liệu PDF/DOCX ngay</span>
                      </Link>
                      {(search || activeCol !== "all" || activeTag !== null) && (
                        <button 
                          onClick={() => { setSearch(""); setActiveCol("all"); setActiveTag(null); }}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#c2c6d6]/60 text-[#121c2a] text-[14px] font-bold rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <X size={16} />
                          <span>Xóa bộ lọc tìm kiếm</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDocs([doc.id])}
                  className={cn(
                    "grid grid-cols-[auto_auto_minmax(0,1fr)_90px_160px_130px] gap-3 px-6 py-4 border-b border-[#c2c6d6]/20 hover:bg-[#f8f9ff] transition-colors items-center group cursor-pointer",
                    selectedDocs.includes(doc.id) && "bg-[#eff4ff]/60 border-[#0058be]/20"
                  )}
                >
                  <div className="w-[20px] flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.includes(doc.id)} 
                      onChange={() => toggleDoc(doc.id)}
                      className="w-4 h-4 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be]" 
                    />
                  </div>
                  
                  {/* Bookmark Star Button */}
                  <div className="w-[24px] flex items-center justify-center shrink-0" onClick={(e) => handleToggleBookmark(doc.id, e)}>
                    <button className="p-1 hover:bg-amber-50 rounded-lg transition-colors text-amber-500" title={doc.isBookmarked ? "Gỡ đánh dấu" : "Đánh dấu quan trọng"}>
                      <Star size={16} className={cn(doc.isBookmarked ? "fill-amber-400 text-amber-500" : "text-gray-300 hover:text-amber-400")} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm", doc.iconBg)}>
                      <FileText size={18} className={doc.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link 
                          href={`/user/documents/${doc.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[14px] font-bold text-[#121c2a] truncate hover:text-[#0058be] hover:underline transition-colors"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-[9px] font-bold text-[#727785] bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{doc.type}</span>
                      </div>
                      <p className="text-[12px] text-[#727785] truncate">{doc.authors}</p>
                    </div>
                  </div>

                  <div className="text-[13px] font-medium text-[#424754]">{doc.year}</div>

                  <div className="flex items-center gap-1.5 text-[12px] text-[#424754] bg-white border border-[#c2c6d6]/40 px-2.5 py-1 rounded-lg shadow-sm w-fit">
                    <FolderOpen size={12} className="text-[#0058be]" />
                    <span className="truncate max-w-[110px] font-medium">{doc.collection}</span>
                  </div>

                  <div className="flex justify-end items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setTargetDocIdForCol(doc.id)
                        setSelectedColForAdd(collections[0]?.id || "")
                        setIsAddToColModalOpen(true)
                      }}
                      className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors"
                      title="Thêm vào bộ sưu tập khác"
                    >
                      <FolderPlus size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setShareDocId(doc.id)
                        setIsShareModalOpen(true)
                      }}
                      className="p-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors"
                      title="Chia sẻ tài liệu"
                    >
                      <Share2 size={16} />
                    </button>

                    {doc.raw?.fileUrl && (
                      <a
                        href={doc.raw.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors"
                        title="Xem tài liệu trực tiếp"
                      >
                        <Eye size={16} />
                      </a>
                    )}

                    <button 
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-1.5 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Xóa tài liệu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Inspector */}
        <div className="w-[320px] shrink-0 bg-white border border-[#c2c6d6]/40 rounded-3xl p-5 shadow-sm overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c2c6d6]/30">
            <div>
              <p className="text-[10px] font-bold text-[#0058be] uppercase tracking-wider mb-0.5">CHI TIẾT TÀI LIỆU</p>
              <h3 className="text-[16px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Thông tin & Ngữ cảnh</h3>
            </div>
            <div className="flex items-center gap-1">
              {selectedDocDetails && (
                <button 
                  onClick={() => handleToggleBookmark(selectedDocDetails.id)}
                  className="p-1.5 text-[#727785] hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                  title={selectedDocDetails.isBookmarked ? "Gỡ đánh dấu" : "Đánh dấu"}
                >
                  <Star size={16} className={cn(selectedDocDetails.isBookmarked && "fill-amber-400 text-amber-500")} />
                </button>
              )}
              {selectedDocDetails?.raw?.fileUrl && (
                <a
                  href={selectedDocDetails.raw.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors"
                  title="Xem tài liệu gốc"
                >
                  <Eye size={16} />
                </a>
              )}
              {selectedDocDetails && (
                <button 
                  onClick={() => handleDeleteDocument(selectedDocDetails.id)}
                  className="p-1.5 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Xóa vào thùng rác"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {selectedDocDetails ? (
            <div className="flex-1 flex flex-col">
              {/* Featured Card */}
              <div className="bg-gradient-to-br from-[#0058be] to-[#004ca3] rounded-2xl p-5 text-white shadow-lg shadow-[#0058be]/20 mb-6 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none blur-xl" />
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                  <FileText size={20} className="text-white" />
                </div>
                <h4 className="text-[16px] font-bold leading-snug mb-2 line-clamp-2">{selectedDocDetails.title}</h4>
                <p className="text-[12px] text-white/80 leading-relaxed truncate">{selectedDocDetails.authors}</p>
                
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                  <span className="text-[11px] text-white/90 font-medium">{selectedDocDetails.type} · {(selectedDocDetails.raw?.fileSize / 1024 / 1024 || 1.2).toFixed(2)} MB</span>
                  <Link
                    href={`/user/ai-workspace?docId=${selectedDocDetails.id}`}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0058be] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <Sparkles size={12} /> Hỏi AI
                  </Link>
                </div>
              </div>

              {/* Action Buttons inside Inspector */}
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <button
                  onClick={() => {
                    setTargetDocIdForCol(selectedDocDetails.id)
                    setSelectedColForAdd(collections[0]?.id || "")
                    setIsAddToColModalOpen(true)
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#eff4ff] hover:bg-[#dee9fc] text-[#0058be] font-bold text-[12px] rounded-xl transition-colors cursor-pointer"
                >
                  <FolderPlus size={15} /> Thêm vào bộ
                </button>
                <button
                  onClick={() => {
                    setShareDocId(selectedDocDetails.id)
                    setIsShareModalOpen(true)
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#eff4ff] hover:bg-[#dee9fc] text-[#0058be] font-bold text-[12px] rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 size={15} /> Chia sẻ
                </button>
              </div>
              <div className="mb-6">
                <Link
                  href={`/user/documents/${selectedDocDetails.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[13px] rounded-xl shadow-sm transition-all hover:scale-[1.01]"
                >
                  <BookOpen size={16} /> Xem trang chi tiết & Thảo luận
                </Link>
              </div>

              {/* Metadata Grid */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Siêu dữ liệu & Trạng thái</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <Calendar size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Năm tạo</p>
                    <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocDetails.year}</p>
                  </div>
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <Hash size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Trạng thái</p>
                    <p className="text-[13px] font-bold text-[#0058be]">{selectedDocDetails.status}</p>
                  </div>
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <FolderOpen size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Bộ sưu tập</p>
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{selectedDocDetails.collection}</p>
                  </div>
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <BookOpen size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Môn học</p>
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{selectedDocDetails.raw?.subject?.name || "Chung"}</p>
                  </div>
                </div>
              </div>

              {/* Tags list */}
              <div>
                <h4 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-3">Thẻ phân loại</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-[#eff4ff] text-[#0058be] rounded-md text-[11px] font-semibold">#ai-research</span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-semibold">#{selectedDocDetails.type.toLowerCase()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-[#727785] gap-3">
              <FileText size={36} className="text-[#c2c6d6]" />
              <p className="text-[14px] font-semibold text-[#121c2a]">Chọn một tài liệu để xem chi tiết</p>
              <p className="text-[12px] max-w-[220px]">Nhấp vào dòng tài liệu bất kỳ trong danh sách bên trái để kiểm tra thông tin và phân tích AI.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal 1: Create Collection Modal ── */}
      {isCreateColModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c2c6d6]/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#0058be]">
                <FolderOpen size={20} />
                <h3 className="text-[18px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Tạo Bộ sưu tập mới</h3>
              </div>
              <button onClick={() => setIsCreateColModalOpen(false)} className="p-1 text-[#727785] hover:text-[#121c2a]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#424754] uppercase mb-1.5">Tên bộ sưu tập *</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Ví dụ: Đồ án Khóa luận tốt nghiệp 2026..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c2c6d6]/60 text-[14px] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#424754] uppercase mb-1.5">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Thêm mô tả về chủ đề nghiên cứu hoặc mục đích của bộ sưu tập..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c2c6d6]/60 text-[14px] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateColModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-[#424754] hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingCol || !newColName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-[#0058be]/20 transition-all"
                >
                  {creatingCol ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tạo ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Add Document to Collection Modal ── */}
      {isAddToColModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c2c6d6]/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#0058be]">
                <FolderPlus size={20} />
                <h3 className="text-[18px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Thêm vào Bộ sưu tập</h3>
              </div>
              <button onClick={() => setIsAddToColModalOpen(false)} className="p-1 text-[#727785] hover:text-[#121c2a]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDocToCollection} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#424754] uppercase mb-1.5">Chọn bộ sưu tập đích</label>
                {collections.length === 0 ? (
                  <p className="text-[13px] text-[#727785] py-2">Bạn chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập mới trước nhé!</p>
                ) : (
                  <select
                    value={selectedColForAdd}
                    onChange={(e) => setSelectedColForAdd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#c2c6d6]/60 text-[14px] outline-none focus:border-[#0058be] bg-white cursor-pointer"
                  >
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddToColModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-[#424754] hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={addingToCol || collections.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-[#0058be]/20 transition-all"
                >
                  {addingToCol ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Share Document Modal ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c2c6d6]/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#0058be]">
                <Share2 size={20} />
                <h3 className="text-[18px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Chia sẻ Tài liệu</h3>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-1 text-[#727785] hover:text-[#121c2a]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleShareDocument} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#424754] uppercase mb-1.5">Email hoặc User ID người nhận *</label>
                <input
                  type="text"
                  required
                  value={shareInput}
                  onChange={(e) => setShareInput(e.target.value)}
                  placeholder="Nhập email đồng nghiệp (ví dụ: hieu@example.com)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c2c6d6]/60 text-[14px] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#424754] uppercase mb-1.5">Quyền truy cập</label>
                <select
                  value={sharePermission}
                  onChange={(e: any) => setSharePermission(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c2c6d6]/60 text-[14px] outline-none focus:border-[#0058be] bg-white cursor-pointer"
                >
                  <option value="view">Chỉ xem (View only)</option>
                  <option value="comment">Xem & Bình luận (Comment)</option>
                  <option value="edit">Đồng chỉnh sửa (Collaborate & Edit)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-[#424754] hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={sharing || !shareInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-md shadow-[#0058be]/20 transition-all"
                >
                  {sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                  Chia sẻ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
