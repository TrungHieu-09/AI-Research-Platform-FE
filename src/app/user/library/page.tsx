"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, ChevronDown, Upload, List, LayoutGrid,
  FolderOpen, Plus, Tag, X, FileText, Check, Sparkles,
  MoreVertical, Calendar, Hash, Users, BookOpen, Download, Trash2, Eye,
  Bookmark, Share2, FolderPlus, Loader2, AlertCircle, CheckCircle2, Star,
  Copy, Link as LinkIcon, Send
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
  const [visibilityFilter, setVisibilityFilter] = React.useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL")
  const [moderationFilter, setModerationFilter] = React.useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  
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
  const [showQuickCreateInput, setShowQuickCreateInput] = React.useState(false)
  const [quickColName, setQuickColName] = React.useState("")
  const [isQuickCreatingCol, setIsQuickCreatingCol] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const getDocumentStatusMeta = (status?: string) => {
    const normalized = String(status || "PENDING").toUpperCase()

    if (normalized === "APPROVED") {
      return { label: "Đã duyệt", className: "bg-green-100 text-green-700 border-green-200" }
    }

    if (normalized === "REJECTED") {
      return { label: "Bị từ chối", className: "bg-red-100 text-red-700 border-red-200" }
    }

    return { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800 border-amber-200" }
  }

  const getDocumentVisibilityMeta = (visibility?: string) => {
    const normalized = String(visibility || "PRIVATE").toUpperCase()

    if (normalized === "PUBLIC") {
      return { label: "Công khai", className: "bg-purple-100 text-purple-700 border-purple-200" }
    }

    return { label: "Riêng tư", className: "bg-gray-100 text-gray-700 border-gray-200" }
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
              visibility: String(item.visibility || "PRIVATE").toUpperCase(),
              status: String(item.status || "APPROVED").toUpperCase(),
              rejectionReason: item.rejectionReason || item.raw?.rejectionReason || null,
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

      // Visibility check
      if (visibilityFilter !== "ALL" && doc.visibility !== visibilityFilter) return false

      // Public moderation status check
      if (moderationFilter !== "ALL") {
        if (doc.visibility !== "PUBLIC" || doc.status !== moderationFilter) return false
      }

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
  }, [docs, search, activeCol, activeTag, sortOrder, visibilityFilter, moderationFilter])


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

  // Quick Create Collection and immediately add targeted document
  const handleQuickCreateAndAdd = async () => {
    if (!quickColName.trim() || !targetDocIdForCol || !token) return
    setIsQuickCreatingCol(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const colRes = await fetch(`${baseUrl}/api/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: quickColName.trim(), description: "Tạo nhanh từ thư viện" })
      })

      if (colRes.ok) {
        const newCol = await colRes.json()
        const addRes = await fetch(`${baseUrl}/api/collections/${newCol.id}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ documentId: targetDocIdForCol })
        })

        if (addRes.ok) {
          showToast(`Đã tạo bộ sưu tập "${quickColName.trim()}" và thêm tài liệu thành công!`, "success")
          setQuickColName("")
          setShowQuickCreateInput(false)
          setIsAddToColModalOpen(false)
          fetchAllData()
        } else {
          showToast("Đã tạo bộ sưu tập nhưng lỗi khi thêm tài liệu.", "error")
          fetchAllData()
        }
      } else {
        const err = await colRes.json()
        showToast(err.error || "Tên bộ sưu tập đã tồn tại hoặc không hợp lệ.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối khi tạo nhanh bộ sưu tập.", "error")
    } finally {
      setIsQuickCreatingCol(false)
    }
  }

  const handleCopyLink = (docId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${origin}/user/documents/${docId}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    showToast("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!", "success")
    setTimeout(() => setCopiedLink(false), 3000)
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
              value={visibilityFilter}
              onChange={(e) => { const next = e.target.value as "ALL" | "PUBLIC" | "PRIVATE"; setVisibilityFilter(next); if (next !== "PUBLIC") setModerationFilter("ALL") }}
              className="px-4 py-2.5 bg-white border border-[#c2c6d6]/50 rounded-2xl text-[13px] font-semibold text-[#424754] hover:bg-gray-50 shadow-sm transition-all outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả quyền truy cập</option>
              <option value="PUBLIC">Công khai</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>

            {visibilityFilter === "PUBLIC" && (
              <select
                value={moderationFilter}
                onChange={(e) => setModerationFilter(e.target.value as "ALL" | "PENDING" | "APPROVED" | "REJECTED")}
                className="px-4 py-2.5 bg-white border border-[#c2c6d6]/50 rounded-2xl text-[13px] font-semibold text-[#424754] hover:bg-gray-50 shadow-sm transition-all outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái công khai</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            )}

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

          {/* Visibility Filters */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Quyền truy cập</h3>
            </div>
            <div className="flex flex-col gap-0.5">
              {([
                { key: "ALL", label: "Tất cả", count: docs.length },
                { key: "PUBLIC", label: "Công khai", count: docs.filter(d => d.visibility === "PUBLIC").length },
                { key: "PRIVATE", label: "Riêng tư", count: docs.filter(d => d.visibility === "PRIVATE").length },
              ] as const).map((item) => {
                const isActive = visibilityFilter === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => { setVisibilityFilter(item.key); if (item.key !== "PUBLIC") setModerationFilter("ALL") }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                      isActive
                        ? "bg-[#0058be] text-white shadow-sm"
                        : "text-[#424754] hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className={cn("text-[11px] font-semibold shrink-0 ml-2", isActive ? "text-white/80" : "text-[#727785]")}>{item.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {visibilityFilter === "PUBLIC" && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[11px] font-bold text-[#727785] uppercase tracking-wider">Trạng thái công khai</h3>
              </div>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: "ALL", label: "Tất cả trạng thái", count: docs.filter(d => d.visibility === "PUBLIC").length },
                  { key: "PENDING", label: "Chờ duyệt", count: docs.filter(d => d.visibility === "PUBLIC" && d.status === "PENDING").length },
                  { key: "APPROVED", label: "Đã duyệt", count: docs.filter(d => d.visibility === "PUBLIC" && d.status === "APPROVED").length },
                  { key: "REJECTED", label: "Bị từ chối", count: docs.filter(d => d.visibility === "PUBLIC" && d.status === "REJECTED").length },
                ] as const).map((item) => {
                  const isActive = moderationFilter === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => setModerationFilter(item.key)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full",
                        isActive
                          ? "bg-[#0058be] text-white shadow-sm"
                          : "text-[#424754] hover:bg-white hover:shadow-sm"
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={cn("text-[11px] font-semibold shrink-0 ml-2", isActive ? "text-white/80" : "text-[#727785]")}>{item.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-[auto_minmax(0,1fr)_90px_160px_130px] gap-3 px-6 py-3.5 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/50 text-[11px] font-bold text-[#727785] uppercase tracking-wider items-center">
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
                      {(search || activeCol !== "all" || activeTag !== null || visibilityFilter !== "ALL" || moderationFilter !== "ALL") && (
                        <button 
                          onClick={() => { setSearch(""); setActiveCol("all"); setActiveTag(null); setVisibilityFilter("ALL"); setModerationFilter("ALL"); }}
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
                    "grid grid-cols-[auto_minmax(0,1fr)_90px_160px_130px] gap-3 px-6 py-4 border-b transition-all items-center group cursor-pointer border-l-4",
                    selectedDocs.includes(doc.id) 
                      ? "bg-[#eff4ff] border-l-[#0058be] border-b-[#0058be]/20 shadow-sm" 
                      : "border-l-transparent border-b-[#c2c6d6]/20 hover:bg-[#f8f9ff] hover:border-l-[#c2c6d6]"
                  )}
                >
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
                        <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0", getDocumentVisibilityMeta(doc.visibility).className)}>
                          {getDocumentVisibilityMeta(doc.visibility).label}
                        </span>
                        {doc.visibility === "PUBLIC" && (
                          <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0", getDocumentStatusMeta(doc.status).className)}>
                            {getDocumentStatusMeta(doc.status).label}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#727785] truncate">{doc.authors}</p>
                      {doc.visibility === "PUBLIC" && doc.status === "REJECTED" && doc.rejectionReason && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600 line-clamp-1">
                          Lý do từ chối: {doc.rejectionReason}
                        </p>
                      )}
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
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-1.5">Quyền truy cập</p>
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", getDocumentVisibilityMeta(selectedDocDetails.visibility).className)}>
                      {getDocumentVisibilityMeta(selectedDocDetails.visibility).label}
                    </span>
                    {selectedDocDetails.visibility === "PUBLIC" && (
                      <span className={cn("mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold", getDocumentStatusMeta(selectedDocDetails.status).className)}>
                        {getDocumentStatusMeta(selectedDocDetails.status).label}
                      </span>
                    )}
                  </div>
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <FolderOpen size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Bộ sưu tập</p>
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{selectedDocDetails.collection}</p>
                  </div>
                  <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl p-3">
                    <BookOpen size={14} className="text-[#0058be] mb-2" />
                    <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Lĩnh vực nghiên cứu</p>
                    <p className="text-[13px] font-bold text-[#121c2a] truncate">{selectedDocDetails.raw?.subject?.name || "Chung"}</p>
                  </div>
                </div>
                {selectedDocDetails.visibility === "PUBLIC" && selectedDocDetails.status === "REJECTED" && selectedDocDetails.rejectionReason && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wide">Lý do bị từ chối</p>
                        <p className="mt-1 text-[12px] font-medium leading-relaxed">{selectedDocDetails.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 md:p-9 shadow-2xl border border-[#c2c6d6]/40 flex flex-col">
            <div className="flex items-center justify-between pb-5 border-b border-[#c2c6d6]/30 mb-6 shrink-0">
              <div className="flex items-center gap-3 text-[#0058be]">
                <div className="p-3 bg-[#eff4ff] rounded-2xl">
                  <FolderPlus size={24} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Tạo Bộ sưu tập mới</h3>
                  <p className="text-[13px] text-[#727785] font-medium">Tổ chức tài liệu, bài giảng và nghiên cứu theo chủ đề chuyên sâu</p>
                </div>
              </div>
              <button onClick={() => setIsCreateColModalOpen(false)} className="p-2.5 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-6">
              <div>
                <label className="block text-[13px] font-extrabold text-[#424754] uppercase tracking-wider mb-2.5">
                  Tên bộ sưu tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Ví dụ: Đồ án Khóa luận tốt nghiệp AI 2026, Nghiên cứu NLP..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#c2c6d6]/60 text-[15px] font-semibold text-[#121c2a] outline-none focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10 transition-all bg-[#f8f9ff]/50"
                />
              </div>

              <div>
                <label className="block text-[13px] font-extrabold text-[#424754] uppercase tracking-wider mb-2.5">
                  Mô tả chi tiết & Mục đích bộ sưu tập
                </label>
                <textarea
                  rows={4}
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Thêm mô tả về chủ đề nghiên cứu, mục tiêu học tập hoặc các câu hỏi cần giải quyết..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#c2c6d6]/60 text-[15px] text-[#121c2a] outline-none focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10 transition-all resize-none bg-[#f8f9ff]/50 leading-relaxed"
                />
              </div>

              <div className="bg-[#eff4ff]/60 border border-[#0058be]/20 rounded-2xl p-4.5 flex items-start gap-3">
                <Sparkles size={18} className="text-[#0058be] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#424754] leading-relaxed font-medium">
                  <strong>Mẹo Lumis AI:</strong> Sau khi tạo bộ sưu tập, bạn có thể dễ dàng thêm nhiều tài liệu cùng lúc và sử dụng trợ lý AI Workspace để tổng hợp kiến thức liên tệp.
                </p>
              </div>

              <div className="flex justify-end items-center gap-3.5 pt-4 border-t border-[#c2c6d6]/30 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateColModalOpen(false)}
                  className="px-6 py-3 rounded-2xl text-[14px] font-bold text-[#727785] hover:bg-gray-100 hover:text-[#121c2a] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingCol || !newColName.trim()}
                  className="px-8 py-3 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[14px] font-extrabold flex items-center gap-2.5 shadow-lg shadow-[#0058be]/25 hover:shadow-xl hover:scale-[1.01] transition-all"
                >
                  {creatingCol ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                  <span>Tạo Bộ sưu tập ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Add Document to Collection Modal ── */}
      {isAddToColModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-[#c2c6d6]/40 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#c2c6d6]/30 mb-5 shrink-0">
              <div className="flex items-center gap-2.5 text-[#0058be]">
                <div className="p-2.5 bg-[#eff4ff] rounded-2xl">
                  <FolderPlus size={22} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Thêm vào Bộ sưu tập</h3>
                  <p className="text-[12px] text-[#727785] font-medium">Lưu trữ và phân loại tài liệu theo chủ đề nghiên cứu</p>
                </div>
              </div>
              <button onClick={() => setIsAddToColModalOpen(false)} className="p-2 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Target Document Summary Banner */}
            {(() => {
              const targetDoc = docs.find(d => d.id === targetDocIdForCol) || selectedDocDetails
              return targetDoc ? (
                <div className="bg-[#f8f9ff] border border-[#0058be]/20 rounded-2xl p-4 mb-5 flex items-center gap-3.5 shrink-0">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-[12px]", targetDoc.iconBg, targetDoc.iconColor)}>
                    {targetDoc.type}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-[#121c2a] truncate">{targetDoc.title}</p>
                    <p className="text-[11.5px] text-[#727785] truncate">
                      Lĩnh vực: <strong className="text-[#0058be]">{targetDoc.raw?.subject?.name || "Chung"}</strong> • Tạo năm {targetDoc.year}
                    </p>
                  </div>
                </div>
              ) : null
            })()}

            {/* Interactive Collection List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-extrabold text-[#424754] uppercase tracking-wider">Chọn bộ sưu tập ({collections.length})</label>
                {!showQuickCreateInput && (
                  <button
                    type="button"
                    onClick={() => setShowQuickCreateInput(true)}
                    className="text-[12px] font-bold text-[#0058be] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Tạo nhanh mới
                  </button>
                )}
              </div>

              {showQuickCreateInput && (
                <div className="bg-[#eff4ff]/60 border border-[#0058be]/30 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200">
                  <p className="text-[12px] font-bold text-[#0058be]">Tạo & Thêm ngay vào Bộ sưu tập mới:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={quickColName}
                      onChange={(e) => setQuickColName(e.target.value)}
                      placeholder="Nhập tên bộ sưu tập (ví dụ: Khóa luận 2026)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#0058be]/30 bg-white text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[#0058be]"
                    />
                    <button
                      type="button"
                      onClick={handleQuickCreateAndAdd}
                      disabled={isQuickCreatingCol || !quickColName.trim()}
                      className="px-4 py-2 bg-[#0058be] hover:bg-[#004ca3] text-white text-[12px] font-bold rounded-xl flex items-center gap-1.5 shadow disabled:opacity-50 shrink-0"
                    >
                      {isQuickCreatingCol ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Tạo & Thêm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowQuickCreateInput(false); setQuickColName(""); }}
                      className="p-2 text-[#727785] hover:bg-gray-200 rounded-xl"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              {collections.length === 0 && !showQuickCreateInput ? (
                <div className="text-center py-10 bg-[#f8f9ff] rounded-2xl border border-dashed border-[#c2c6d6]/60">
                  <FolderOpen size={36} className="mx-auto text-[#c2c6d6] mb-2" />
                  <p className="text-[14px] font-bold text-[#121c2a]">Bạn chưa có bộ sưu tập nào</p>
                  <p className="text-[12px] text-[#727785] mb-4">Bấm nút tạo nhanh bên dưới để tạo bộ sưu tập đầu tiên.</p>
                  <button
                    type="button"
                    onClick={() => setShowQuickCreateInput(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0058be] text-white font-bold text-[13px] rounded-xl shadow-sm hover:bg-[#004ca3]"
                  >
                    <Plus size={16} /> Tạo bộ sưu tập mới
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {collections.map(col => {
                    const isSelected = selectedColForAdd === col.id
                    const count = col.documentCount ?? col._count?.documents ?? col.documents?.length ?? 0
                    return (
                      <div
                        key={col.id}
                        onClick={() => setSelectedColForAdd(col.id)}
                        className={cn(
                          "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                          isSelected
                            ? "border-[#0058be] bg-[#eff4ff]/80 shadow-sm ring-1 ring-[#0058be]"
                            : "border-[#c2c6d6]/40 bg-white hover:border-[#0058be]/50 hover:bg-[#f8f9ff]/50"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-[#0058be] text-white" : "bg-[#f0f4ff] text-[#0058be]"
                          )}>
                            <FolderOpen size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-[#121c2a] truncate">{col.name}</p>
                            <p className="text-[11.5px] text-[#727785] truncate">{col.description || "Bộ sưu tập tài liệu cá nhân"} • <strong className="text-[#0058be] font-mono">{count}</strong> tệp</p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "border-[#0058be] bg-[#0058be] text-white" : "border-[#c2c6d6] bg-white"
                        )}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#c2c6d6]/30 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddToColModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#727785] hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleAddDocToCollection}
                disabled={addingToCol || !selectedColForAdd || collections.length === 0}
                className="px-7 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-[#0058be]/20 transition-all"
              >
                {addingToCol ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Xác nhận thêm vào Bộ sưu tập</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Share Document Modal ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-[#c2c6d6]/40 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#c2c6d6]/30 mb-5 shrink-0">
              <div className="flex items-center gap-2.5 text-[#0058be]">
                <div className="p-2.5 bg-[#eff4ff] rounded-2xl">
                  <Share2 size={22} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>Chia sẻ & Mời cộng tác</h3>
                  <p className="text-[12px] text-[#727785] font-medium">Gửi liên kết truy cập hoặc cấp quyền thành viên</p>
                </div>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-2 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Target Document Summary Banner */}
            {(() => {
              const targetDoc = docs.find(d => d.id === shareDocId) || selectedDocDetails
              return targetDoc ? (
                <div className="bg-[#f8f9ff] border border-[#0058be]/20 rounded-2xl p-4 mb-5 flex items-center gap-3.5 shrink-0">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-[12px]", targetDoc.iconBg, targetDoc.iconColor)}>
                    {targetDoc.type}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-[#121c2a] truncate">{targetDoc.title}</p>
                    <p className="text-[11.5px] text-[#727785] truncate">
                      Trạng thái: <strong className="text-[#0058be]">{targetDoc.status === "APPROVED" ? "Đã duyệt công khai" : "Riêng tư / Chờ duyệt"}</strong>
                    </p>
                  </div>
                </div>
              ) : null
            })()}

            {/* Section 1: Copy Quick Link */}
            <div className="bg-gradient-to-r from-[#eff4ff]/70 to-[#f8f9ff] border border-[#0058be]/25 rounded-2xl p-4.5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-[#0058be] uppercase tracking-wide flex items-center gap-1.5">
                  <LinkIcon size={14} /> Đường dẫn chia sẻ nhanh
                </span>
                <span className="text-[11px] font-bold text-[#727785] bg-white px-2.5 py-0.5 rounded-full border">
                  Truy cập bằng tài khoản Lumis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/user/documents/${shareDocId}`}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#c2c6d6]/60 rounded-xl text-[13px] font-mono text-[#424754] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => shareDocId && handleCopyLink(shareDocId)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-1.5 shadow-sm transition-all shrink-0",
                    copiedLink
                      ? "bg-green-600 text-white"
                      : "bg-[#0058be] hover:bg-[#004ca3] text-white"
                  )}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? "Đã sao chép!" : "Sao chép link"}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Invite by Email / ID */}
            <form onSubmit={handleShareDocument} className="space-y-4">
              <div>
                <label className="block text-[12px] font-extrabold text-[#424754] uppercase tracking-wider mb-2">Mời cộng tác qua Email hoặc User ID *</label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    value={shareInput}
                    onChange={(e) => setShareInput(e.target.value)}
                    placeholder="Nhập email (ví dụ: hieu@example.com)..."
                    className="flex-1 px-4 py-3 rounded-xl border border-[#c2c6d6]/60 text-[14px] font-medium outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all bg-white"
                  />
                  <select
                    value={sharePermission}
                    onChange={(e: any) => setSharePermission(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-[#c2c6d6]/60 text-[13px] font-bold outline-none focus:border-[#0058be] bg-[#f8f9ff] text-[#121c2a] cursor-pointer shrink-0"
                  >
                    <option value="view">Chỉ xem (View)</option>
                    <option value="comment">Bình luận (Comment)</option>
                    <option value="edit">Đồng chỉnh sửa (Edit)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#c2c6d6]/30">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#727785] hover:bg-gray-100 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={sharing || !shareInput.trim()}
                  className="px-7 py-2.5 rounded-xl bg-[#0058be] hover:bg-[#004ca3] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-[#0058be]/20 transition-all"
                >
                  {sharing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>Gửi lời mời chia sẻ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}




