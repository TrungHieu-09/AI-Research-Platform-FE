import type { PaymentWebhookPayload, PaymentWebhookStatus } from "@/lib/mocks/payments"
import { handlePaymentWebhook } from "@/lib/services/payment-service"

const webhookStatuses: PaymentWebhookStatus[] = ["SUCCESS", "COMPLETED", "FAILED", "CANCELLED", "PENDING"]

export async function POST(request: Request) {
  const body = await readJsonBody(request)

  if (!isPaymentWebhookPayload(body)) {
    return Response.json(
      {
        error: "Invalid webhook payload. Expected transferContent, amount, and status.",
      },
      { status: 400 }
    )
  }

  const receipt = handlePaymentWebhook(body)
  const activated = body.status === "SUCCESS" || body.status === "COMPLETED"

  return Response.json({
    activated,
    status: body.status,
    message: activated
      ? "Payment verified. Subscription activated."
      : "Payment webhook received. Subscription was not activated.",
    receipt,
  })
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function isPaymentWebhookPayload(value: unknown): value is PaymentWebhookPayload {
  return (
    isRecord(value) &&
    typeof value.transferContent === "string" &&
    typeof value.amount === "number" &&
    isPaymentWebhookStatus(value.status)
  )
}

function isPaymentWebhookStatus(value: unknown): value is PaymentWebhookStatus {
  return typeof value === "string" && webhookStatuses.includes(value as PaymentWebhookStatus)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
