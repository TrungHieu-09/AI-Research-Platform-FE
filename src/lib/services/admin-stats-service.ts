import {
  adminRecentActivities,
  adminStatsByRange,
  documentStatsByRange,
  type AdminRecentActivity,
  type AdminStatCard,
  type AdminStatsRange,
  type DocumentStats,
} from "@/lib/mocks/admin-stats"

export interface AdminStatsResponse {
  ranges: Record<AdminStatsRange, AdminStatCard[]>
  recentActivities: AdminRecentActivity[]
}

export function getAdminStats(): AdminStatsResponse {
  return {
    ranges: {
      "7d": adminStatsByRange["7d"].map((stat) => ({ ...stat })),
      "30d": adminStatsByRange["30d"].map((stat) => ({ ...stat })),
    },
    recentActivities: adminRecentActivities.map((activity) => ({ ...activity })),
  }
}

export function getDocumentStats(range: AdminStatsRange): DocumentStats {
  const stats = documentStatsByRange[range]

  return {
    chart: [...stats.chart],
    labels: [...stats.labels],
  }
}
