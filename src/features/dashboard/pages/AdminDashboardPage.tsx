"use client"

import { StatCard } from "@/features/dashboard/components/stat-card"
import { getAdminStats, getDocumentStats } from "@/lib/services/admin-stats-service"
import type { ActivityIconKey, AdminStatsRange } from "@/lib/mocks/admin-stats"
import { Users, User as UserIcon, FileText, Clock, AlertCircle, TrendingUp, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const activityIcons: Record<ActivityIconKey, typeof UserIcon> = {
  user: UserIcon,
  file: FileText,
  book: BookOpen,
  settings: Settings,
}

export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<AdminStatsRange>("7d")
  const adminStats = getAdminStats()
  const documentStats = getDocumentStats(timeRange)
  const currentStats = adminStats.ranges[timeRange]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-3">Admin Overview</h1>
          <p className="text-[17px] text-on-surface-variant max-w-2xl font-medium">
            Monitor and manage the FPT Documentation system's core metrics and user activity.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 p-1.5 bg-surface-container-highest rounded-2xl border border-outline-variant/30">
          <button 
            onClick={() => setTimeRange("7d")}
            className={cn(
              "px-5 py-2 rounded-xl text-[14px] font-bold transition-all",
              timeRange === "7d" ? "bg-white shadow-sm text-on-surface" : "hover:bg-white/50 text-on-surface-variant"
            )}
          >
            Past 7 days
          </button>
          <button 
            onClick={() => setTimeRange("30d")}
            className={cn(
              "px-5 py-2 rounded-xl text-[14px] font-bold transition-all",
              timeRange === "30d" ? "bg-white shadow-sm text-on-surface" : "hover:bg-white/50 text-on-surface-variant"
            )}
          >
            Past 30 days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={currentStats[0].title}
          value={currentStats[0].value}
          icon={Users}
          description={currentStats[0].description}
          href="/users"
          trend={currentStats[0].trend}
        />
        <StatCard
          title={currentStats[1].title}
          value={currentStats[1].value}
          icon={FileText}
          description={currentStats[1].description}
          href="/documents"
          trend={currentStats[1].trend}
        />
        <StatCard
          title={currentStats[2].title}
          value={currentStats[2].value}
          icon={Clock}
          description={currentStats[2].description}
          href="/documents?status=pending"
        />
        <StatCard
          title={currentStats[3].title}
          value={currentStats[3].value}
          icon={AlertCircle}
          description={currentStats[3].description}
          href="/settings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-on-surface">System Performance</h2>
            <div className="flex items-center gap-2 text-primary font-medium text-[14px]">
              <TrendingUp size={16} />
              <span>{timeRange === "7d" ? "Weekly" : "Monthly"} growth trend</span>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-end gap-1.5 px-4">
            {documentStats.chart.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary transition-all cursor-pointer relative group"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {documentStats.labels[i]}: {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[12px] text-on-surface-variant px-2 font-bold">
            <span>{documentStats.labels[0]}</span>
            <span>{documentStats.labels[Math.floor(documentStats.labels.length / 2)]}</span>
            <span>{documentStats.labels[documentStats.labels.length - 1]}</span>
          </div>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
            <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {adminStats.recentActivities.map((activity) => {
              const ActivityIcon = activityIcons[activity.iconKey]

              return (
                <div key={`${activity.time}-${activity.text}`} className="flex gap-4 items-start group cursor-pointer">
                  <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110", activity.bg, activity.color)}>
                    <ActivityIcon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{activity.text}</p>
                    <span className="text-[12px] text-on-surface-variant font-medium">{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
