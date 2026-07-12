import { apiFetch } from "@/lib/api/client"

import type { NotificationRecord, PaginatedNotifications } from "../types"

export interface GetNotificationsQuery {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

const NOTIFICATION_ENDPOINTS = {
  list: "/api/notifications",
} as const

function buildQueryString(query: GetNotificationsQuery = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

function isNotificationLike(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("id" in value || "title" in value || "content" in value),
  )
}

function findNotificationArray(value: unknown): NotificationRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isNotificationLike) as NotificationRecord[]
  }

  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  const knownKeys = ["notifications", "items", "data", "rows", "records", "result", "results"]

  for (const key of knownKeys) {
    const found = findNotificationArray(record[key])
    if (found.length > 0) return found
  }

  for (const nestedValue of Object.values(record)) {
    const found = findNotificationArray(nestedValue)
    if (found.length > 0) return found
  }

  return []
}

export function getNotificationItems(
  response: NotificationRecord[] | PaginatedNotifications,
): NotificationRecord[] {
  if (Array.isArray(response)) return response
  if (Array.isArray(response.data)) return response.data
  if (response.data) return getNotificationItems(response.data)
  if (Array.isArray(response.result)) return response.result
  if (response.result) return getNotificationItems(response.result)
  if (Array.isArray(response.results)) return response.results
  if (response.results) return getNotificationItems(response.results)

  return (
    response.notifications ??
    response.items ??
    response.rows ??
    response.records ??
    findNotificationArray(response)
  )
}

export function getNotifications(query?: GetNotificationsQuery) {
  return apiFetch<NotificationRecord[] | PaginatedNotifications>(
    `${NOTIFICATION_ENDPOINTS.list}${buildQueryString(query)}`,
  )
}
