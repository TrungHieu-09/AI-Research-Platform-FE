"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Globe2,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

type DocumentStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED"
type DocumentVisibility = "ALL" | "PUBLIC" | "PRIVATE"

type ReportDocument = {
  id: string
  title?: string
  description?: string | null
  visibility?: string
  status?: string
  rejectionReason?: string | null
  fileSize?: number
  mimeType?: string
  pageCount?: number
  createdAt?: string
  updatedAt?: string
  moderatedAt?: string | null
  owner?: { name?: string | null; email?: string | null }
  subject?: { name?: string | null; code?: string | null }
  analytics?: { views?: number; ratingAverage?: number; ratingCount?: number; bookmarkCount?: number }
  viewsCount?: number
  viewCount?: number
  bookmarksCount?: number
  ratingsCount?: number
  averageRating?: number
}

function normalizeArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.documents)) return payload.documents
  return []
}

function normalizeDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("vi-VN")
}

function toCsvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function statusMeta(status?: string) {
  const normalized = String(status || "PENDING").toUpperCase()
  if (normalized === "APPROVED") return { label: "Đã duyệt", icon: CheckCircle, className: "bg-green-100 text-green-700" }
  if (normalized === "REJECTED") return { label: "Từ chối", icon: XCircle, className: "bg-red-100 text-red-700" }
  return { label: "Chờ duyệt", icon: Clock, className: "bg-amber-100 text-amber-800" }
}

function visibilityMeta(visibility?: string) {
  const normalized = String(visibility || "PRIVATE").toUpperCase()
  if (normalized === "PUBLIC") return { label: "Công khai", icon: Globe2, className: "bg-purple-100 text-purple-700" }
  return { label: "Riêng tư", icon: Lock, className: "bg-gray-100 text-gray-700" }
}

function getViews(doc: ReportDocument) {
  return Number(doc.analytics?.views ?? doc.viewsCount ?? doc.viewCount ?? 0) || 0
}

function getRating(doc: ReportDocument) {
  return Number(doc.analytics?.ratingAverage ?? doc.averageRating ?? 0) || 0
}

function getRatingCount(doc: ReportDocument) {
  return Number(doc.analytics?.ratingCount ?? doc.ratingsCount ?? 0) || 0
}

function getBookmarkCount(doc: ReportDocument) {
  return Number(doc.analytics?.bookmarkCount ?? doc.bookmarksCount ?? 0) || 0
}

function formatBytes(bytes?: number) {
  const value = Number(bytes || 0)
  if (!value) return "0 MB"
  return `${(value / 1024 / 1024).toFixed(2)} MB`
}

export default function DocumentReportPage() {
  const { token, user } = useAuth()
  const [documents, setDocuments] = React.useState<ReportDocument[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<DocumentStatus>("ALL")
  const [visibilityFilter, setVisibilityFilter] = React.useState<DocumentVisibility>("ALL")
  const [fromDate, setFromDate] = React.useState("")
  const [toDate, setToDate] = React.useState("")

  const loadDocuments = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "x-user-role": "ADMIN",
      }
      if (user?.id) headers["x-user-id"] = user.id

      const params = new URLSearchParams({ page: "1", pageSize: "1000" })
      const res = await fetch(`${baseUrl}/api/admin/documents?${params.toString()}`, { headers })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || payload.message || "Không thể tải dữ liệu report tài liệu.")

      setDocuments(normalizeArray<ReportDocument>(payload))
    } catch (err: any) {
      setDocuments([])
      setError(err.message || "Không thể tải dữ liệu report tài liệu.")
    } finally {
      setLoading(false)
    }
  }, [token, user?.id])

  React.useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filteredDocuments = React.useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null
    const toTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null

    return documents.filter((doc) => {
      const status = String(doc.status || "PENDING").toUpperCase()
      const visibility = String(doc.visibility || "PRIVATE").toUpperCase()
      const createdTime = doc.createdAt ? new Date(doc.createdAt).getTime() : 0
      const haystack = [
        doc.title,
        doc.description,
        doc.owner?.name,
        doc.owner?.email,
        doc.subject?.name,
        doc.subject?.code,
        doc.rejectionReason,
      ].join(" ").toLowerCase()

      if (statusFilter !== "ALL" && status !== statusFilter) return false
      if (visibilityFilter !== "ALL" && visibility !== visibilityFilter) return false
      if (keyword && !haystack.includes(keyword)) return false
      if (fromTime && createdTime < fromTime) return false
      if (toTime && createdTime > toTime) return false
      return true
    })
  }, [documents, fromDate, searchTerm, statusFilter, toDate, visibilityFilter])

  const summary = React.useMemo(() => {
    const total = filteredDocuments.length
    const publicDocs = filteredDocuments.filter((doc) => String(doc.visibility).toUpperCase() === "PUBLIC").length
    const privateDocs = filteredDocuments.filter((doc) => String(doc.visibility).toUpperCase() !== "PUBLIC").length
    const pending = filteredDocuments.filter((doc) => String(doc.status).toUpperCase() === "PENDING").length
    const approved = filteredDocuments.filter((doc) => String(doc.status).toUpperCase() === "APPROVED").length
    const rejected = filteredDocuments.filter((doc) => String(doc.status).toUpperCase() === "REJECTED").length
    const totalViews = filteredDocuments.reduce((sum, doc) => sum + getViews(doc), 0)
    const rejectedWithReason = filteredDocuments.filter((doc) => String(doc.status).toUpperCase() === "REJECTED" && doc.rejectionReason).length

    return { total, publicDocs, privateDocs, pending, approved, rejected, totalViews, rejectedWithReason }
  }, [filteredDocuments])

  const topDocuments = React.useMemo(
    () => [...filteredDocuments].sort((a, b) => getViews(b) - getViews(a)).slice(0, 5),
    [filteredDocuments]
  )

  const exportCsv = () => {
    const rows = [
      ["Title", "Owner", "Owner Email", "Research Area", "Visibility", "Status", "Rejection Reason", "Views", "Rating", "Rating Count", "Bookmarks", "Pages", "File Size", "Created At", "Moderated At"],
      ...filteredDocuments.map((doc) => [
        doc.title || "Untitled",
        doc.owner?.name || "",
        doc.owner?.email || "",
        doc.subject?.name || doc.subject?.code || "",
        String(doc.visibility || "PRIVATE").toUpperCase(),
        String(doc.status || "PENDING").toUpperCase(),
        doc.rejectionReason || "",
        getViews(doc),
        getRating(doc).toFixed(1),
        getRatingCount(doc),
        getBookmarkCount(doc),
        doc.pageCount || 0,
        formatBytes(doc.fileSize),
        normalizeDate(doc.createdAt),
        normalizeDate(doc.moderatedAt),
      ]),
    ]

    const csv = "\ufeff" + rows.map((row) => row.map(toCsvCell).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lumis-document-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-1 text-[12px] font-extrabold uppercase tracking-wide text-[#0058be]">
            <BarChart3 size={14} /> Document Report
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
            Báo cáo tài liệu
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] font-medium leading-relaxed text-[#424754]">
            Tổng hợp tài liệu theo trạng thái kiểm duyệt, quyền truy cập, lượt xem và lý do từ chối. Có thể lọc dữ liệu và xuất file CSV.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#c2c6d6]/50 bg-white px-4 py-2.5 text-[13px] font-bold text-[#424754] shadow-sm transition-all hover:bg-[#f8f9ff] disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} /> Làm mới
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || filteredDocuments.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#0058be]/20 transition-all hover:bg-[#2170e4] disabled:opacity-50"
          >
            <Download size={16} /> Xuất CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Tổng tài liệu" value={summary.total} helper={`${summary.publicDocs} public · ${summary.privateDocs} private`} icon={FileText} tone="blue" />
        <ReportCard label="Chờ duyệt" value={summary.pending} helper="Tài liệu public cần admin xử lý" icon={Clock} tone="amber" />
        <ReportCard label="Đã duyệt" value={summary.approved} helper="Có thể hiển thị ở library/forum" icon={CheckCircle} tone="green" />
        <ReportCard label="Bị từ chối" value={summary.rejected} helper={`${summary.rejectedWithReason} tài liệu có lý do`} icon={XCircle} tone="red" />
      </div>

      <div className="rounded-3xl border border-[#c2c6d6]/40 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_170px_170px]">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả, lĩnh vực hoặc lý do từ chối..."
              className="h-11 w-full rounded-xl border border-[#c2c6d6]/60 bg-[#f8f9ff] pl-10 pr-4 text-[13px] font-medium text-[#121c2a] outline-none transition-all focus:border-[#0058be]"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DocumentStatus)} className="h-11 rounded-xl border border-[#c2c6d6]/60 bg-[#f8f9ff] px-3 text-[13px] font-bold text-[#424754] outline-none focus:border-[#0058be]">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>
          <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as DocumentVisibility)} className="h-11 rounded-xl border border-[#c2c6d6]/60 bg-[#f8f9ff] px-3 text-[13px] font-bold text-[#424754] outline-none focus:border-[#0058be]">
            <option value="ALL">Tất cả quyền hạn</option>
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
          <DateField label="Từ ngày" value={fromDate} onChange={setFromDate} />
          <DateField label="Đến ngày" value={toDate} onChange={setToDate} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-[13px] font-semibold text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-3xl border border-[#c2c6d6]/40 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#c2c6d6]/30 bg-[#f8f9ff] px-5 py-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#121c2a]">Danh sách tài liệu trong report</h2>
              <p className="text-[12px] font-semibold text-[#727785]">Hiển thị {filteredDocuments.length} / {documents.length} tài liệu</p>
            </div>
            <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-[12px] font-extrabold text-[#0058be]">
              {summary.totalViews.toLocaleString()} views
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#727785]">
              <Loader2 size={32} className="animate-spin text-[#0058be]" />
              <p className="text-[13px] font-semibold">Đang tải dữ liệu báo cáo...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-[#727785]">
              <FileText size={34} className="text-[#c2c6d6]" />
              <p className="text-[15px] font-extrabold text-[#121c2a]">Không có tài liệu phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#c2c6d6]/40 bg-white text-[11px] font-extrabold uppercase tracking-wider text-[#727785]">
                    <th className="px-5 py-3.5">Tài liệu</th>
                    <th className="px-5 py-3.5">Lĩnh vực</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5">Tương tác</th>
                    <th className="px-5 py-3.5">Ngày tạo</th>
                    <th className="px-5 py-3.5 text-right">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c2c6d6]/30">
                  {filteredDocuments.map((doc) => {
                    const status = statusMeta(doc.status)
                    const visibility = visibilityMeta(doc.visibility)
                    const StatusIcon = status.icon
                    const VisibilityIcon = visibility.icon

                    return (
                      <tr key={doc.id} className="transition-colors hover:bg-[#f8f9ff]/70">
                        <td className="px-5 py-4">
                          <p className="line-clamp-1 font-extrabold text-[#121c2a]">{doc.title || "Untitled"}</p>
                          <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[#727785]">{doc.owner?.name || doc.owner?.email || "Unknown owner"}</p>
                          {doc.rejectionReason && <p className="mt-1 line-clamp-1 text-[11px] font-semibold italic text-red-600">Lý do: {doc.rejectionReason}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg border border-[#c2c6d6]/40 bg-[#f8f9ff] px-2.5 py-1 text-[11px] font-bold text-[#424754]">
                            {doc.subject?.name || doc.subject?.code || "Chung"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold", visibility.className)}>
                              <VisibilityIcon size={12} /> {visibility.label}
                            </span>
                            <span className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold", status.className)}>
                              <StatusIcon size={12} /> {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[12px] font-bold text-[#424754]">
                          <div className="flex flex-col gap-1">
                            <span>{getViews(doc).toLocaleString()} views</span>
                            <span>{getRating(doc).toFixed(1)} ⭐ · {getBookmarkCount(doc)} saves</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[12px] font-semibold text-[#727785]">{normalizeDate(doc.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/admin/documents/${doc.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff4ff] text-[#0058be] transition-colors hover:bg-[#dee9fc]" title="Xem chi tiết tài liệu">
                            <Eye size={15} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#c2c6d6]/40 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Eye size={18} className="text-[#0058be]" />
              <h2 className="text-[16px] font-extrabold text-[#121c2a]">Top tài liệu theo lượt xem</h2>
            </div>
            <div className="space-y-3">
              {topDocuments.length === 0 ? (
                <p className="py-8 text-center text-[13px] font-semibold text-[#727785]">Chưa có dữ liệu top tài liệu.</p>
              ) : topDocuments.map((doc, index) => (
                <Link key={doc.id} href={`/admin/documents/${doc.id}`} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-[#f8f9ff]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[12px] font-extrabold text-[#0058be]">#{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold text-[#121c2a]">{doc.title || "Untitled"}</span>
                    <span className="block truncate text-[11px] font-semibold text-[#727785]">{doc.subject?.name || doc.owner?.name || "Chung"}</span>
                  </span>
                  <span className="text-[12px] font-extrabold text-[#0058be]">{getViews(doc)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#c2c6d6]/40 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[16px] font-extrabold text-[#121c2a]">Tỉ lệ trạng thái</h2>
            <StatusBar label="Chờ duyệt" value={summary.pending} total={summary.total} className="bg-amber-500" />
            <StatusBar label="Đã duyệt" value={summary.approved} total={summary.total} className="bg-green-500" />
            <StatusBar label="Bị từ chối" value={summary.rejected} total={summary.total} className="bg-red-500" />
          </div>
        </aside>
      </div>
    </div>
  )
}

function ReportCard({ label, value, helper, icon: Icon, tone }: { label: string; value: number; helper: string; icon: any; tone: "blue" | "amber" | "green" | "red" }) {
  const tones = {
    blue: "bg-[#eff4ff] text-[#0058be]",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  }

  return (
    <div className="rounded-3xl border border-[#c2c6d6]/40 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#727785]">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#121c2a]">{value.toLocaleString()}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#727785]">{helper}</p>
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]" />
      <input
        type="date"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#c2c6d6]/60 bg-[#f8f9ff] pl-9 pr-3 text-[13px] font-bold text-[#424754] outline-none focus:border-[#0058be]"
      />
    </label>
  )
}

function StatusBar({ label, value, total, className }: { label: string; value: number; total: number; className: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between text-[12px] font-extrabold text-[#424754]">
        <span>{label}</span>
        <span>{value.toLocaleString()} · {percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#eff4ff]">
        <div className={cn("h-full rounded-full", className)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
