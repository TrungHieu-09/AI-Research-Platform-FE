"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  createDocument,
  requestDocumentUploadUrl,
  uploadFileToPresignedUrl,
} from "@/features/documents/api/documents-api"
import type { DocumentVisibility } from "@/features/documents/types"
import { getSubjects, suggestSubject } from "@/features/subjects/api/subjects-api"
import type { Subject } from "@/features/subjects/types"

async function calculateSha256(file: File) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export default function UploadDocumentPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [visibility, setVisibility] = useState<DocumentVisibility>("PRIVATE")
  const [pageCount, setPageCount] = useState(1)
  const [suggestedSubject, setSuggestedSubject] = useState("")
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true)
      const subjectItems = await getSubjects({ status: "ACTIVE" })
      setSubjects(subjectItems)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải subjects.")
    } finally {
      setIsLoadingSubjects(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubjects()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSubjects])

  async function handleSuggestSubject() {
    if (!suggestedSubject.trim()) return

    try {
      setErrorMessage("")
      await suggestSubject({ name: suggestedSubject.trim() })
      setMessage("Đã gửi đề xuất subject. Admin sẽ duyệt trước khi subject xuất hiện trong danh sách.")
      setSuggestedSubject("")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể gửi đề xuất subject.")
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      setErrorMessage("Vui lòng chọn file.")
      return
    }

    if (!subjectId) {
      setErrorMessage("Vui lòng chọn subject.")
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage("")
      setMessage("")

      const fileHash = await calculateSha256(file)
      const uploadResponse = await requestDocumentUploadUrl({
        filename: file.name,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      })

      const uploadUrl = uploadResponse.uploadUrl ?? uploadResponse.url
      const fileUrl = uploadResponse.fileUrl ?? uploadResponse.publicUrl ?? uploadResponse.document?.fileUrl

      if (!uploadResponse.document && uploadUrl) {
        await uploadFileToPresignedUrl(uploadUrl, file)
      }

      if (!fileUrl) {
        throw new Error("BE chưa trả fileUrl/publicUrl sau khi xin upload URL.")
      }

      await createDocument({
        title: title.trim() || file.name,
        description: description.trim() || undefined,
        subjectId,
        visibility,
        fileUrl,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        pageCount,
      })

      setMessage(
        visibility === "PUBLIC"
          ? "Upload document thành công. Tài liệu public đang chờ admin duyệt. Đang chuyển về thư viện..."
          : "Upload document thành công. Đang chuyển về thư viện...",
      )
      setFile(null)
      setTitle("")
      setDescription("")
      window.setTimeout(() => {
        router.push(`/user/library?uploaded=1${visibility === "PUBLIC" ? "&review=pending" : ""}`)
      }, 700)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload thất bại.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      <form onSubmit={handleUpload} className="max-w-[900px] mx-auto w-full">
        <header className="mb-12">
          <h1 className="text-[32px] font-semibold text-[#121c2a] tracking-tight">Upload Document</h1>
          <p className="text-[14px] text-[#424753] mt-2">
            Add a document, choose its subject, and save it to your research library.
          </p>
        </header>

        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}
        {message ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-semibold text-green-700">
            {message}
          </div>
        ) : null}

        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-12 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-12">
          <label className="border-2 border-dashed border-[#c2c6d5] hover:border-[#0058be]/50 bg-[#f8f9ff] rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-64 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#eff3ff] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px] text-[#0058be]">cloud_upload</span>
            </div>
            <h3 className="text-[24px] font-semibold text-[#121c2a] mb-1">
              {file ? file.name : "Drag & drop your file here"}
            </h3>
            <p className="text-[16px] text-[#424753] mb-6">or click to browse from your computer</p>
            <p className="text-[12px] font-medium text-[#727784] uppercase tracking-wider">Supported formats: PDF, DOCX (Max 50MB)</p>
            <input
              className="hidden"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-12 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-12">
          <h2 className="text-[24px] font-semibold text-[#121c2a] mb-6">Document Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="md:col-span-2">
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] text-[14px] text-[#121c2a] outline-none"
                type="text"
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as DocumentVisibility)}
                className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] text-[14px] text-[#121c2a] outline-none"
              >
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public - requires approval</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Page Count</label>
              <input
                value={pageCount}
                onChange={(event) => setPageCount(Number(event.target.value))}
                min={1}
                className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] text-[14px] text-[#121c2a] outline-none"
                type="number"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] text-[14px] text-[#121c2a] outline-none"
              >
                <option value="">{isLoadingSubjects ? "Loading subjects..." : "Select a subject"}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Suggest new subject</label>
              <div className="flex gap-2">
                <input
                  value={suggestedSubject}
                  onChange={(event) => setSuggestedSubject(event.target.value)}
                  className="flex-1 h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] text-[14px] text-[#121c2a] outline-none"
                  placeholder="Subject name"
                  type="text"
                />
                <button
                  type="button"
                  onClick={() => void handleSuggestSubject()}
                  className="px-4 rounded-lg bg-[#eff4ff] text-[#0058be] text-[13px] font-bold"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Abstract / Notes</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full p-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] text-[14px] text-[#121c2a] resize-y outline-none"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#d9e3f7]">
          <Link href="/user/library" className="px-6 py-2 rounded-[16px] text-[14px] font-semibold tracking-wide text-[#424753] hover:bg-[#f1f5f9] h-12 flex items-center justify-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isUploading}
            className="px-12 py-2 rounded-[16px] text-[14px] font-semibold tracking-wide text-white bg-[#0058be] hover:bg-[#2170e4] h-12 flex items-center justify-center gap-1 shadow-[0_4px_14px_rgba(0,65,145,0.2)] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">cloud_done</span>
            {isUploading ? "Uploading..." : "Upload & Save"}
          </button>
        </div>
      </form>
    </div>
  )
}
