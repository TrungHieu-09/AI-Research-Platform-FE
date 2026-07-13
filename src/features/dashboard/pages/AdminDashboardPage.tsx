"use client"

import * as React from "react"
import { StatCard } from "@/features/dashboard/components/stat-card"
import { Users, User as UserIcon, FileText, Clock, AlertCircle, TrendingUp, BookOpen, Settings, Loader2, RefreshCw, Sparkles, Eye, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useAuth } from "@/features/auth/auth-context"
import Link from "next/link"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
}

export function AdminDashboardPage() {
  const { token } = useAuth()
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  
  const [statsData, setStatsData] = useState<{
    totalUsers: number
    totalDocuments: number
    pendingModeration: number
    totalViews: number
    aiUsageToday: number
    newUsersThisWeek: number
    topDocuments: any[]
  }>({
    totalUsers: 0,
    totalDocuments: 0,
    pendingModeration: 0,
    totalViews: 0,
    aiUsageToday: 0,
    newUsersThisWeek: 0,
    topDocuments: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStatsData({
          totalUsers: data.totalUsers ?? 0,
          totalDocuments: data.totalDocuments ?? 0,
          pendingModeration: data.pendingModeration ?? 0,
          totalViews: data.totalViews ?? 0,
          aiUsageToday: data.aiUsageToday ?? 0,
          newUsersThisWeek: data.newUsersThisWeek ?? 0,
          topDocuments: Array.isArray(data.topDocuments) ? data.topDocuments : [],
        })
      } else {
        const err = await res.json()
        setError(err.error || "Không thể lấy dữ liệu thống kê từ hệ thống.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ quản trị.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const chartBars = timeRange === '7d' 
    ? [45, 60, 52, 78, 65, 85, Math.min(100, Math.max(40, statsData.aiUsageToday || 60))]
    : [30, 45, 55, 40, 60, 75, 85, 70, 90, 80, 70, 65, 55, 50, 60, 75, 80, 85, 90, 95, 85, 75, 60, 50, 65, 75, 85, 90, 95, Math.min(100, Math.max(40, statsData.aiUsageToday || 70))]

  const chartLabels = timeRange === '7d'
    ? ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Hôm nay"]
    : Array.from({ length: 30 }, (_, i) => `D${i + 1}`)

  return (
    <div className="space-y-8">
      {/* Top Title Bar */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial="hidden" animate="visible" variants={fadeUp}
      >
        <div>
          <div className="flex items-center gap-2">
            <motion.h1
              className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
              style={{ fontFamily: "Geist, sans-serif" }}
              variants={fadeUp} custom={0}
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
            Giám sát thời gian thực số liệu người dùng, tài liệu kiểm duyệt, lượng truy vấn AI và mức độ tương tác học thuật.
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
              {t === '7d' ? '7 ngày qua' : '30 ngày qua'}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 font-medium text-[14px]">
          ⚠️ {error}
        </div>
      ) : null}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Tổng Sinh viên / Người dùng" 
          value={loading ? "..." : statsData.totalUsers.toLocaleString()} 
          icon={Users}
          description={`+${statsData.newUsersThisWeek} người mới tuần này`} 
          href="/admin/users" 
          trend={{ value: 12, isUp: true }} 
          index={0} 
        />
        <StatCard 
          title="Tài liệu Học thuật" 
          value={loading ? "..." : statsData.totalDocuments.toLocaleString()} 
          icon={FileText}
          description={`${statsData.totalViews.toLocaleString()} lượt xem toàn sàn`} 
          href="/admin/documents" 
          trend={{ value: 18, isUp: true }} 
          index={1} 
        />
        <StatCard 
          title="Chờ Kiểm duyệt" 
          value={loading ? "..." : statsData.pendingModeration.toString()} 
          icon={Clock}
          description="Tài liệu công khai chờ duyệt" 
          href="/admin/documents?status=PENDING" 
          index={2} 
        />
        <StatCard 
          title="Truy vấn AI Hôm nay" 
          value={loading ? "..." : statsData.aiUsageToday.toLocaleString()} 
          icon={Sparkles}
          description="Lượt tương tác Gemini AI" 
          href="/admin/settings" 
          trend={{ value: 25, isUp: true }}
          index={3} 
        />
      </div>

      {/* Chart & Top Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* System Performance / AI Usage Chart Card */}
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
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">ANALYTICS & AI LOAD</p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Lưu lượng Tương tác & Trợ lý AI
                </h2>
              </div>
              <motion.div
                className="flex items-center gap-2 text-[#0058be] font-bold text-[13px] bg-[#eff4ff] px-3 py-1 rounded-full"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp size={15} />
                <span>Tăng trưởng {timeRange === '7d' ? 'Tuần' : 'Tháng'}</span>
              </motion.div>
            </div>

            <div className="h-[280px] w-full flex items-end gap-2 pt-6 px-2">
              <AnimatePresence mode="wait">
                {chartBars.map((h, i) => (
                  <motion.div
                    key={`${timeRange}-${i}`}
                    className="flex-1 bg-gradient-to-t from-[#0058be]/20 to-[#0058be]/80 hover:from-[#0058be] hover:to-[#2170e4] rounded-t-xl cursor-pointer relative group"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    style={{ originY: 1, height: `${h}%` } as React.CSSProperties}
                    whileHover={{ filter: "brightness(1.15)" }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#121c2a] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                      {chartLabels[i]}: {h}%
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-between mt-5 pt-4 border-t border-[#c2c6d6]/30 text-[11px] text-[#727785] font-bold uppercase tracking-wider px-1">
            <span>{chartLabels[0]}</span>
            <span>{chartLabels[Math.floor(chartLabels.length / 2)]}</span>
            <span>{chartLabels[chartLabels.length - 1]}</span>
          </div>
        </motion.div>

        {/* Top Documents List Card */}
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
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">TOP ACADEMIC</p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Tài liệu Phổ biến
                </h2>
              </div>
              <Link
                href="/admin/documents"
                className="text-[12px] font-bold text-[#0058be] hover:underline"
              >
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
                      <Link href={`/user/documents/${doc.id}`} className="text-[13px] font-bold text-[#121c2a] leading-snug hover:text-[#0058be] transition-colors truncate block">
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-[#727785] font-medium mt-0.5">
                        <span className="truncate">{doc.subject || "Nghiên cứu chung"}</span>
                        <span className="flex items-center gap-1 text-[#0058be] font-bold shrink-0">
                          <Eye size={12} /> {doc.viewsCount || 0}
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
              <span className="text-[#727785] font-medium">Lập chỉ mục tự động</span>
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
