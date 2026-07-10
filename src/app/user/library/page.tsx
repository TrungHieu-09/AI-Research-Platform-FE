"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, FileText, FolderOpen, Hash, LayoutGrid, List, Search, Upload, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDocumentItems, getDocuments } from "@/features/documents/api/documents-api"
import type { DocumentRecord } from "@/features/documents/types"

function getDocumentType(document: DocumentRecord) {
  const fromMime = document.mimeType?.split("/").pop()?.toUpperCase()
  const fromUrl = document.fileUrl?.split("?")[0].split(".").pop()?.toUpperCase()
  return fromUrl && fromUrl.length <= 5 ? fromUrl : fromMime ?? "FILE"
}

function getDocumentYear(document: DocumentRecord) {
  return new Date(document.createdAt).getFullYear()
}

function getStatusLabel(document: DocumentRecord) {
  if (document.status === "APPROVED") return "Published"
  if (document.status === "REJECTED") return "Rejected"
  return "Pending"
}

function getStatusBadgeStyle(document: DocumentRecord) {
  if (document.status === "APPROVED") return "bg-green-50 text-green-700 border-green-200"
  if (document.status === "REJECTED") return "bg-red-50 text-red-700 border-red-200"
  return "bg-amber-50 text-amber-700 border-amber-200"
}

function getIconStyle(document: DocumentRecord) {
  const type = getDocumentType(document)
  if (type === "PDF") return { iconColor: "text-red-500", iconBg: "bg-red-50" }
  if (type === "DOCX" || type === "DOC") return { iconColor: "text-blue-500", iconBg: "bg-blue-50" }
  return { iconColor: "text-gray-500", iconBg: "bg-gray-100" }
}

export default function LibraryPage() {
  const [search, setSearch] = React.useState("")
  const [documents, setDocuments] = React.useState<DocumentRecord[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [successMessage, setSuccessMessage] = React.useState("")

  const selectedDocument =
    documents.find((document) => document.id === selectedDocumentId) ?? documents[0] ?? null

  const loadDocuments = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await getDocuments({
        search: search.trim() || undefined,
        page: 1,
        limit: 30,
      })
      const items = getDocumentItems(response)
      setDocuments(items)
      setSelectedDocumentId((currentId) => currentId ?? items[0]?.id ?? null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải documents.")
    } finally {
      setIsLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDocuments()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [loadDocuments])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("uploaded") === "1") {
      setSuccessMessage(
        params.get("review") === "pending"
          ? "Upload document thành công. Tài liệu public đang chờ admin duyệt trước khi hiển thị cho người khác."
          : "Upload document thành công. Tài liệu đã được cập nhật vào thư viện.",
      )
      window.history.replaceState(null, "", "/user/library")
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9ff]">
      <div className="shrink-0 px-6 pt-6 pb-4 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-[#0058be] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              AI RESEARCH LIBRARY
            </div>
            <h1 className="text-[28px] font-bold text-[#121c2a] tracking-tight leading-none mb-2">
              Library
            </h1>
            <p className="text-[14px] text-[#424754]">
              Browse, organize, and review your research documents in one workspace.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-[#c2c6d6]/40 rounded-2xl w-[88px] py-2.5 shadow-sm">
              <span className="text-[20px] font-bold text-[#121c2a] leading-none mb-1">{documents.length}</span>
              <span className="text-[10px] font-semibold text-[#727785] tracking-wider uppercase">DOCS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-[480px] px-4 py-2.5 rounded-2xl border border-[#c2c6d6]/50 bg-white shadow-sm">
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
            <div className="flex items-center bg-white border border-[#c2c6d6]/50 rounded-2xl p-1 shadow-sm">
              <button className="p-1.5 text-[#424754] bg-gray-100 rounded-xl">
                <List size={16} />
              </button>
              <button className="p-1.5 text-[#727785] hover:text-[#424754] rounded-xl">
                <LayoutGrid size={16} />
              </button>
            </div>
            <Link href="/user/upload" className="flex items-center gap-2 px-6 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-2xl text-[14px] font-semibold">
              <Upload size={16} />
              Upload
            </Link>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <p className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="mx-6 mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-semibold text-green-700">
          {successMessage}
        </p>
      ) : null}

      <div className="flex-1 overflow-hidden px-6 pb-6 flex gap-6">
        <div className="flex-1 bg-white border border-[#c2c6d6]/40 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#c2c6d6]/30">
            <div>
              <h2 className="text-[16px] font-bold text-[#121c2a]">Document Index</h2>
              <p className="text-[13px] text-[#727785] mt-0.5">
                {isLoading ? "Loading documents..." : `${documents.length} matching documents.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_100px_160px] gap-4 px-6 py-3 border-b border-[#c2c6d6]/30 bg-[#f8f9ff]/50 text-[11px] font-bold text-[#727785] uppercase tracking-wider">
            <div className="w-[20px]"></div>
            <div>Title & Owner</div>
            <div>Year</div>
            <div>Subject</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isLoading && documents.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-[#727785]">No documents found.</p>
            ) : (
              documents.map((doc) => {
                const iconStyle = getIconStyle(doc)
                const isSelected = selectedDocument?.id === doc.id
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)_100px_160px] gap-4 px-6 py-4 border-b border-[#c2c6d6]/20 hover:bg-[#f8f9ff] transition-colors items-center group cursor-pointer",
                      isSelected && "bg-[#eff4ff]/40",
                    )}
                  >
                    <div className="w-[20px] flex items-center justify-center shrink-0">
                      <input type="checkbox" checked={isSelected} onChange={() => setSelectedDocumentId(doc.id)} />
                    </div>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", iconStyle.iconBg)}>
                        <FileText size={16} className={iconStyle.iconColor} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[14px] font-bold text-[#121c2a] truncate">{doc.title}</p>
                          <span className="text-[9px] font-bold text-[#727785] bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{getDocumentType(doc)}</span>
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", getStatusBadgeStyle(doc))}>
                            {getStatusLabel(doc)}
                          </span>
                          {doc.visibility === "PUBLIC" ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 shrink-0">
                              Public
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[12px] text-[#727785] truncate">{doc.owner?.name ?? "Unknown owner"}</p>
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-[#424754]">{getDocumentYear(doc)}</div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#424754] bg-white border border-[#c2c6d6]/40 px-2 py-1 rounded-md shadow-sm w-fit">
                      <FolderOpen size={12} className="text-[#727785]" />
                      <span className="truncate">{doc.subject?.name ?? "Uncategorized"}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="w-[320px] shrink-0 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-3xl p-5 shadow-sm overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">Inspector</p>
              <h3 className="text-[15px] font-bold text-[#121c2a]">Document Details</h3>
            </div>
            <button className="p-1.5 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-xl">
              <X size={16} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#0058be] to-[#004ca3] rounded-2xl p-5 text-white shadow-md shadow-[#0058be]/20 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
              <FileText size={20} className="text-white" />
            </div>
            <h4 className="text-[16px] font-bold leading-snug mb-2">{selectedDocument?.title ?? "No document selected"}</h4>
            <p className="text-[12px] text-white/80 leading-relaxed">{selectedDocument?.owner?.name ?? "Unknown owner"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
              <Calendar size={14} className="text-[#0058be] mb-2" />
              <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Year</p>
              <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocument ? getDocumentYear(selectedDocument) : "N/A"}</p>
            </div>
            <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
              <Hash size={14} className="text-[#0058be] mb-2" />
              <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Status</p>
              <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocument ? getStatusLabel(selectedDocument) : "N/A"}</p>
            </div>
            <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
              <FolderOpen size={14} className="text-[#0058be] mb-2" />
              <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Subject</p>
              <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocument?.subject?.name ?? "N/A"}</p>
            </div>
            <div className="bg-white border border-[#c2c6d6]/40 rounded-xl p-3">
              <Users size={14} className="text-[#0058be] mb-2" />
              <p className="text-[10px] font-bold text-[#727785] uppercase mb-0.5">Pages</p>
              <p className="text-[13px] font-bold text-[#121c2a]">{selectedDocument?.pageCount ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
