import {
  baseBankTransferInfo,
  initialPaymentReceipts,
  paymentPlans,
  type BankTransferInfo,
  type PaymentCheckout,
  type PaymentPlan,
  type PaymentPlanId,
  type PaymentReceipt,
  type PaymentWebhookPayload,
} from "@/lib/mocks/payments"

const paymentPlanIds = Object.keys(paymentPlans) as PaymentPlanId[]
let paymentReceipts = initialPaymentReceipts.map((receipt) => ({ ...receipt }))

export function isPaymentPlanId(planId: string | null): planId is PaymentPlanId {
  return planId !== null && paymentPlanIds.includes(planId as PaymentPlanId)
}

export function checkoutPayment(planId: PaymentPlanId): PaymentCheckout {
  const plan = paymentPlans[planId]
  const transferContent = `PAY LUMIS ${plan.id.toUpperCase()}`
  const receipt: PaymentReceipt = {
    id: `rcpt-lumis-${plan.id}-${Date.now()}`,
    planId: plan.id,
    planName: plan.name,
    amount: plan.amount,
    displayAmount: formatVnd(plan.amount),
    currency: plan.currency,
    status: "PENDING",
    transferContent,
    createdAt: new Date().toISOString(),
  }

  paymentReceipts = [receipt, ...paymentReceipts]

  return {
    receipt,
    plan: clonePlan(plan),
    bankTransfer: createBankTransferInfo(transferContent),
    taxAmount: 0,
    totalAmount: plan.amount,
    displaySubtotal: formatVnd(plan.amount),
    displayTax: formatVnd(0),
    displayTotal: formatVnd(plan.amount),
  }
}

export function getPaymentReceipts(): PaymentReceipt[] {
  return paymentReceipts.map((receipt) => ({ ...receipt }))
}

export function handlePaymentWebhook(payload: PaymentWebhookPayload): PaymentReceipt | null {
  const receiptIndex = paymentReceipts.findIndex(
    (receipt) => receipt.transferContent === payload.transferContent && receipt.amount === payload.amount
  )

  if (receiptIndex === -1) {
    return null
  }

  const updatedReceipt: PaymentReceipt = {
    ...paymentReceipts[receiptIndex],
    status: normalizeWebhookStatus(payload.status),
  }

  paymentReceipts = paymentReceipts.map((receipt, index) => (index === receiptIndex ? updatedReceipt : receipt))

  return { ...updatedReceipt }
}

function createBankTransferInfo(transferContent: string): BankTransferInfo {
  return {
    ...baseBankTransferInfo,
    transferContent,
  }
}

function clonePlan(plan: PaymentPlan): PaymentPlan {
  return {
    ...plan,
    features: [...plan.features],
  }
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VND`
}

function normalizeWebhookStatus(status: PaymentWebhookPayload["status"]): PaymentReceipt["status"] {
  if (status === "SUCCESS" || status === "COMPLETED") {
    return "PAID"
  }

  return status
}
