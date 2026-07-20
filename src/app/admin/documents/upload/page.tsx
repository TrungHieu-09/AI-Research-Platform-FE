"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  FileUp, Shield, Upload, ChevronLeft, Info, FileText, 
  CheckCircle2, AlertTriangle, Loader2, X 
} from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

interface Subject {
  id: string
  name: string
  code: string
}

export default function UploadDocumentPage() {
  const router = useRouter()
  const { token, user } = useAuth()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [autoApprove, setAutoApprove] = useState(true)

  // Upload status
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const [successDoc, setSuccessDoc] = useState<any | null>(null)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

  // Fetch subjects
  useEffect(() => {
    async function loadSubjects() {
      if (!token) return
      setLoadingSubjects(true)
      try {
        const res = await fetch(`${BASE_URL}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : (data?.subjects || [])
          setSubjects(list)
          if (list.length > 0) {
            setSubjectId(list[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err)
      } finally {
        setLoadingSubjects(false)
      }
    }
    loadSubjects()
  }, [token, BASE_URL])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!title) {
        // Default title from file name (without extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setTitle(nameWithoutExt)
      }
      setErrorMsg("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setTitle(nameWithoutExt)
      }
      setErrorMsg("")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg("Vui lòng chọn file tài liệu cần tải lên.")
      return
    }
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tên tài liệu.")
      return
    }
    if (!subjectId) {
      setErrorMsg("Vui lòng chọn lĩnh vực nghiên cứu.")
      return
    }

    setUploading(true)
    setErrorMsg("")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", title.trim())
      formData.append("description", description.trim() || "Tải lên từ quản trị viên")
      formData.append("subjectId", subjectId)
      formData.append("visibility", "PUBLIC")

      // Use XMLHttpRequest for progress
      const uploadRes = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 80)
            setUploadProgress(pct)
          }
        })
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              reject(new Error("Lỗi phản hồi từ máy chủ."))
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText)
              reject(new Error(err.error || `Lỗi máy chủ (${xhr.status})`))
            } catch {
              reject(new Error(`Lỗi máy chủ (${xhr.status})`))
            }
          }
        })
        xhr.addEventListener("error", () => reject(new Error("Lỗi kết nối máy chủ.")))
        xhr.open("POST", `${BASE_URL}/api/documents/upload`)
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.send(formData)
      })

      setUploadProgress(90)
      const doc = uploadRes.document || uploadRes

      // If auto-approve checked, moderate right away
      if (autoApprove && doc?.id) {
        try {
          await fetch(`${BASE_URL}/api/documents/${doc.id}/moderate`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: "APPROVED", feedback: "Tự động phê duyệt bởi Quản trị viên" })
          })
        } catch (modErr) {
          console.warn("Auto moderate error:", modErr)
        }
      }

      setUploadProgress(100)
      setSuccessDoc(doc)
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi trong quá trình tải lên.")
    } finally {
      setUploading(false)
    }
  }

  if (successDoc) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-green-200 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} />
          </div>
          <div className="space-y-2">
            <span className="text-[12px] font-extrabold text-green-700 bg-green-50 px-3.5 py-1 rounded-full uppercase tracking-wider">
              {autoApprove ? "ĐÃ PHÊ DUYỆT & CÔNG KHAI" : "ĐÃ TẢI LÊN THÀNH CÔNG"}
            </span>
            <h2 className="text-2xl font-bold text-[#121c2a] pt-1" style={{ fontFamily: "Geist, sans-serif" }}>
              Đăng tài liệu thành công!
            </h2>
            <p className="text-[14px] text-[#727785]">
              Tài liệu <strong className="text-[#121c2a]">{title}</strong> đã được thêm vào kho học liệu của hệ thống.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setSelectedFile(null)
                setTitle("")
                setDescription("")
                setSuccessDoc(null)
              }}
              className="px-6 py-3 rounded-2xl border border-[#c2c6d6]/60 text-[#121c2a] font-bold text-[14px] hover:bg-gray-50 transition-colors"
            >
              + Đăng tiếp tài liệu khác
            </button>
            <Link
              href="/admin/documents"
              className="px-6 py-3 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Về danh sách Kiểm duyệt</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Title Bar */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/documents" 
          className="p-2.5 bg-white border border-[#c2c6d6]/40 hover:bg-[#f8f9ff] text-[#121c2a] rounded-2xl transition-colors shadow-2xs"
        >
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
            Tải lên Tài liệu Quản trị
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#727785] mt-0.5">
            Đăng tài liệu học thuật chính thức lên hệ thống với quyền ưu tiên Admin.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-[13px] sm:text-[14px] font-medium animate-in fade-in">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#c2c6d6]/40 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Dropzone Area */}
        <div>
          <label className="block text-[14px] font-bold text-[#121c2a] mb-2.5">
            File tài liệu <span className="text-red-500">*</span>
          </label>
          {!selectedFile ? (
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-[#0058be]/30 rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-4 bg-[#f8f9ff] hover:border-[#0058be] hover:bg-[#eff4ff]/60 transition-all cursor-pointer group relative"
            >
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#c2c6d6]/40 text-[#0058be] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#121c2a]">Kéo thả file vào đây hoặc bấm để chọn</p>
                <p className="text-[13px] text-[#727785] mt-1">Hỗ trợ các định dạng PDF, DOCX, PPTX (Tối đa 50MB)</p>
              </div>
              <button 
                type="button"
                className="bg-[#0058be] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] shadow-md group-hover:bg-[#004ca3] transition-all pointer-events-none"
              >
                Chọn File Tài Liệu
              </button>
            </div>
          ) : (
            <div className="p-5 bg-[#eff4ff] border border-[#0058be]/30 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#0058be] text-white flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#121c2a] truncate">{selectedFile.name}</p>
                  <p className="text-[12px] text-[#727785]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tải lên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-white transition-colors"
                title="Xóa chọn lại"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Left: Metadata Form */}
          <div className="space-y-5">
            <div>
              <label className="text-[14px] font-bold text-[#121c2a] block mb-2">
                Tên tài liệu <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bài giảng Trí tuệ nhân tạo - Tuần 1" 
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl py-3 px-4 text-[14px] text-[#121c2a] focus:outline-none focus:border-[#0058be] transition-colors"
              />
            </div>

            <div>
              <label className="text-[14px] font-bold text-[#121c2a] block mb-2">
                Lĩnh vực nghiên cứu <span className="text-red-500">*</span>
              </label>
              <select 
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={loadingSubjects}
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl py-3 px-4 text-[14px] text-[#121c2a] focus:outline-none focus:border-[#0058be] transition-colors cursor-pointer"
              >
                {loadingSubjects ? (
                  <option value="">Đang tải danh sách lĩnh vực nghiên cứu...</option>
                ) : subjects.length === 0 ? (
                  <option value="">Chưa có lĩnh vực nghiên cứu nào</option>
                ) : (
                  subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `[${s.code}] ` : ""}{s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[14px] font-bold text-[#121c2a] block mb-2">
                Mô tả / Ghi chú (Tùy chọn)
              </label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập giới thiệu tóm tắt về nội dung tài liệu..." 
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-xl py-3 px-4 text-[14px] text-[#121c2a] focus:outline-none focus:border-[#0058be] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Right: Admin Privileges */}
          <div className="space-y-4">
            <div className="p-6 bg-[#f8f9ff] rounded-2xl border border-[#0058be]/20 space-y-4">
              <h4 className="text-[14px] font-bold text-[#0058be] flex items-center gap-2 uppercase tracking-wider">
                <Shield size={18} />
                Quyền Đặc Biệt Quản Trị
              </h4>
              <p className="text-[13px] text-[#727785] leading-relaxed">
                Tài liệu được đăng bởi Admin có thể bỏ qua bước chờ kiểm duyệt và xuất hiện ngay lập tức trên sàn học liệu sinh viên.
              </p>
              
              <div className="pt-2 border-t border-[#c2c6d6]/30 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input 
                    type="checkbox" 
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-5 h-5 rounded-lg text-[#0058be] focus:ring-[#0058be] mt-0.5" 
                  />
                  <div>
                    <span className="text-[13.5px] font-bold text-[#121c2a] block group-hover:text-[#0058be] transition-colors">
                      Tự động Phê duyệt & Công khai (Recommended)
                    </span>
                    <span className="text-[12px] text-[#727785]">
                      Tài liệu sẽ được chuyển trạng thái APPROVED ngay sau khi tải lên
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {uploading && (
              <div className="p-4 bg-[#eff4ff] border border-[#0058be]/30 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex justify-between text-[13px] font-bold text-[#0058be]">
                  <span>Đang tải lên hệ thống...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#c2c6d6]/40">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#c2c6d6]/40 justify-end">
          <Link 
            href="/admin/documents" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#121c2a] rounded-xl font-bold text-[14px] text-center transition-all"
          >
            Hủy bỏ
          </Link>
          <button 
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-8 py-3 bg-[#0058be] hover:bg-[#004ca3] text-white rounded-xl font-bold text-[14px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
            <span>{uploading ? "Đang xử lý tải lên..." : "Xác nhận & Tải lên Ngay"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

/* 
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type ForumSort = "newest" | "popular" | "top_rated"
type ForumFeedView = "all" | "liked" | "saved"

interface Subject {
  id: string
  name: string
  code?: string | null
  status?: string | null
}

interface ForumDocument {
  id: string
  title: string
  description?: string | null
  visibility?: string
  status?: string
  createdAt?: string
  fileSize?: number
  pageCount?: number
  owner?: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
  subject?: Subject | null
  subjectId?: string | null
  viewCount?: number
  viewsCount?: number
  averageRating?: number
  ratingAverage?: number
  ratingCount?: number
  ratingsCount?: number
  bookmarkCount?: number
  bookmarksCount?: number
  commentCount?: number
  commentsCount?: number
  isBookmarked?: boolean
  isLiked?: boolean
  _count?: {
    views?: number
    ratings?: number
    bookmarks?: number
    comments?: number
  }
}

interface RatingsResponse {
  average?: number
  total?: number
  items?: unknown[]
  data?: unknown[]
  ratings?: unknown[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const PAGE_SIZE = 10
const LIKED_STORAGE_KEY = "lumis_forum_likes"
const SAVED_STORAGE_KEY = "lumis_forum_saved"

function readIdSet(key: string) {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveIdSet(key: string, value: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = payload as { items?: unknown; data?: unknown; documents?: unknown }
    if (Array.isArray(data.items)) return data.items as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (Array.isArray(data.documents)) return data.documents as T[]
  }
  return []
}

function getTotalPages(payload: unknown) {
  if (!payload || typeof payload !== "object") return 1
  const data = payload as { totalPages?: number; total?: number; pageSize?: number }
  if (typeof data.totalPages === "number") return Math.max(1, data.totalPages)
  if (typeof data.total === "number" && typeof data.pageSize === "number") {
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }
  return 1
}

function getTotalItems(payload: unknown, fallback: number) {
  if (!payload || typeof payload !== "object") return fallback
  const data = payload as { total?: number; count?: number }
  if (typeof data.total === "number") return data.total
  if (typeof data.count === "number") return data.count
  return fallback
}

function getOwnerName(doc: ForumDocument) {
  return doc.owner?.name || doc.owner?.email || "Lumis Scholar"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LS"
}

function formatDate(value?: string) {
  if (!value) return "Chưa rõ"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa rõ"
  return date.toLocaleDateString("vi-VN")
}

function getDocMetrics(doc: ForumDocument) {
  return {
    views: doc.viewCount ?? doc.viewsCount ?? doc._count?.views ?? 0,
    rating: doc.averageRating ?? doc.ratingAverage ?? 0,
    ratings: doc.ratingCount ?? doc.ratingsCount ?? doc._count?.ratings ?? 0,
    bookmarks: doc.bookmarkCount ?? doc.bookmarksCount ?? doc._count?.bookmarks ?? 0,
    comments: doc.commentCount ?? doc.commentsCount ?? doc._count?.comments ?? doc._count?.ratings ?? 0,
  }
}

export default function ForumPage() {
  const { token } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = React.useState<ForumDocument[]>([])
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => readIdSet(LIKED_STORAGE_KEY))
  const [savedIds, setSavedIds] = React.useState<Set<string>>(() => readIdSet(SAVED_STORAGE_KEY))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
  const [sortBy, setSortBy] = React.useState<ForumSort>("newest")
  const [feedView, setFeedView] = React.useState<ForumFeedView>("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const authHeaders = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects?status=ACTIVE`, {
          headers: authHeaders,
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!cancelled) setSubjects(normalizeArray<Subject>(payload))
      } catch (err) {
        console.error("Forum subjects load failed:", err)
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadRatingsForDocuments = React.useCallback(async (items: ForumDocument[]) => {
    if (items.length === 0) return items

    const enriched = await Promise.all(
      items.map(async (doc) => {
        try {
          const res = await fetch(`${BASE_URL}/api/documents/${doc.id}/ratings?page=1&pageSize=1`, {
            headers: authHeaders,
          })
          if (!res.ok) return doc
          const payload = (await res.json()) as RatingsResponse
          const comments =
            payload.total ??
            payload.items?.length ??
            payload.data?.length ??
            payload.ratings?.length ??
            doc.commentCount ??
            doc.ratingsCount ??
            0

          return {
            ...doc,
            averageRating: payload.average ?? doc.averageRating ?? doc.ratingAverage ?? 0,
            ratingCount: payload.total ?? doc.ratingCount ?? doc.ratingsCount ?? 0,
            commentCount: comments,
          }
        } catch {
          return doc
        }
      })
    )

    return enriched
  }, [authHeaders])

  const fetchForumFeed = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort: sortBy,
      })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId)

      const publicUrl = `${BASE_URL}/api/documents/public?${params.toString()}`
      const fallbackUrl = `${BASE_URL}/api/documents?visibility=PUBLIC&status=APPROVED&${params.toString()}`

      let res = await fetch(publicUrl, { headers: authHeaders })
      if (res.status === 404) {
        res = await fetch(fallbackUrl, { headers: authHeaders })
      }

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Không thể tải Forum từ máy chủ.")
      }

      const rawDocs = normalizeArray<ForumDocument>(payload)
      const approvedPublicDocs = rawDocs.filter((doc) => {
        const status = String(doc.status ?? "APPROVED").toUpperCase()
        const visibility = String(doc.visibility ?? "PUBLIC").toUpperCase()
        return status === "APPROVED" && visibility === "PUBLIC"
      })

      const enrichedDocs = await loadRatingsForDocuments(approvedPublicDocs)
      setDocuments(enrichedDocs)
      setTotalPages(getTotalPages(payload))
      setTotalItems(getTotalItems(payload, enrichedDocs.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ.")
      setDocuments([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, loadRatingsForDocuments, page, searchQuery, selectedSubjectId, sortBy])

  React.useEffect(() => {
    fetchForumFeed()
  }, [fetchForumFeed])

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedSubjectId, sortBy, feedView])

  const visibleDocuments = React.useMemo(() => {
    if (feedView === "liked") return documents.filter((doc) => likedIds.has(doc.id) || doc.isLiked)
    if (feedView === "saved") return documents.filter((doc) => savedIds.has(doc.id) || doc.isBookmarked)
    return documents
  }, [documents, feedView, likedIds, savedIds])

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)

  function toggleLike(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    setLikedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(LIKED_STORAGE_KEY, next)
      return next
    })
  }

  async function toggleSave(docId: string, event: React.MouseEvent) {
    event.stopPropagation()
    const isSaved = savedIds.has(docId)
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(docId)) next.delete(docId)
      else next.add(docId)
      saveIdSet(SAVED_STORAGE_KEY, next)
      return next
    })

    try {
      if (isSaved) {
        await fetch(`${BASE_URL}/api/bookmarks/${docId}`, {
          method: "DELETE",
          headers: authHeaders,
        })
      } else {
        await fetch(`${BASE_URL}/api/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeaders ?? {}),
          },
          body: JSON.stringify({ documentId: docId }),
        })
      }
    } catch (err) {
      console.info("Bookmark API is not available yet, kept local UI state.", err)
    }
  }

  const feedViews: Array<{ value: ForumFeedView; label: string; count: number }> = [
    { value: "all", label: "Tất cả", count: totalItems || documents.length },
    { value: "liked", label: "Đã thích", count: documents.filter((doc) => likedIds.has(doc.id)).length },
    { value: "saved", label: "Đã lưu", count: documents.filter((doc) => savedIds.has(doc.id)).length },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9ff] text-[#121c2a]">
      <section className="relative overflow-hidden border-b border-[#dbe4f3] bg-[radial-gradient(circle_at_top_left,rgba(0,88,190,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#edf4ff_52%,#f7f8ff_100%)] px-6 py-10 md:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,88,190,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,88,190,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-white/75 px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be] shadow-sm">
                <Sparkles size={14} />
                Lumis Public Forum
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tight md:text-[44px]" style={{ fontFamily: "Geist, sans-serif" }}>
                Forum tài liệu
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[#424754]">
                Khám phá tài liệu public đã được duyệt, lọc theo lĩnh vực nghiên cứu, đánh giá, lưu tài liệu hay và mở AI để hỏi đáp theo ngữ cảnh.
              </p>
            </div>

            <Link
              href="/user/upload?visibility=PUBLIC"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] px-5 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-[#0058be]/20 transition hover:-translate-y-0.5 hover:bg-[#004ca3]"
            >
              <Upload size={18} />
              Upload tài liệu
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ForumStatCard label="Public docs" value={String(totalItems || documents.length)} helper="Approved resources" tone="blue" />
            <ForumStatCard label="Research Areas" value={String(subjects.length)} helper="Active filters" tone="green" />
            <ForumStatCard label="Current page" value={`${page}/${totalPages}`} helper="Pagination state" tone="amber" />
            <ForumStatCard label="Sort mode" value={sortBy.replace("_", " ")} helper="Feed ranking" tone="violet" />
          </div>

          <div className="rounded-3xl border border-[#dbe4f3] bg-white/85 p-4 shadow-xl shadow-[#0058be]/5 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  className="h-12 w-full rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] pl-12 pr-4 text-[14px] font-semibold outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                />
              </label>

              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="">Tất cả lĩnh vực</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ForumSort)}
                className="h-12 rounded-2xl border border-[#c2c6d6]/70 bg-[#f8f9ff] px-4 text-[14px] font-bold text-[#424754] outline-none transition focus:border-[#0058be]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="top_rated">Đánh giá cao</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:px-16 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dbe4f3] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-[#121c2a]">
            <BookOpen size={18} className="text-[#0058be]" />
            Lĩnh vực nghiên cứu
          </div>
          <button
            onClick={() => setSelectedSubjectId("")}
            className={cn(
              "mb-2 w-full rounded-2xl px-4 py-2.5 text-left text-[14px] font-extrabold transition",
              !selectedSubjectId ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15" : "text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
            )}
          >
            Tất cả tài liệu
          </button>
          <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3 text-left transition",
                  selectedSubjectId === subject.id ? "bg-[#eff4ff] text-[#0058be]" : "hover:bg-[#f8f9ff]"
                )}
              >
                <span className="block text-[13px] font-extrabold">{subject.name}</span>
                <span className="text-[11px] font-bold uppercase text-[#727785]">{subject.code || "GENERAL"}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#727785]">
                Hiển thị {visibleDocuments.length} / {totalItems || documents.length} tài liệu
              </p>
              {selectedSubject && (
                <p className="mt-1 text-[13px] font-semibold text-[#0058be]">
                  Đang lọc: {selectedSubject.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {feedViews.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFeedView(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-extrabold transition",
                    feedView === item.value
                      ? "bg-[#0058be] text-white shadow-md shadow-[#0058be]/15"
                      : "bg-white text-[#424754] hover:bg-[#eff4ff] hover:text-[#0058be]"
                  )}
                >
                  {item.label}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px]", feedView === item.value ? "bg-white/20" : "bg-[#f1f5f9]")}> 
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#dbe4f3] bg-white text-[#727785]">
              <Loader2 size={36} className="mb-3 animate-spin text-[#0058be]" />
              <p className="text-[14px] font-bold">Đang tải Forum...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <AlertCircle className="mx-auto mb-3" size={34} />
              <p className="mb-4 text-[14px] font-bold">{error}</p>
              <button
                onClick={fetchForumFeed}
                className="rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="rounded-3xl border border-[#dbe4f3] bg-white p-12 text-center shadow-sm">
              <FileText className="mx-auto mb-4 text-[#0058be]" size={42} />
              <h3 className="text-[20px] font-extrabold">Chưa có tài liệu phù hợp</h3>
            </div>
          ) : (
            <div className="space-y-5">
              {visibleDocuments.map((doc) => {
                const metrics = getDocMetrics(doc)
                const ownerName = getOwnerName(doc)
                const liked = likedIds.has(doc.id) || Boolean(doc.isLiked)
                const saved = savedIds.has(doc.id) || Boolean(doc.isBookmarked)

                return (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/user/documents/${doc.id}`)}
                    className="group relative overflow-hidden rounded-3xl border border-[#dbe4f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0058be]/50 hover:shadow-xl hover:shadow-[#0058be]/8"
                  >
                    <div className="absolute right-5 top-5 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={(event) => toggleLike(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          liked ? "border-pink-200 text-pink-600" : "border-[#dbe4f3] text-[#727785] hover:text-pink-600"
                        )}
                        title="Thích"
                      >
                        <Heart size={17} className={cn(liked && "fill-pink-600")} />
                      </button>
                      <button
                        onClick={(event) => toggleSave(doc.id, event)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105",
                          saved ? "border-[#0058be]/30 text-[#0058be]" : "border-[#dbe4f3] text-[#727785] hover:text-[#0058be]"
                        )}
                        title="Lưu"
                      >
                        <Bookmark size={17} className={cn(saved && "fill-[#0058be]")} />
                      </button>
                    </div>

                    <div className="flex gap-4 pr-24">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#0058be]">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <StatusPill tone="green" label="APPROVED" />
                          <StatusPill tone="blue" label="PUBLIC" />
                          <StatusPill tone="gray" label={doc.subject?.code || doc.subject?.name || "GENERAL"} />
                        </div>
                        <h2 className="text-[20px] font-extrabold leading-snug tracking-tight text-[#121c2a] transition group-hover:text-[#0058be]">
                          {doc.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[#424754]">
                          {doc.description || "Tài liệu public đã được duyệt. Mở để xem chi tiết, đánh giá và hỏi AI theo nội dung tài liệu."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#727785]">
                          <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[11px] font-extrabold text-[#0058be]">
                              {getInitials(ownerName)}
                            </span>
                            {ownerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {metrics.views} views
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#dbe4f3] pt-3 text-[13px] font-extrabold text-[#424754]">
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                            <Star size={14} className={cn(metrics.rating > 0 && "fill-amber-400 text-amber-500")} />
                            {metrics.rating.toFixed(1)} ({metrics.ratings})
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1.5 text-[#0058be]">
                            <MessageSquare size={14} />
                            {metrics.comments} bình luận
                          </span>
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                            <Bookmark size={14} />
                            {metrics.bookmarks + (saved ? 1 : 0)} saves
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/user/ai-workspace?docId=${doc.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-[#0058be]/15 transition hover:bg-[#004ca3]"
                      >
                        <Sparkles size={15} />
                        Hỏi AI
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#727785]">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f3] bg-white px-4 py-2 text-[13px] font-extrabold text-[#424754] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function ForumStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "blue" | "green" | "amber" | "violet"
}) {
  const styles = {
    blue: "border-[#0058be]/25 bg-[#eff4ff] text-[#0058be]",
    green: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    amber: "border-amber-500/25 bg-amber-50 text-amber-700",
    violet: "border-violet-500/25 bg-violet-50 text-violet-700",
  }[tone]

  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm backdrop-blur-xl", styles)}>
      <p className="text-[26px] font-extrabold leading-none text-[#121c2a]">{value}</p>
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "blue" | "gray" }) {
  const styles = {
    green: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    blue: "border-[#0058be]/20 bg-[#eff4ff] text-[#0058be]",
    gray: "border-slate-300 bg-slate-100 text-slate-600",
  }[tone]
  return <span className={cn("rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase", styles)}>{label}</span>
}*/