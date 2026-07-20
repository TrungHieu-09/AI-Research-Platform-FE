"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search, Filter, Sparkles, BookOpen, Star, Eye, MessageSquare,
  Bookmark, Share2, PlusCircle, Calendar, User, FileText, ArrowRight,
  TrendingUp, Clock, Award, CheckCircle2, AlertCircle, Loader2, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function ForumPage() {
  const { token, user } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"newest" | "popular" | "top_rated">("newest")
  const [subjects, setSubjects] = React.useState<any[]>([])

  // Pagination
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch Subjects for Filter
  React.useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        const res = await fetch(`${baseUrl}/api/subjects`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setSubjects(data)
          else if (data && Array.isArray(data.items)) setSubjects(data.items)
        }
      } catch (e) {
        console.error("Failed to load subjects:", e)
      }
    }
    fetchSubjects()
  }, [])

  // Fetch Public Forum Feed
  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const params = new URLSearchParams({
        visibility: "PUBLIC",
        sort: sortBy,
        page: page.toString(),
        pageSize: "15",
      })
      if (searchQuery.trim()) params.append("search", searchQuery.trim())
      if (selectedSubjectId) params.append("subjectId", selectedSubjectId)

      const res = await fetch(`${baseUrl}/api/documents?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (res.ok) {
        const data = await res.json()
        setDocuments(Array.isArray(data.items) ? data.items : [])
        setTotalPages(data.totalPages || 1)
      } else {
        const err = await res.json()
        setError(err.error || "Không thể tải danh sách bài thảo luận từ máy chủ.")
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [token, sortBy, page, searchQuery, selectedSubjectId])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  const handleCopyLink = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/user/documents/${docId}`
    navigator.clipboard.writeText(url)
    showToast("Đã sao chép đường dẫn thảo luận vào clipboard!", "success")
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9ff] min-h-[calc(100vh-64px)] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
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

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-r from-[#0058be] via-[#1a6ddb] to-[#316bf3] py-12 px-6 md:px-16 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[12px] font-bold tracking-wide uppercase text-white">
              <Sparkles size={14} className="text-amber-300" /> Diễn đàn & Khám phá Học thuật
            </div>
            <h1 className="text-[32px] md:text-[38px] font-extrabold leading-tight tracking-tight" style={{ fontFamily: "Geist, sans-serif" }}>
              Cộng Đồng Nghiên Cứu AI Lumis
            </h1>
            <p className="text-[14px] md:text-[15px] text-white/90 leading-relaxed font-medium">
              Khám phá, đánh giá và thảo luận hàng ngàn tài liệu nghiên cứu công khai từ sinh viên và giảng viên. Kết hợp Trợ lý AI để phân tích tri thức chuyên sâu ngay lập tức.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/user/upload?visibility=PUBLIC"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#0058be] hover:bg-[#eff4ff] rounded-2xl font-bold text-[14px] shadow-lg shadow-black/10 transition-all hover:scale-105"
            >
              <PlusCircle size={18} /> Đăng tài liệu / Thảo luận
            </Link>
          </div>
        </div>
      </section>

      {/* Filter & Sort Bar */}
      <section className="max-w-6xl w-full mx-auto px-6 mt-8 relative z-10 -translate-y-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785] group-focus-within:text-[#0058be] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchForumFeed()}
              placeholder="Tìm kiếm tài liệu, từ khóa, tác giả hoặc tóm tắt..."
              className="w-full pl-11 pr-4 py-3 bg-[#f8f9ff]/50 hover:bg-[#f8f9ff] focus:bg-white border border-[#c2c6d6]/60 rounded-xl text-[14px] font-medium text-[#121c2a] outline-none focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10 transition-all placeholder:text-[#9ea3b0]"
            />
          </div>

          {/* Subject Filter & Sort Tabs */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-3 bg-[#f8f9ff]/50 hover:bg-[#f8f9ff] focus:bg-white border border-[#c2c6d6]/60 rounded-xl text-[13px] font-semibold text-[#424754] outline-none focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>

            <div className="flex items-center bg-[#f8f9ff] p-1.5 rounded-xl border border-[#c2c6d6]/40 shrink-0 shadow-inner">
              <button
                onClick={() => setSortBy("newest")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer",
                  sortBy === "newest" ? "bg-white text-[#0058be] shadow-sm ring-1 ring-black/5" : "text-[#727785] hover:text-[#121c2a] hover:bg-black/5"
                )}
              >
                <Clock size={15} /> Mới nhất
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer",
                  sortBy === "popular" ? "bg-white text-[#0058be] shadow-sm ring-1 ring-black/5" : "text-[#727785] hover:text-[#121c2a] hover:bg-black/5"
                )}
              >
                <TrendingUp size={15} /> Phổ biến
              </button>
              <button
                onClick={() => setSortBy("top_rated")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer",
                  sortBy === "top_rated" ? "bg-white text-[#0058be] shadow-sm ring-1 ring-black/5" : "text-[#727785] hover:text-[#121c2a] hover:bg-black/5"
                )}
              >
                <Award size={15} /> Đánh giá cao
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Content */}
      <section className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785]">
            <Loader2 size={36} className="animate-spin text-[#0058be]" />
            <p className="text-[14px] font-semibold">Đang tải danh sách bài thảo luận cộng đồng...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle size={32} className="text-red-600 mx-auto" />
            <h3 className="text-[16px] font-bold text-[#121c2a]">Đã xảy ra lỗi</h3>
            <p className="text-[13px] text-red-700">{error}</p>
            <button
              onClick={fetchForumFeed}
              className="px-5 py-2 bg-[#0058be] text-white font-bold text-[13px] rounded-xl hover:bg-[#004ca3] transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl border border-[#c2c6d6]/40 p-14 text-center space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#eff4ff]/50 to-transparent pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-[#eff4ff] text-[#0058be] flex items-center justify-center mx-auto relative z-10 shadow-sm">
              <BookOpen size={36} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[20px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Chưa có tài liệu nào trong danh mục này
              </h3>
              <p className="text-[14px] text-[#727785] max-w-md mx-auto leading-relaxed mt-2">
                Bạn có thể là người đầu tiên chia sẻ tài liệu và khởi tạo chủ đề thảo luận học thuật với cộng đồng Lumis AI!
              </p>
            </div>
            <div className="pt-4 relative z-10">
              <Link
                href="/user/upload?visibility=PUBLIC"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0058be] text-white font-bold text-[14px] rounded-2xl hover:bg-[#004ca3] hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <PlusCircle size={18} /> Chia sẻ tài liệu ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const viewCount = doc._count?.views || doc.viewsCount || 0
              const ratingCount = doc._count?.ratings || doc.ratingsCount || 0
              const bookmarkCount = doc._count?.bookmarks || doc.bookmarksCount || 0

              return (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/user/documents/${doc.id}`)}
                  className="bg-white rounded-2xl border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,88,190,0.12)] hover:border-[#0058be]/20 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0058be]/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="space-y-4 relative z-10">
                    {/* Card Header Info */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#eff4ff] to-[#e0ebff] text-[#0058be] font-bold text-[14px] flex items-center justify-center shrink-0 uppercase shadow-sm border border-white">
                          {doc.owner?.name ? doc.owner.name.charAt(0) : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-extrabold text-[#121c2a] truncate">{doc.owner?.name || "Lumis Scholar"}</p>
                          <p className="text-[12px] text-[#727785] flex items-center gap-1.5 mt-0.5">
                            <Calendar size={12} className="text-[#a0a5b3]" /> {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#0058be] bg-[#eff4ff] px-3 py-1.5 rounded-full shrink-0 border border-[#0058be]/10 shadow-sm">
                        {doc.subject?.name || "Chung"}
                      </span>
                    </div>

                    {/* Document Title & Description */}
                    <div className="pt-2">
                      <h3 className="text-[17px] font-extrabold text-[#121c2a] group-hover:text-[#0058be] transition-colors line-clamp-2 leading-tight mb-2.5" style={{ fontFamily: "Geist, sans-serif" }}>
                        {doc.title}
                      </h3>
                      <p className="text-[13px] text-[#424754] line-clamp-3 leading-relaxed bg-[#f8f9ff] group-hover:bg-[#eff4ff]/50 p-3.5 rounded-xl border border-[#c2c6d6]/20 transition-colors">
                        {doc.description || "Nhấp để xem chi tiết tài liệu, đọc toàn văn PDF và tham gia thảo luận cùng cộng đồng nghiên cứu."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Stats & Actions */}
                  <div className="mt-6 pt-4 border-t border-[#c2c6d6]/30 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3.5 text-[12px] font-semibold text-[#727785]">
                      <span className="flex items-center gap-1.5 hover:text-[#0058be] transition-colors">
                        <Eye size={15} className="text-[#0058be]/70" /> {viewCount}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                        <MessageSquare size={15} className="text-amber-500/70" /> {ratingCount}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                        <Bookmark size={15} className="text-purple-500/70" /> {bookmarkCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleCopyLink(doc.id, e)}
                        className="w-8 h-8 flex items-center justify-center text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-full transition-all"
                        title="Sao chép liên kết"
                      >
                        <Share2 size={16} />
                      </button>
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0058be] to-[#1a6ddb] hover:from-[#004ca3] hover:to-[#0058be] text-white font-bold text-[12px] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <Sparkles size={14} className="text-amber-300" /> Hỏi AI
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-[#c2c6d6]/60 bg-white text-[13px] font-bold text-[#424754] hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Trang trước
            </button>
            <span className="text-[13px] font-bold text-[#121c2a] px-3">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-[#c2c6d6]/60 bg-white text-[13px] font-bold text-[#424754] hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Trang tiếp
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
