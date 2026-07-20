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

