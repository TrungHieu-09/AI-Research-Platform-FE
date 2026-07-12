"use client"

import { StatCard } from "@/features/dashboard/components/stat-card"
import { Users, User as UserIcon, FileText, Clock, AlertCircle, TrendingUp, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { getAdminDocuments, getDocumentItems } from "@/features/documents/api/documents-api"
import type { DocumentRecord } from "@/features/documents/types"
import { getSubjects } from "@/features/subjects/api/subjects-api"
import { getUserItems, getUserTotal, getUsers } from "@/features/users/api/users-api"
import type { ManagedUser } from "@/features/users/types"

const EMPTY_CHART_7D = [0, 0, 0, 0, 0, 0, 0]
const EMPTY_CHART_30D = Array.from({ length: 30 }, () => 0)

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatRelativeTime(value?: string) {
  if (!value) return "Unknown time"

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return "Unknown time"

  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function getDocumentStatus(document: DocumentRecord) {
  return document.status?.toUpperCase()
}

function buildChart(documents: DocumentRecord[], days: number) {
  const buckets = Array.from({ length: days }, () => 0)
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days + 1)

  documents.forEach((document) => {
    const createdAt = new Date(document.createdAt)
    if (Number.isNaN(createdAt.getTime()) || createdAt < start) return

    const index = Math.floor((createdAt.getTime() - start.getTime()) / 86400000)
    if (index >= 0 && index < buckets.length) {
      buckets[index] += 1
    }
  })

  const max = Math.max(...buckets)
  if (max === 0) return days === 7 ? EMPTY_CHART_7D : EMPTY_CHART_30D

  return buckets.map((count) => Math.max(8, Math.round((count / max) * 100)))
}

function getChartLabels(days: number) {
  if (days === 7) return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return Array.from({ length: 30 }, (_, i) => `D${i + 1}`)
}

export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [subjectCount, setSubjectCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const [usersResponse, documentsResponse, subjectsResponse] = await Promise.all([
          getUsers({ page: 1, limit: 100 }),
          getAdminDocuments(),
          getSubjects(),
        ])

        setUsers(getUserItems(usersResponse))
        setTotalUsers(getUserTotal(usersResponse))
        setDocuments(getDocumentItems(documentsResponse))
        setSubjectCount(subjectsResponse.length)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải dashboard.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboardData()
  }, [])

  const pendingDocuments = useMemo(
    () => documents.filter((document) => getDocumentStatus(document) === "PENDING").length,
    [documents],
  )
  const approvedDocuments = useMemo(
    () => documents.filter((document) => getDocumentStatus(document) === "APPROVED").length,
    [documents],
  )

  const chartDays = timeRange === "7d" ? 7 : 30
  const chart = useMemo(() => buildChart(documents, chartDays), [chartDays, documents])
  const labels = useMemo(() => getChartLabels(chartDays), [chartDays])

  const activities = useMemo(() => {
    const documentActivities = documents.slice(0, 2).map((document) => ({
      text: `Document '${document.title}' is ${document.status.toLowerCase()}`,
      time: formatRelativeTime(document.updatedAt ?? document.createdAt),
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50",
    }))

    const userActivities = users.slice(0, 1).map((user) => ({
      text: `User registered: ${user.name}`,
      time: formatRelativeTime(user.createdAt),
      icon: UserIcon,
      color: "text-[#0058be]",
      bg: "bg-[#eff4ff]",
    }))

    const subjectActivity =
      subjectCount > 0
        ? [{
            text: `${subjectCount} subjects available in catalog`,
            time: "Current",
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
          }]
        : []

    return [...documentActivities, ...userActivities, ...subjectActivity].slice(0, 4)
  }, [documents, subjectCount, users])

  return (
    <div className="space-y-8">
      {/* Top Title Bar */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial="hidden" animate="visible" variants={fadeUp}
      >
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
            variants={fadeUp} custom={0}
          >
            Admin Overview
          </motion.h1>
          <motion.p className="text-[14px] text-[#424754] max-w-2xl" variants={fadeUp} custom={1}>
            Monitor and manage the Lumis platform's core metrics, document moderation, and user activity.
          </motion.p>
        </div>

        {/* Time Range Filter Pill */}
        <motion.div
          className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#c2c6d6]/40 shadow-sm w-fit"
          variants={fadeUp} custom={2}
        >
          {(['7d', '30d'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all",
                timeRange === t
                  ? "bg-[#0058be] text-white shadow-sm"
                  : "hover:bg-[#f8f9ff] text-[#424754]"
              )}
            >
              Past {t === '7d' ? '7' : '30'} days
            </button>
          ))}
        </motion.div>
      </motion.div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={isLoading ? "..." : formatNumber(totalUsers)} icon={Users}
          description="Accounts in system" href="/admin/users" index={0} />
        <StatCard title="Documents" value={isLoading ? "..." : formatNumber(documents.length)} icon={FileText}
          description={`${approvedDocuments} approved`} href="/admin/documents" index={1} />
        <StatCard title="Pending" value={isLoading ? "..." : formatNumber(pendingDocuments)} icon={Clock}
          description="Awaiting review" href="/admin/documents?status=pending" index={2} />
        <StatCard title="Subjects" value={isLoading ? "..." : formatNumber(subjectCount)} icon={AlertCircle}
          description="Catalog categories" href="/admin/subjects" index={3} />
      </div>

      {/* Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* System Performance Chart Card */}
        <motion.div
          className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0,88,190,0.08)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">ANALYTICS</p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  System Performance
                </h2>
              </div>
              <motion.div
                className="flex items-center gap-2 text-[#0058be] font-bold text-[13px] bg-[#eff4ff] px-3 py-1 rounded-full"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp size={15} />
                <span>{timeRange === '7d' ? 'Weekly' : 'Monthly'} Growth</span>
              </motion.div>
            </div>

            <div className="h-[280px] w-full flex items-end gap-2 pt-6 px-2">
              <AnimatePresence mode="wait">
                {chart.map((h, i) => (
                  <motion.div
                    key={`${timeRange}-${i}`}
                    className="flex-1 bg-gradient-to-t from-[#0058be]/20 to-[#0058be]/70 hover:from-[#0058be] hover:to-[#2170e4] rounded-t-xl cursor-pointer relative group"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    style={{ originY: 1, height: `${h}%` } as React.CSSProperties}
                    whileHover={{ filter: "brightness(1.15)" }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#121c2a] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                      {labels[i]}: {h}%
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-between mt-5 pt-4 border-t border-[#c2c6d6]/30 text-[11px] text-[#727785] font-bold uppercase tracking-wider px-1">
            <span>{labels[0]}</span>
            <span>{labels[Math.floor(labels.length / 2)]}</span>
            <span>{labels[labels.length - 1]}</span>
          </div>
        </motion.div>

        {/* Recent Activity Card */}
        <motion.div
          className="bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0,88,190,0.08)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">LOGS</p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Recent Activity
                </h2>
              </div>
              <motion.button
                className="text-[12px] font-bold text-[#0058be] hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.button>
            </div>

            <div className="space-y-5">
              {activities.length === 0 && !isLoading ? (
                <p className="rounded-xl bg-[#f8f9ff] p-4 text-[13px] font-medium text-[#727785]">
                  No recent activity returned.
                </p>
              ) : null}
              {activities.map((activity, i) => (
                <motion.div
                  key={i}
                  className="flex gap-3.5 items-start group cursor-pointer p-2 rounded-xl hover:bg-[#f8f9ff] transition-colors"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div
                    className={cn("p-2.5 rounded-xl shrink-0", activity.bg, activity.color)}
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <activity.icon size={16} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#121c2a] leading-snug group-hover:text-[#0058be] transition-colors truncate">
                      {activity.text}
                    </p>
                    <span className="text-[11px] text-[#727785] font-medium">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c2c6d6]/30">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#727785] font-medium">Audit logging enabled</span>
              <motion.span
                className="font-bold text-[#0058be]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                Real-time
              </motion.span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
