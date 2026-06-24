"use client"

import { StatCard } from "@/features/dashboard/components/stat-card"
import { Users, User as UserIcon, FileText, Clock, AlertCircle, TrendingUp, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const DATA_7D = {
  stats: [
    { title: "Total Students", value: "1,284", description: "Active students", trend: { value: 12, isUp: true } },
    { title: "Documents", value: "8,542", description: "Academic resources", trend: { value: 8, isUp: true } },
    { title: "Pending", value: "43", description: "Awaiting review" },
    { title: "Storage", value: "78%", description: "Capacity used" },
  ],
  chart: [40, 70, 45, 90, 65, 80, 50],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}

const DATA_30D = {
  stats: [
    { title: "Total Students", value: "4,102", description: "Monthly active", trend: { value: 24, isUp: true } },
    { title: "Documents", value: "24,192", description: "Total resources", trend: { value: 15, isUp: true } },
    { title: "Pending", value: "156", description: "Monthly queue" },
    { title: "Storage", value: "82%", description: "Growth trend" },
  ],
  chart: [30, 45, 55, 40, 60, 75, 85, 70, 90, 100, 80, 70, 65, 55, 50, 60, 75, 80, 95, 100, 85, 75, 60, 50, 45, 55, 70, 85, 90, 95],
  labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`)
}

export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const currentData = timeRange === '7d' ? DATA_7D : DATA_30D

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
            onClick={() => setTimeRange('7d')}
            className={cn(
              "px-5 py-2 rounded-xl text-[14px] font-bold transition-all",
              timeRange === '7d' ? "bg-white shadow-sm text-on-surface" : "hover:bg-white/50 text-on-surface-variant"
            )}
          >
            Past 7 days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={cn(
              "px-5 py-2 rounded-xl text-[14px] font-bold transition-all",
              timeRange === '30d' ? "bg-white shadow-sm text-on-surface" : "hover:bg-white/50 text-on-surface-variant"
            )}
          >
            Past 30 days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={currentData.stats[0].title}
          value={currentData.stats[0].value}
          icon={Users}
          description={currentData.stats[0].description}
          href="/users"
          trend={currentData.stats[0].trend}
        />
        <StatCard
          title={currentData.stats[1].title}
          value={currentData.stats[1].value}
          icon={FileText}
          description={currentData.stats[1].description}
          href="/documents"
          trend={currentData.stats[1].trend}
        />
        <StatCard
          title={currentData.stats[2].title}
          value={currentData.stats[2].value}
          icon={Clock}
          description={currentData.stats[2].description}
          href="/documents?status=pending"
        />
        <StatCard
          title={currentData.stats[3].title}
          value={currentData.stats[3].value}
          icon={AlertCircle}
          description={currentData.stats[3].description}
          href="/settings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-on-surface">System Performance</h2>
            <div className="flex items-center gap-2 text-primary font-medium text-[14px]">
              <TrendingUp size={16} />
              <span>{timeRange === '7d' ? 'Weekly' : 'Monthly'} growth trend</span>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-end gap-1.5 px-4">
            {currentData.chart.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary transition-all cursor-pointer relative group"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {currentData.labels[i]}: {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[12px] text-on-surface-variant px-2 font-bold">
            <span>{currentData.labels[0]}</span>
            <span>{currentData.labels[Math.floor(currentData.labels.length / 2)]}</span>
            <span>{currentData.labels[currentData.labels.length - 1]}</span>
          </div>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
            <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { text: "New user registered: Nguyen Van A", time: "2m ago", icon: UserIcon, color: "text-blue-600", bg: "bg-blue-50" },
              { text: "Document 'ML_Paper.pdf' approved", time: "15m ago", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
              { text: "Subject 'C#' added to catalog", time: "1h ago", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
              { text: "System limits updated by Admin", time: "3h ago", icon: Settings, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start group cursor-pointer">
                <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110", activity.bg, activity.color)}>
                  <activity.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{activity.text}</p>
                  <span className="text-[12px] text-on-surface-variant font-medium">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
