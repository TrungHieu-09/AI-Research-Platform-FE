export type PaymentPlanId = "storage" | "ai" | "ultimate"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED"
export type PaymentWebhookStatus = "SUCCESS" | "COMPLETED" | "FAILED" | "CANCELLED" | "PENDING"

export interface PaymentPlan {
  id: PaymentPlanId
  name: string
  price: string
  amount: number
  currency: "VND"
  billingCycle: "month"
  features: string[]
}

export interface BankTransferInfo {
  providerLabel: string
  bankName: string
  accountNumber: string
  accountHolder: string
  qrLabel: string
  transferContent: string
}

export interface PaymentReceipt {
  id: string
  planId: PaymentPlanId
  planName: string
  amount: number
  displayAmount: string
  currency: "VND"
  status: PaymentStatus
  transferContent: string
  createdAt: string
}

export interface PaymentCheckout {
  receipt: PaymentReceipt
  plan: PaymentPlan
  bankTransfer: BankTransferInfo
  taxAmount: number
  totalAmount: number
  displaySubtotal: string
  displayTax: string
  displayTotal: string
}

export interface PaymentWebhookPayload {
  transferContent: string
  amount: number
  status: PaymentWebhookStatus
}

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  storage: {
    id: "storage",
    name: "Storage Pro",
    price: "125.000",
    amount: 125000,
    currency: "VND",
    billingCycle: "month",
    features: ["100 GB Cloud Storage", "500 AI Queries / month", "Priority Support"],
  },
  ai: {
    id: "ai",
    name: "AI Pro",
    price: "250.000",
    amount: 250000,
    currency: "VND",
    billingCycle: "month",
    features: ["Unlimited AI Queries", "Advanced Models (GPT-4)", "5 GB Cloud Storage"],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    price: "300.000",
    amount: 300000,
    currency: "VND",
    billingCycle: "month",
    features: ["Unlimited AI Queries & Models", "100 GB Cloud Storage", "24/7 Dedicated Support"],
  },
}

export const baseBankTransferInfo = {
  providerLabel: "VietQR / Momo",
  bankName: "Vietcombank (VCB)",
  accountNumber: "1023 4567 890",
  accountHolder: "LUMIS RESEARCH PLATFORM",
  qrLabel: "Scan to pay",
} as const

export const initialPaymentReceipts: PaymentReceipt[] = [
  {
    id: "rcpt-lumis-ai-001",
    planId: "ai",
    planName: "AI Pro",
    amount: 250000,
    displayAmount: "250.000 VND",
    currency: "VND",
    status: "PAID",
    transferContent: "PAY LUMIS AI",
    createdAt: "2026-06-24T09:30:00.000Z",
  },
  {
    id: "rcpt-lumis-storage-001",
    planId: "storage",
    planName: "Storage Pro",
    amount: 125000,
    displayAmount: "125.000 VND",
    currency: "VND",
    status: "PENDING",
    transferContent: "PAY LUMIS STORAGE",
    createdAt: "2026-07-01T14:05:00.000Z",
  },
]
