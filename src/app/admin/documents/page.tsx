"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, Eye, FileText, Plus, Search, XCircle } from "lucide-react"

import {
  getDocumentItems,
  getDocuments,
  moderateDocument,
} from "@/features/documents/api/documents-api"
import type { DocumentRecord, DocumentStatus } from "@/features/documents/types"

const statusFilters = ["Pending", "All", "Approved", "Rejected"] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatStatus(status: DocumentStatus) {
  if (status === "APPROVED") return "Approved"
  if (status === "REJECTED") return "Rejected"
  return "Pending"
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("Pending")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const queryStatus = useMemo<DocumentStatus | undefined>(() => {
    if (statusFilter === "Approved") return "APPROVED"
    if (statusFilter === "Rejected") return "REJECTED"
    if (statusFilter === "Pending") return "PENDING"
    return undefined
  }, [statusFilter])

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await getDocuments({
        search: search.trim() || undefined,
        page: 1,
        limit: 50,
      })
      const items = getDocumentItems(response)
      setDocuments(queryStatus ? items.filter((doc) => doc.status === queryStatus) : items)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải documents.")
    } finally {
      setIsLoading(false)
    }
  }, [queryStatus, search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDocuments()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [loadDocuments])

  async function handleModerate(documentId: string, action: "APPROVED" | "REJECTED") {
    try {
      setErrorMessage("")
      await moderateDocument(documentId, { action })
      await loadDocuments()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể duyệt document.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5">
            Document Management
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Review submitted documents, approve quality content, and manage rejected uploads.
          </p>
        </div>
        <Link
          href="/admin/documents/upload"
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Upload Document</span>
        </Link>
      </div>

      <div className="bg-white border border-[#c2c6d6]/40 p-4 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search documents by title..."
            className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-2.5 pl-11 pr-4 text-[14px] text-[#121c2a] placeholder:text-[#727785] focus:outline-none focus:border-[#0058be] transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                filter === statusFilter
                  ? "bg-[#0058be] text-white shadow-sm"
                  : "bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-8 rounded-3xl border border-[#c2c6d6]/40 text-center text-[#727785]">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#c2c6d6]/40 text-center text-[#727785]">
            {statusFilter === "Pending"
              ? "No pending documents waiting for review."
              : "No documents found."}
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/admin/documents/${doc.id}`)}
              className="bg-white p-5 rounded-3xl border border-[#c2c6d6]/40 hover:border-[#0058be]/40 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center gap-6 cursor-pointer group"
            >
              <div className="p-4 bg-[#eff4ff] text-[#0058be] rounded-2xl self-start md:self-center shrink-0">
                <FileText size={28} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-bold text-[#121c2a] text-[15px] truncate pr-2 group-hover:text-[#0058be] transition-colors">
                    {doc.title}
                  </h3>
                  <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                    doc.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200/60" :
                    doc.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200/60" : "bg-red-50 text-red-700 border-red-200/60"
                  }`}>
                    {formatStatus(doc.status)}
                  </span>
                  {doc.visibility === "PUBLIC" ? (
                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200/60">
                      Public
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#727785]">
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(doc.createdAt)}</span>
                  <span className="font-bold text-[#0058be]">#{doc.subject?.name ?? "Uncategorized"}</span>
                  <span>By <span className="font-bold text-[#121c2a]">{doc.owner?.name ?? "Unknown"}</span></span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[#c2c6d6]/30 md:border-t-0 pt-4 md:pt-0 shrink-0">
                {doc.status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleModerate(doc.id, "APPROVED")
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-[13px] font-bold hover:bg-green-700 transition-all shadow-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleModerate(doc.id, "REJECTED")
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200/60 rounded-xl text-[13px] font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                ) : (
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754] hover:text-[#0058be] rounded-xl text-[13px] font-bold transition-all border border-[#c2c6d6]/40">
                    <Eye size={16} />
                    Preview
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
