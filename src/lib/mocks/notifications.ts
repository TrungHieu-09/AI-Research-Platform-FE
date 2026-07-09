export type NotificationType = "DOCUMENT" | "PAYMENT" | "SYSTEM"

export interface MockNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
}

export const initialNotifications: MockNotification[] = [
  {
    id: "notif-doc-approved-001",
    type: "DOCUMENT",
    title: "Document approved",
    message: "Your public document ML_Paper.pdf has been approved.",
    createdAt: "2026-07-08T09:15:00.000Z",
    read: false,
  },
  {
    id: "notif-payment-pending-001",
    type: "PAYMENT",
    title: "Payment pending",
    message: "Your Storage Pro upgrade is waiting for bank transfer confirmation.",
    createdAt: "2026-07-08T11:40:00.000Z",
    read: false,
  },
  {
    id: "notif-system-001",
    type: "SYSTEM",
    title: "System limits updated",
    message: "Monthly AI query limits were refreshed for the current billing cycle.",
    createdAt: "2026-07-07T16:20:00.000Z",
    read: true,
  },
]
