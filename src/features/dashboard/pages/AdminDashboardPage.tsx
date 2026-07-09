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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Admin Overview
          </h1>
          <p className="text-[14px] text-[#424754] max-w-2xl">
            Monitor and manage the Lumis platform's core metrics, document moderation, and user activity.
          </p>
        </div>

        {/* Time Range Filter Pill */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#c2c6d6]/40 shadow-sm w-fit">
          <button
            onClick={() => setTimeRange('7d')}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all",
              timeRange === '7d'
                ? "bg-[#0058be] text-white shadow-sm"
                : "hover:bg-[#f8f9ff] text-[#424754]"
            )}
          >
            Past 7 days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all",
              timeRange === '30d'
                ? "bg-[#0058be] text-white shadow-sm"
                : "hover:bg-[#f8f9ff] text-[#424754]"
            )}
          >
            Past 30 days
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Performance Chart Card */}
        <div className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">
                  ANALYTICS
                </p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  System Performance
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[#0058be] font-bold text-[13px] bg-[#eff4ff] px-3 py-1 rounded-full">
                <TrendingUp size={15} />
                <span>{timeRange === '7d' ? 'Weekly' : 'Monthly'} Growth</span>
              </div>
            </div>

            <div className="h-[280px] w-full flex items-end gap-2 pt-6 px-2">
              {currentData.chart.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#0058be]/20 to-[#0058be]/70 hover:from-[#0058be] hover:to-[#2170e4] rounded-t-xl transition-all cursor-pointer relative group"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#121c2a] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                    {currentData.labels[i]}: {h}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-5 pt-4 border-t border-[#c2c6d6]/30 text-[11px] text-[#727785] font-bold uppercase tracking-wider px-1">
            <span>{currentData.labels[0]}</span>
            <span>{currentData.labels[Math.floor(currentData.labels.length / 2)]}</span>
            <span>{currentData.labels[currentData.labels.length - 1]}</span>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white border border-[#c2c6d6]/40 p-7 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-0.5">
                  LOGS
                </p>
                <h2 className="text-lg font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Recent Activity
                </h2>
              </div>
              <button className="text-[12px] font-bold text-[#0058be] hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-5">
              {[
                { text: "New researcher registered: Nguyen Van A", time: "2m ago", icon: UserIcon, color: "text-[#0058be]", bg: "bg-[#eff4ff]" },
                { text: "Document 'ML_Paper.pdf' approved", time: "15m ago", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
                { text: "Subject 'Neuroscience' added to catalog", time: "1h ago", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
                { text: "System AI cache limits updated", time: "3h ago", icon: Settings, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3.5 items-start group cursor-pointer p-2 rounded-xl hover:bg-[#f8f9ff] transition-colors">
                  <div className={cn("p-2.5 rounded-xl transition-all group-hover:scale-105 shrink-0", activity.bg, activity.color)}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#121c2a] leading-snug group-hover:text-[#0058be] transition-colors truncate">
                      {activity.text}
                    </p>
                    <span className="text-[11px] text-[#727785] font-medium">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c2c6d6]/30">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#727785] font-medium">Audit logging enabled</span>
              <span className="font-bold text-[#0058be]">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

