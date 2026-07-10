"use client"

import { StatCard } from "@/features/dashboard/components/stat-card"
import { Users, User as UserIcon, FileText, Clock, AlertCircle, TrendingUp, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"

/* ─── Data ───────────────────────────────────── */
const DATA_7D = {
  stats: [
    { title: "Total Students", value: "1,284", description: "Active students", trend: { value: 12, isUp: true } },
    { title: "Documents", value: "8,542", description: "Academic resources", trend: { value: 8, isUp: true } },
    { title: "Pending", value: "43", description: "Awaiting review" },
    { title: "Storage", value: "78%", description: "Capacity used" },
  ],
  chart: [40, 70, 45, 90, 65, 80, 50],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}

const DATA_30D = {
  stats: [
    { title: "Total Students", value: "4,102", description: "Monthly active", trend: { value: 24, isUp: true } },
    { title: "Documents", value: "24,192", description: "Total resources", trend: { value: 15, isUp: true } },
    { title: "Pending", value: "156", description: "Monthly queue" },
    { title: "Storage", value: "82%", description: "Growth trend" },
  ],
  chart: [30, 45, 55, 40, 60, 75, 85, 70, 90, 100, 80, 70, 65, 55, 50, 60, 75, 80, 95, 100, 85, 75, 60, 50, 45, 55, 70, 85, 90, 95],
  labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
}

/* ─── Animation Variants ─────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

/* ─── Activity Log ───────────────────────────── */
const activities = [
  { text: "New researcher registered: Nguyen Van A", time: "2m ago", icon: UserIcon, color: "text-[#0058be]", bg: "bg-[#eff4ff]" },
  { text: "Document 'ML_Paper.pdf' approved", time: "15m ago", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
  { text: "Subject 'Neuroscience' added to catalog", time: "1h ago", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
  { text: "System AI cache limits updated", time: "3h ago", icon: Settings, color: "text-orange-600", bg: "bg-orange-50" },
]

/* ─── Chart Bar ──────────────────────────────── */
function ChartBar({ height, label, value, index }: { height: number; label: string; value: number; index: number }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 group relative">
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#121c2a] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-50 pointer-events-none scale-90 group-hover:scale-100">
        {label}: {value}%
      </div>
      {/* Bar wrapper */}
      <div className="w-full flex-1 flex items-end">
        <motion.div
          className="w-full rounded-t-xl bg-gradient-to-t from-[#0058be]/25 to-[#2170e4]/75 group-hover:from-[#0058be] group-hover:to-[#2170e4] transition-colors duration-300 cursor-pointer"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: 0.45 + index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────── */
export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d")
  const currentData = timeRange === "7d" ? DATA_7D : DATA_30D

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
            variants={fadeUp}
            custom={0}
          >
            Admin Overview
          </motion.h1>
          <motion.p className="text-[14px] text-[#424754] max-w-2xl" variants={fadeUp} custom={1}>
            Monitor and manage the Lumis platform's core metrics, document moderation, and user activity.
          </motion.p>
        </div>

        {/* Time Range Toggle */}
        <motion.div
          className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#c2c6d6]/40 shadow-sm w-fit"
          variants={fadeUp}
          custom={2}
        >
          {(["7d", "30d"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={cn(
                "relative px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors duration-200",
                timeRange === t ? "text-white" : "text-[#424754] hover:text-[#0058be]"
              )}
            >
              {timeRange === t && (
                <motion.span
                  layoutId="time-pill"
                  className="absolute inset-0 bg-[#0058be] rounded-xl shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Past {t === "7d" ? "7" : "30"} days</span>
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title={currentData.stats[0].title} value={currentData.stats[0].value} icon={Users}
          description={currentData.stats[0].description} href="/admin/users" trend={currentData.stats[0].trend} index={0} />
        <StatCard title={currentData.stats[1].title} value={currentData.stats[1].value} icon={FileText}
          description={currentData.stats[1].description} href="/admin/documents" trend={currentData.stats[1].trend} index={1} />
        <StatCard title={currentData.stats[2].title} value={currentData.stats[2].value} icon={Clock}
          description={currentData.stats[2].description} href="/admin/documents?status=pending" index={2} />
        <StatCard title={currentData.stats[3].title} value={currentData.stats[3].value} icon={AlertCircle}
          description={currentData.stats[3].description} href="/admin/settings" index={3} />
      </div>

      {/* ── Chart + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* System Performance Chart */}
        <motion.div
          className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0,88,190,0.09)" }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">ANALYTICS</p>
              <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                System Performance
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[#0058be] font-bold text-[13px] bg-[#eff4ff] px-3 py-1.5 rounded-full">
              <motion.span
                animate={{ rotate: [0, 15, 0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                className="flex"
              >
                <TrendingUp size={15} />
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={timeRange}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {timeRange === "7d" ? "Weekly" : "Monthly"} Growth
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Bars */}
          <AnimatePresence mode="wait">
            <motion.div
              key={timeRange}
              className="h-[260px] w-full flex items-end gap-[3px] px-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentData.chart.map((h, i) => (
                <ChartBar key={i} height={h} label={currentData.labels[i]} value={h} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* X-axis labels */}
          <div className="flex justify-between mt-4 pt-4 border-t border-[#c2c6d6]/30 text-[11px] text-[#727785] font-bold uppercase tracking-wider px-1">
            <span>{currentData.labels[0]}</span>
            <span>{currentData.labels[Math.floor(currentData.labels.length / 2)]}</span>
            <span>{currentData.labels[currentData.labels.length - 1]}</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0,88,190,0.09)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">LOGS</p>
              <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Recent Activity
              </h2>
            </div>
            <motion.button
              className="text-[12px] font-bold text-[#0058be]"
              whileHover={{ scale: 1.05, textDecoration: "underline" }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>

          {/* Activity list */}
          <div className="space-y-1 flex-1">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                className="flex gap-3 items-start cursor-pointer p-2.5 rounded-xl hover:bg-[#f8f9ff] transition-colors group"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.09, duration: 0.35 }}
                whileHover={{ x: 3 }}
              >
                <motion.div
                  className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", activity.bg, activity.color)}
                  whileHover={{ scale: 1.18, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <activity.icon size={15} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#121c2a] leading-snug group-hover:text-[#0058be] transition-colors line-clamp-2">
                    {activity.text}
                  </p>
                  <span className="text-[11px] text-[#727785] font-medium mt-0.5 block">{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-[#c2c6d6]/30">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#727785] font-medium">Audit logging enabled</span>
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="w-2 h-2 rounded-full bg-green-500 inline-block"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="font-bold text-green-600">Real-time</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
