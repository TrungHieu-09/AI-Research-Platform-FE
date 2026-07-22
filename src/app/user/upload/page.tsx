"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/auth-context"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Subject {
  id: string
  name: string
  code: string
  status: string
}

interface UploadedDoc {
  id: string
  title: string
  status: string
  visibility: string
  fileUrl: string
  fileSize: number
  mimeType: string
  createdAt: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getMimeIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "picture_as_pdf"
  if (mimeType.includes("word") || mimeType.includes("document")) return "description"
  if (mimeType.includes("text")) return "article"
  return "insert_drive_file"
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

// ─── Component ───────────────────────────────────────────────────────────────

export default function UploadDocumentPage() {
  const { token } = useAuth()
  const router = useRouter()

  // Form state
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = React.useState(true)

  // File state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Form fields
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [subjectId, setSubjectId] = React.useState("")
  const [visibility, setVisibility] = React.useState<"PRIVATE" | "PUBLIC">("PRIVATE")

  // Upload progress
  const [uploadStatus, setUploadStatus] = React.useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [uploadedDoc, setUploadedDoc] = React.useState<UploadedDoc | null>(null)

  // ── Load subjects on mount ─────────────────────────────────────────────────
  React.useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch(`${BASE_URL}/api/subjects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          setSubjects(Array.isArray(data) ? data : [])
        }
      } catch {
        // silently fail — subjects load may fail if not logged in yet
      } finally {
        setSubjectsLoading(false)
      }
    }
    loadSubjects()
  }, [token])

  // ── File handling ──────────────────────────────────────────────────────────

  function handleFileSelect(file: File) {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if (!allowed.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      setErrorMessage("Chỉ hỗ trợ định dạng PDF, DOCX, DOC, TXT.")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("Kích thước tệp vượt quá giới hạn 50MB.")
      return
    }
    setErrorMessage("")
    setUploadStatus("idle")
    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadProgress(0)
    setErrorMessage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn một tệp để tải lên.")
      return
    }
    if (!subjectId) {
      setErrorMessage("Vui lòng chọn lĩnh vực nghiên cứu.")
      return
    }
    if (!title.trim()) {
      setErrorMessage("Vui lòng nhập tiêu đề tài liệu.")
      return
    }
    if (!token) {
      setErrorMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
      return
    }

    setErrorMessage("")
    setUploadStatus("uploading")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("subjectId", subjectId)
      formData.append("visibility", visibility)

      // Use XMLHttpRequest so we can track real upload progress
      const result = await new Promise<{ document: UploadedDoc; fileUrl: string; message: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 85) // 85% for upload phase
            setUploadProgress(pct)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              setUploadProgress(100)
              resolve(data)
            } catch {
              reject(new Error("Phản hồi không hợp lệ từ máy chủ."))
            }
          } else {
            try {
              const errData = JSON.parse(xhr.responseText)
              if (errData.duplicate) {
                reject(new Error(errData.error || "Tài liệu bị từ chối vì đã trùng với tài liệu công khai hiện có."))
              } else {
                reject(new Error(errData.error ?? `Lỗi máy chủ (${xhr.status})`))
              }
            } catch {
              reject(new Error(`Lỗi máy chủ (${xhr.status})`))
            }
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Lỗi kết nối. Vui lòng thử lại.")))
        xhr.addEventListener("abort", () => reject(new Error("Tải lên bị hủy.")))

        xhr.open("POST", `${BASE_URL}/api/documents/upload`)
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.send(formData)
      })

      setUploadedDoc(result.document)
      setUploadStatus("success")
    } catch (err: any) {
      setErrorMessage(err.message ?? "Tải lên thất bại. Vui lòng thử lại.")
      setUploadStatus("error")
      setUploadProgress(0)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isUploading = uploadStatus === "uploading"
  const isSuccess = uploadStatus === "success"

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      <div className="max-w-[900px] mx-auto w-full">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/user/library"
              className="w-8 h-8 rounded-full bg-white border border-[#d9e3f7] flex items-center justify-center hover:bg-[#eff3ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#424753]">arrow_back</span>
            </Link>
            <h1 className="text-[28px] md:text-[32px] font-semibold text-[#121c2a] tracking-tight">
              Tải lên Tài liệu
            </h1>
          </div>
          <p className="text-[14px] text-[#727784] ml-11">
            Tải lên PDF hoặc DOCX — AI sẽ tự động phân tích và lập chỉ mục tài liệu của bạn.
          </p>
        </header>

        {/* ── Success state ── */}
        {isSuccess && uploadedDoc && (
          <div className="bg-white/80 backdrop-blur-xl border border-[#34c759]/30 rounded-[24px] p-8 mb-8 shadow-[0_10px_40px_rgba(52,199,89,0.08)] text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#34c759]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px] text-[#34c759]">check_circle</span>
            </div>
            <h2 className="text-[22px] font-semibold text-[#121c2a] mb-2">Tải lên thành công!</h2>
            <p className="text-[14px] text-[#424753] mb-1">
              <span className="font-semibold text-[#121c2a]">{uploadedDoc.title}</span> đã được lưu vào cơ sở dữ liệu.
            </p>
            <p className="text-[13px] text-[#727784] mb-6">
              Trạng thái:{" "}
              <span className={`font-semibold ${uploadedDoc.status === "APPROVED" ? "text-[#34c759]" : "text-[#ff9500]"}`}>
                {uploadedDoc.status === "APPROVED" ? "Đã duyệt · AI đang phân tích" : "Chờ kiểm duyệt"}
              </span>
              {" · "}AI vector indexing đang chạy nền.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setUploadStatus("idle")
                  setUploadProgress(0)
                  setUploadedDoc(null)
                  setTitle("")
                  setDescription("")
                  setSubjectId("")
                  setVisibility("PRIVATE")
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="px-6 py-2.5 rounded-[14px] text-[14px] font-semibold text-[#0058be] bg-[#eff3ff] hover:bg-[#dfe9fc] transition-colors"
              >
                Tải lên tài liệu khác
              </button>
              <Link
                href="/user/library"
                className="px-6 py-2.5 rounded-[14px] text-[14px] font-semibold text-white bg-[#0058be] hover:bg-[#2170e4] transition-colors shadow-[0_4px_14px_rgba(0,65,145,0.2)]"
              >
                Xem thư viện
              </Link>
            </div>
          </div>
        )}

        {/* ── Upload form (hidden after success) ── */}
        {!isSuccess && (
          <>
            {/* Drop zone */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-10 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-8 relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#316bf3]/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {!selectedFile ? (
                /* Empty drop zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 h-56 px-6 ${
                    isDragging
                      ? "border-[#0058be] bg-[#eff3ff] scale-[1.01]"
                      : "border-[#c2c6d5] hover:border-[#0058be]/50 bg-[#f8f9ff] hover:bg-[#f0f4ff]"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${isDragging ? "bg-[#0058be]/20 scale-110" : "bg-[#eff3ff]"}`}>
                    <span className="material-symbols-outlined text-[30px] text-[#0058be]">cloud_upload</span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-[#121c2a] mb-1">
                    {isDragging ? "Thả tệp vào đây..." : "Kéo & thả tệp của bạn"}
                  </h3>
                  <p className="text-[14px] text-[#424753] mb-3">hoặc nhấp để chọn từ máy tính</p>
                  <p className="text-[11px] font-medium text-[#727784] uppercase tracking-wider">
                    PDF · DOCX · TXT · Tối đa 50MB
                  </p>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                /* File selected — show file card + progress */
                <div className="flex flex-col gap-4">
                  {/* File info card */}
                  <div className="bg-white border border-[#d9e3f7] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[22px] text-[#ba1a1a]">
                        {getMimeIcon(selectedFile.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#121c2a] truncate">{selectedFile.name}</p>
                      <p className="text-[12px] text-[#727784]">{formatBytes(selectedFile.size)}</p>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[11px] text-[#727784] mb-1">
                            <span>Đang tải lên...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-[#dfe9fc] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#004191] to-[#2170e4] h-1.5 rounded-full transition-all duration-300 relative"
                              style={{ width: `${uploadProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {!isUploading && (
                      <button
                        onClick={handleRemoveFile}
                        className="p-1.5 text-[#727784] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-full transition-colors"
                        title="Xóa tệp"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* Change file button */}
                  {!isUploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="self-start text-[13px] text-[#0058be] hover:text-[#2170e4] font-medium flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      Chọn tệp khác
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
                <span className="text-[14px] text-[#93000a] font-medium">{errorMessage}</span>
                <button onClick={() => setErrorMessage("")} className="ml-auto text-[#ba1a1a] hover:opacity-70">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Metadata form */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-10 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-8">
              <h2 className="text-[20px] font-semibold text-[#121c2a] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#0058be]">edit_note</span>
                Thông tin Tài liệu
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="doc-title" className="block text-[13px] font-semibold tracking-wide text-[#424753] mb-1.5 uppercase">
                    Tiêu đề <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="doc-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề tài liệu..."
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[14px] text-[#121c2a] transition-all outline-none placeholder:text-[#adb1bb]"
                  />
                </div>

                {/* Research Area */}
                <div>
                  <label htmlFor="doc-subject" className="block text-[13px] font-semibold tracking-wide text-[#424753] mb-1.5 uppercase">
                    Lĩnh vực nghiên cứu <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="doc-subject"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      disabled={subjectsLoading}
                      className="w-full h-11 px-3.5 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[14px] text-[#121c2a] appearance-none transition-all outline-none disabled:opacity-60"
                    >
                      <option value="">
                        {subjectsLoading ? "Đang tải lĩnh vực nghiên cứu..." : "Chọn lĩnh vực nghiên cứu..."}
                      </option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#727784] text-[20px]">
                      {subjectsLoading ? "progress_activity" : "expand_more"}
                    </span>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label htmlFor="doc-visibility" className="block text-[13px] font-semibold tracking-wide text-[#424753] mb-1.5 uppercase">
                    Chế độ hiển thị
                  </label>
                  <div className="flex gap-3 h-11">
                    <button
                      type="button"
                      onClick={() => setVisibility("PRIVATE")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-all ${
                        visibility === "PRIVATE"
                          ? "border-[#0058be] bg-[#eff3ff] text-[#0058be]"
                          : "border-[#c2c6d5] bg-[#f8f9ff] text-[#424753] hover:border-[#0058be]/40"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      Riêng tư
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("PUBLIC")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-all ${
                        visibility === "PUBLIC"
                          ? "border-[#0058be] bg-[#eff3ff] text-[#0058be]"
                          : "border-[#c2c6d5] bg-[#f8f9ff] text-[#424753] hover:border-[#0058be]/40"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">public</span>
                      Công khai
                    </button>
                  </div>
                  <p className="text-[11px] text-[#727784] mt-1.5">
                    {visibility === "PRIVATE"
                      ? "Chỉ bạn có thể xem. AI phân tích ngay lập tức."
                      : "Hiển thị công khai sau khi được admin duyệt."}
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="doc-description" className="block text-[13px] font-semibold tracking-wide text-[#424753] mb-1.5 uppercase">
                    Mô tả <span className="text-[#adb1bb] font-normal normal-case">(tuỳ chọn)</span>
                  </label>
                  <textarea
                    id="doc-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả nội dung, ghi chú hoặc từ khoá liên quan..."
                    rows={3}
                    className="w-full p-3.5 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[14px] text-[#121c2a] transition-all resize-y outline-none placeholder:text-[#adb1bb]"
                  />
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div className="bg-[#eff3ff] border border-[#0058be]/20 rounded-xl px-4 py-3 flex items-start gap-3 mb-8">
              <span className="material-symbols-outlined text-[#0058be] text-[18px] mt-0.5 flex-shrink-0">auto_awesome</span>
              <div className="text-[13px] text-[#121c2a] leading-relaxed">
                <span className="font-semibold">AI sẽ tự động:</span> trích xuất nội dung, tạo vector embedding, và lập chỉ mục để phục vụ tính năng hỏi-đáp thông minh ngay sau khi tải lên.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#d9e3f7]">
              <Link
                href="/user/library"
                className="px-6 py-2.5 rounded-[14px] text-[14px] font-semibold text-[#424753] hover:bg-[#f1f5f9] transition-colors h-11 flex items-center justify-center"
              >
                Hủy
              </Link>
              <button
                id="upload-submit-btn"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !subjectId || !title.trim()}
                className="px-10 py-2.5 rounded-[14px] text-[14px] font-semibold text-white bg-[#0058be] hover:bg-[#2170e4] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0058be] transition-all h-11 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,65,145,0.2)] hover:shadow-[0_6px_20px_rgba(0,65,145,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Đang tải lên... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                    Tải lên &amp; Lưu
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

