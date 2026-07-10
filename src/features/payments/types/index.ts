export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED"

export interface PaymentReceipt {
  id: string
  userId?: string
  planId: string
  amount: number | string
  transferContent: string
  status: PaymentStatus
  createdAt: string
  verifiedAt?: string | null
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  qrCodeUrl?: string
  qrUrl?: string
}

export interface PaginatedPaymentReceipts {
  data?: PaymentReceipt[]
  receipts?: PaymentReceipt[]
  items?: PaymentReceipt[]
  total?: number
}

export interface CheckoutReceiptResponse {
  receipt?: PaymentReceipt
  payment?: PaymentReceipt
  data?: PaymentReceipt
  id?: string
  planId?: string
  amount?: number | string
  transferContent?: string
  status?: PaymentStatus
  createdAt?: string
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  qrCodeUrl?: string
  qrUrl?: string
}
