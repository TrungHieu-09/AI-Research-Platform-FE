import { StatCard } from "@/components/admin/stat-card"
import { Users, FileText, Clock, AlertCircle, TrendingUp } from "lucide-react"

export default function DashboardPage() {
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
          <button className="px-5 py-2 bg-white shadow-sm rounded-xl text-[14px] font-bold text-on-surface transition-all">Past 7 days</button>
          <button className="px-5 py-2 hover:bg-white/50 rounded-xl text-[14px] font-bold text-on-surface-variant transition-all">Past 30 days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value="1,284"
          icon={Users}
          description="Active students"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="Documents"
          value="8,542"
          icon={FileText}
          description="Academic resources"
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title="Pending"
          value="43"
          icon={Clock}
          description="Awaiting review"
        />
        <StatCard
          title="Storage"
          value="78%"
          icon={AlertCircle}
          description="Capacity used"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-on-surface">System Performance</h2>
            <div className="flex items-center gap-2 text-primary font-medium text-[14px]">
              <TrendingUp size={16} />
              <span>Normal behavior</span>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-end gap-3 px-4">
            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 75, 55, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary transition-all cursor-pointer relative group"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Week {i + 1}: {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[12px] text-on-surface-variant px-2">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-xl font-semibold text-on-surface mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { text: "New user registered: Nguyen Van A", time: "2m ago", type: "user" },
              { text: "Document 'CS50_Week1.pdf' approved", time: "15m ago", type: "doc" },
              { text: "Subject 'AI Ethics' added to catalog", time: "1h ago", type: "subject" },
              { text: "System limits updated by Admin", time: "3h ago", type: "settings" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-on-surface leading-tight">{activity.text}</p>
                  <span className="text-[12px] text-on-surface-variant">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
