export interface NotificationRecord {
  id: string
  title: string
  content: string
  type?: string | null
  isRead?: boolean
  readAt?: string | null
  createdAt: string
  updatedAt?: string
}

export interface PaginatedNotifications {
  data?: NotificationRecord[] | PaginatedNotifications
  items?: NotificationRecord[]
  notifications?: NotificationRecord[]
  rows?: NotificationRecord[]
  records?: NotificationRecord[]
  result?: NotificationRecord[] | PaginatedNotifications
  results?: NotificationRecord[] | PaginatedNotifications
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}
