"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Download,
  FileText,
  Info,
  RotateCcw,
  Trash2,
  User,
  XCircle,
} from "lucide-react"

import {
  deleteDocument,
  getDocument,
  getDocumentAuditLogs,
  hardDeleteDocument,
  moderateDocument,
  restoreDocument,
} from "@/features/documents/api/documents-api"
import type { AuditLog, DocumentRecord } from "@/features/documents/types"

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatStatus(status: DocumentRecord["status"]) {
  if (status === "APPROVED") return "Approved"
  if (status === "REJECTED") return "Rejected"
  return "Pending"
}

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [document, setDocument] = useState<DocumentRecord | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadDocument = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const [documentResponse, auditResponse] = await Promise.allSettled([
        getDocument(id),
        getDocumentAuditLogs(id),
      ])

      if (documentResponse.status === "rejected") throw documentResponse.reason

      setDocument(documentResponse.value)
      setAuditLogs(auditResponse.status === "fulfilled" ? auditResponse.value : [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải document.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDocument()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadDocument])

  async function handleModerate(decision: "APPROVED" | "REJECTED") {
    try {
      setIsSubmitting(true)
      setErrorMessage("")
      const trimmedRejectionReason = rejectionReason.trim()

      if (decision === "REJECTED" && !trimmedRejectionReason) {
        setErrorMessage("Vui lòng nhập lý do từ chối document trước khi reject.")
        return
      }

      await moderateDocument(id, {
        decision,
        rejectionReason: decision === "REJECTED" ? trimmedRejectionReason : undefined,
      })
      await loadDocument()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể duyệt document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSoftDelete() {
    if (!document) return
    try {
      setIsSubmitting(true)
      await deleteDocument(document.id)
      await loadDocument()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xóa document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRestore() {
    if (!document) return
    try {
      setIsSubmitting(true)
      setDocument(await restoreDocument(document.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể khôi phục document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleHardDelete() {
    if (!document) return
    if (!window.confirm("Xóa vĩnh viễn document này?")) return

    try {
      setIsSubmitting(true)
      await hardDeleteDocument(document.id)
      router.push("/admin/documents")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xóa vĩnh viễn document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/documents" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Review Document</h1>
            <p className="text-on-surface-variant font-medium">Moderate and verify academic resources.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {document?.deletedAt ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleRestore()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-primary/20 text-primary rounded-2xl font-bold hover:bg-primary/5 disabled:opacity-60"
            >
              <RotateCcw size={18} />
              Restore
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !document}
              onClick={() => void handleSoftDelete()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={18} />
              Soft Delete
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting || !document}
            onClick={() => void handleModerate("APPROVED")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-60"
          >
            <CheckCircle size={18} />
            Approve
          </button>
          <button
            type="button"
            disabled={isSubmitting || !document}
            onClick={() => void handleModerate("REJECTED")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 disabled:opacity-60"
          >
            <XCircle size={18} />
            Reject
          </button>
          <button
            type="button"
            disabled={isSubmitting || !document}
            onClick={() => void handleHardDelete()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 size={18} />
            Hard Delete
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="glass-panel p-8 text-[14px] font-medium text-on-surface-variant">
          Loading document...
        </div>
      ) : document ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-panel min-h-[600px] flex flex-col items-center justify-start p-10 bg-surface-container-low border-dashed border-2 border-outline-variant relative overflow-hidden">
              <div className="w-full h-12 bg-surface-container-highest rounded-t-xl border border-outline-variant flex items-center px-4 justify-between">
                <span className="text-[12px] font-bold text-on-surface-variant">Page 1 / {document.pageCount}</span>
                <a className="p-1.5 hover:bg-surface-container-high rounded" href={document.fileUrl} target="_blank" rel="noreferrer">
                  <Download size={14} />
                </a>
              </div>
              <div className="w-full max-w-[600px] bg-white shadow-2xl mt-12 p-16 space-y-8 aspect-[1/1.414]">
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <FileText size={56} className="text-primary" />
                  <h2 className="text-xl font-bold text-on-surface">{document.title}</h2>
                  <p className="text-sm text-on-surface-variant">Open original file to preview full content.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Info size={18} />
                </div>
                <h3 className="font-bold text-on-surface">Document Info</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Title</p>
                  <p className="text-[14px] font-bold text-on-surface">{document.title}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Subject</p>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    <p className="text-[14px] font-bold text-on-surface">{document.subject?.name ?? "Uncategorized"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Uploaded By</p>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-secondary" />
                    <p className="text-[14px] font-bold text-on-surface">{document.owner?.name ?? "Unknown"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Size & Pages</p>
                  <p className="text-[14px] font-bold text-on-surface">{formatFileSize(document.fileSize)} • {document.pageCount} Pages</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                  <p className="text-[14px] font-bold text-on-surface">{formatStatus(document.status)}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 bg-primary/5 border-primary/10">
              <h4 className="font-bold text-on-surface mb-2">Moderator Note</h4>
              <p className="text-[13px] text-on-surface-variant leading-relaxed mb-4">
                Fill this before rejecting.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Add a review comment..."
                className="w-full h-24 bg-white border border-outline-variant rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="text-primary" />
                <h4 className="font-bold text-on-surface">Audit Logs</h4>
              </div>
              {auditLogs.length === 0 ? (
                <p className="text-[13px] text-on-surface-variant">No audit logs returned.</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="rounded-xl border border-outline-variant p-3">
                      <p className="text-[13px] font-bold text-on-surface">{log.action}</p>
                      <p className="text-[12px] text-on-surface-variant">
                        {log.user?.name ?? "System"} • {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-[14px] font-medium text-on-surface-variant">
          Document not found.
        </div>
      )}
    </div>
  )
}
