"use client"

import * as React from "react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { CheckCircle, Clock, Eye, FileText, Globe2, Loader2, RefreshCw, Users, XCircle } from "lucide-react"
import { StatCard } from "@/features/dashboard/components/stat-card"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {}
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string") {
      const parsed = Number(value)
      if (value.trim() && Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

function readCollection(payload: unknown, nestedKeys: string[] = []) {
  if (Array.isArray(payload)) return payload

  const root = asRecord(payload)
  const candidates = ["items", "data", "results", "documents", "users", "rows", "records", "list", "docs", "payload", "result", ...nestedKeys]
  const nestedCandidates = ["items", "data", "results", "documents", "users", "rows", "records", "list", "docs"]

  for (const key of candidates) {
    const value = root[key]
    if (Array.isArray(value)) return value

    const nested = asRecord(value)
    for (const nestedKey of nestedCandidates) {
      if (Array.isArray(nested[nestedKey])) return nested[nestedKey]
    }
  }

  return []
}

function readTotal(payload: unknown, fallback: number, nestedKeys: string[] = []) {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const result = asRecord(root.result)
  const payloadRecord = asRecord(root.payload)
  const totals: unknown[] = [
    root.total,
    root.count,
    root.totalItems,
    root.totalCount,
    root.totalRecords,
    root.countAll,
    data.total,
    data.count,
    data.totalItems,
    data.totalCount,
    result.total,
    result.count,
    result.totalItems,
    result.totalCount,
    payloadRecord.total,
    payloadRecord.count,
    payloadRecord.totalItems,
    payloadRecord.totalCount,
    asRecord(root.meta).total,
    asRecord(root.meta).count,
    asRecord(root.pagination).total,
    asRecord(root.pagination).totalItems,
    asRecord(root.page).total,
    asRecord(data.meta).total,
    asRecord(data.pagination).total,
    asRecord(result.meta).total,
    asRecord(result.pagination).total,
  ]

  for (const key of nestedKeys) {
    const nested = asRecord(root[key])
    totals.push(nested.total, nested.count, nested.totalItems, nested.totalCount, asRecord(nested.pagination).total)
  }

  const total = readNumber(...totals)
  return total > 0 ? total : fallback
}

function documentStatus(doc: any) {
  return String(doc?.status ?? doc?.moderationStatus ?? doc?.state ?? "").toUpperCase()
}

function documentVisibility(doc: any) {
  return String(doc?.visibility ?? doc?.access ?? "").toUpperCase()
}

function documentViews(doc: any) {
  return readNumber(
    doc?.viewsCount,
    doc?.viewCount,
    doc?.views,
    doc?._count?.views,
    doc?.stats?.views,
    doc?.analytics?.views,
  )
}

function createdWithinDays(item: any, days: number) {
  const rawDate = item?.createdAt || item?.created_at || item?.joinedAt || item?.date
  if (!rawDate) return false

  const createdAt = new Date(rawDate).getTime()
  if (!Number.isFinite(createdAt)) return false

  const diffMs = Date.now() - createdAt
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000
}

function getSubjectName(doc: any) {
  if (typeof doc?.subject === "object") return doc.subject?.name || doc.subject?.code || "Nghiên cứu chung"
  return doc?.subject || doc?.subjectName || doc?.researchArea || "Nghiên cứu chung"
}

export function AdminDashboardPage() {
  const { token, user } = useAuth()

  const [statsData, setStatsData] = React.useState({
    totalUsers: 0,
    totalDocuments: 0,
    pendingModeration: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    publicDocuments: 0,
    privateDocuments: 0,
    totalViews: 0,
    newUsersThisWeek: 0,
    topDocuments: [] as any[],
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const adminHeaders = React.useMemo(() => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
    "x-user-role": "ADMIN",
    accept: "application/json",
  }), [token, user?.id])

  const fetchStats = React.useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const [resUsers, resAdminDocs, resDocs] = await Promise.all([
        fetch(`${baseUrl}/api/users?page=1&pageSize=500&limit=500`, { headers: adminHeaders }).catch(() => null),
        fetch(`${baseUrl}/api/admin/documents?page=1&pageSize=500&limit=500`, { headers: adminHeaders }).catch(() => null),
        fetch(`${baseUrl}/api/documents?page=1&pageSize=500&limit=500`, { headers: adminHeaders }).catch(() => null),
      ])

      const [usersData, adminDocsData, docsData] = await Promise.all([
        resUsers?.ok ? resUsers.json().catch(() => ({})) : Promise.resolve({}),
        resAdminDocs?.ok ? resAdminDocs.json().catch(() => ({})) : Promise.resolve({}),
        resDocs?.ok ? resDocs.json().catch(() => ({})) : Promise.resolve({}),
      ])

      const usersList = readCollection(usersData, ["users"])
      const adminDocsList = readCollection(adminDocsData, ["documents"])
      const fallbackDocsList = readCollection(docsData, ["documents"])
      const docsList = adminDocsList.length > 0 ? adminDocsList : fallbackDocsList

      const totalUsers = readTotal(usersData, usersList.length, ["users"])
      const totalDocuments = Math.max(
        readTotal(adminDocsData, adminDocsList.length, ["documents"]),
        readTotal(docsData, fallbackDocsList.length, ["documents"]),
        docsList.length,
      )

      const pendingModeration = docsList.filter((doc: any) => ["PENDING", "DRAFT"].includes(documentStatus(doc))).length
      const approvedDocuments = docsList.filter((doc: any) => documentStatus(doc) === "APPROVED").length
      const rejectedDocuments = docsList.filter((doc: any) => documentStatus(doc) === "REJECTED").length
      const publicDocuments = docsList.filter((doc: any) => documentVisibility(doc) === "PUBLIC").length
      const privateDocuments = docsList.filter((doc: any) => documentVisibility(doc) === "PRIVATE").length
      const totalViews = docsList.reduce((sum: number, doc: any) => sum + documentViews(doc), 0)
      const newUsersThisWeek = usersList.filter((item: any) => createdWithinDays(item, 7)).length

      const topDocuments = docsList
        .filter((doc: any) => doc?.id || doc?.title)
        .sort((a: any, b: any) => documentViews(b) - documentViews(a))
        .slice(0, 6)

      setStatsData({
        totalUsers,
        totalDocuments,
        pendingModeration,
        approvedDocuments,
        rejectedDocuments,
        publicDocuments,
        privateDocuments,
        totalViews,
        newUsersThisWeek,
        topDocuments,
      })
    } catch {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [token, adminHeaders])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const statusBars = [
    { label: "Đã duyệt", value: statsData.approvedDocuments, icon: CheckCircle, tone: "bg-green-500" },
    { label: "Chờ duyệt", value: statsData.pendingModeration, icon: Clock, tone: "bg-amber-500" },
    { label: "Từ chối", value: statsData.rejectedDocuments, icon: XCircle, tone: "bg-red-500" },
    { label: "Công khai", value: statsData.publicDocuments, icon: Globe2, tone: "bg-[#0058be]" },
    { label: "Riêng tư", value: statsData.privateDocuments, icon: FileText, tone: "bg-slate-500" },
  ]
  const maxStatusValue = Math.max(...statusBars.map(item => item.value), 1)

  return (
    <div className="space-y-8">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div>
          <div className="flex items-center gap-2">
            <motion.h1
              className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
              style={{ fontFamily: "Geist, sans-serif" }}
              variants={fadeUp}
              custom={0}
            >
              Tổng quan Hệ thống
            </motion.h1>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <motion.p className="text-[14px] text-[#424754] max-w-2xl" variants={fadeUp} custom={1}>
            Giám sát số liệu thật từ người dùng, tài liệu, trạng thái kiểm duyệt và lượt xem trên hệ thống.
          </motion.p>
        </div>
      </motion.div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 font-medium text-[14px]">
          ⚠️ {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Tổng Sinh viên / Người dùng"
          value={loading ? "..." : statsData.totalUsers.toLocaleString()}
          icon={Users}
          description={statsData.newUsersThisWeek > 0 ? `+${statsData.newUsersThisWeek} người mới 7 ngày qua` : "Theo dữ liệu API người dùng"}
          href="/admin/users"
          index={0}
        />
        <StatCard
          title="Tài liệu Học thuật"
          value={loading ? "..." : statsData.totalDocuments.toLocaleString()}
          icon={FileText}
          description={`${statsData.totalViews.toLocaleString()} lượt xem toàn hệ thống`}
          href="/admin/documents"
          index={1}
        />
        <StatCard
          title="Chờ Kiểm duyệt"
          value={loading ? "..." : statsData.pendingModeration.toString()}
          icon={Clock}
          description={statsData.pendingModeration === 0 ? "Không có tài liệu chờ duyệt" : "Tài liệu công khai cần admin xử lý"}
          href="/admin/documents?status=PENDING"
          index={2}
        />
        <StatCard
          title="Tài liệu Công khai"
          value={loading ? "..." : statsData.publicDocuments.toLocaleString()}
          icon={Globe2}
          description={`${statsData.approvedDocuments.toLocaleString()} tài liệu đã duyệt`}
          href="/admin/documents?visibility=PUBLIC"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">DOCUMENT STATUS</p>
              <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Phân bổ trạng thái tài liệu
              </h2>
              <p className="text-[12px] text-[#727785] mt-1">Tính trực tiếp từ danh sách tài liệu admin lấy được qua API.</p>
            </div>
            <Link href="/admin/documents" className="text-[12px] font-bold text-[#0058be] hover:underline shrink-0">
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-[#727785]">
              <Loader2 size={26} className="animate-spin text-[#0058be]" />
            </div>
          ) : statusBars.every(item => item.value === 0) ? (
            <p className="text-[13px] text-[#727785] text-center py-16 italic">Chưa có dữ liệu trạng thái tài liệu.</p>
          ) : (
            <div className="space-y-4">
              {statusBars.map((item, index) => {
                const Icon = item.icon
                const percent = Math.max(4, Math.round((item.value / maxStatusValue) * 100))
                return (
                  <motion.div
                    key={item.label}
                    className="grid grid-cols-[150px_1fr_56px] items-center gap-4"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + index * 0.06, duration: 0.35 }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={16} className="text-[#0058be] shrink-0" />
                      <span className="text-[13px] font-bold text-[#424754] truncate">{item.label}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#eff4ff] overflow-hidden">
                      <div className={cn("h-full rounded-full", item.tone)} style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-right text-[13px] font-extrabold text-[#121c2a]">{item.value}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          className="bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">TOP ACADEMIC</p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Tài liệu Phổ biến
                </h2>
              </div>
              <Link href="/admin/documents" className="text-[12px] font-bold text-[#0058be] hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10 text-[#727785]">
                  <Loader2 size={24} className="animate-spin text-[#0058be]" />
                </div>
              ) : statsData.topDocuments.length === 0 ? (
                <p className="text-[13px] text-[#727785] text-center py-6 italic">
                  Chưa có tài liệu nổi bật nào được ghi nhận.
                </p>
              ) : (
                statsData.topDocuments.map((doc: any, i: number) => (
                  <motion.div
                    key={doc.id || i}
                    className="flex gap-3.5 items-center group p-2.5 rounded-2xl hover:bg-[#f8f9ff] transition-colors border border-transparent hover:border-[#c2c6d6]/30"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#0058be] font-extrabold text-[12px] flex items-center justify-center shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/documents/${doc.id}`} className="text-[13px] font-bold text-[#121c2a] leading-snug hover:text-[#0058be] transition-colors truncate block">
                        {doc.title || "Untitled document"}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-[#727785] font-medium mt-0.5">
                        <span className="truncate">{getSubjectName(doc)}</span>
                        <span className="flex items-center gap-1 text-[#0058be] font-bold shrink-0">
                          <Eye size={12} /> {documentViews(doc)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c2c6d6]/30">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#727785] font-medium">Dữ liệu từ API tài liệu</span>
              <span className="font-bold text-[#0058be] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Trực tiếp
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
