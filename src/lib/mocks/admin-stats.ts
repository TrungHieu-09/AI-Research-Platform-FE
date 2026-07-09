export type AdminStatsRange = "7d" | "30d"

export interface AdminStatTrend {
  value: number
  isUp: boolean
}

export interface AdminStatCard {
  title: string
  value: string
  description: string
  trend?: AdminStatTrend
}

export interface DocumentStats {
  chart: number[]
  labels: string[]
}

export type ActivityIconKey = "user" | "file" | "book" | "settings"

export interface AdminRecentActivity {
  text: string
  time: string
  iconKey: ActivityIconKey
  color: string
  bg: string
}

export const adminStatsByRange: Record<AdminStatsRange, AdminStatCard[]> = {
  "7d": [
    { title: "Total Students", value: "1,284", description: "Active students", trend: { value: 12, isUp: true } },
    { title: "Documents", value: "8,542", description: "Academic resources", trend: { value: 8, isUp: true } },
    { title: "Pending", value: "43", description: "Awaiting review" },
    { title: "Storage", value: "78%", description: "Capacity used" },
  ],
  "30d": [
    { title: "Total Students", value: "4,102", description: "Monthly active", trend: { value: 24, isUp: true } },
    { title: "Documents", value: "24,192", description: "Total resources", trend: { value: 15, isUp: true } },
    { title: "Pending", value: "156", description: "Monthly queue" },
    { title: "Storage", value: "82%", description: "Growth trend" },
  ],
}

export const documentStatsByRange: Record<AdminStatsRange, DocumentStats> = {
  "7d": {
    chart: [40, 70, 45, 90, 65, 80, 50],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  "30d": {
    chart: [30, 45, 55, 40, 60, 75, 85, 70, 90, 100, 80, 70, 65, 55, 50, 60, 75, 80, 95, 100, 85, 75, 60, 50, 45, 55, 70, 85, 90, 95],
    labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
  },
}

export const adminRecentActivities: AdminRecentActivity[] = [
  { text: "New user registered: Nguyen Van A", time: "2m ago", iconKey: "user", color: "text-blue-600", bg: "bg-blue-50" },
  { text: "Document 'ML_Paper.pdf' approved", time: "15m ago", iconKey: "file", color: "text-green-600", bg: "bg-green-50" },
  { text: "Subject 'C#' added to catalog", time: "1h ago", iconKey: "book", color: "text-purple-600", bg: "bg-purple-50" },
  { text: "System limits updated by Admin", time: "3h ago", iconKey: "settings", color: "text-amber-600", bg: "bg-amber-50" },
]
