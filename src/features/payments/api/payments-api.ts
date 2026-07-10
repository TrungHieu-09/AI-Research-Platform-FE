import { apiFetch } from "@/lib/api/client"

import type {
  CheckoutReceiptResponse,
  PaginatedPaymentReceipts,
  PaymentReceipt,
} from "../types"

export interface CreateCheckoutRequest {
  planId: string
  referenceCode?: string
}

const PAYMENT_ENDPOINTS = {
  checkout: "/api/payments/checkout",
  receipts: "/api/payments/receipts",
} as const

export function getReceiptItems(response: PaymentReceipt[] | PaginatedPaymentReceipts) {
  if (Array.isArray(response)) return response
  return response.data ?? response.receipts ?? response.items ?? []
}

export function normalizeCheckoutReceipt(response: CheckoutReceiptResponse) {
  return response.receipt ?? response.payment ?? response.data ?? response
}

export async function createPaymentCheckout(payload: CreateCheckoutRequest) {
  const response = await apiFetch<CheckoutReceiptResponse>(PAYMENT_ENDPOINTS.checkout, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return normalizeCheckoutReceipt(response) as PaymentReceipt
}

export function getPaymentReceipts() {
  return apiFetch<PaymentReceipt[] | PaginatedPaymentReceipts>(
    PAYMENT_ENDPOINTS.receipts,
  )
}
