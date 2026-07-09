import { initialNotifications, type MockNotification } from "@/lib/mocks/notifications"

let notifications = initialNotifications.map((notification) => ({ ...notification }))

export interface NotificationsResponse {
  unreadCount: number
  items: MockNotification[]
}

export function getNotifications(): NotificationsResponse {
  return createNotificationsResponse(notifications)
}

export function markAllNotificationsRead(): NotificationsResponse {
  notifications = notifications.map((notification) => ({
    ...notification,
    read: true,
  }))

  return createNotificationsResponse(notifications)
}

export function markNotificationRead(id: string): MockNotification | null {
  const notificationIndex = notifications.findIndex((notification) => notification.id === id)

  if (notificationIndex === -1) {
    return null
  }

  const updatedNotification: MockNotification = {
    ...notifications[notificationIndex],
    read: true,
  }

  notifications = notifications.map((notification, index) =>
    index === notificationIndex ? updatedNotification : notification
  )

  return { ...updatedNotification }
}

function createNotificationsResponse(items: MockNotification[]): NotificationsResponse {
  return {
    unreadCount: items.filter((notification) => !notification.read).length,
    items: items.map((notification) => ({ ...notification })),
  }
}
