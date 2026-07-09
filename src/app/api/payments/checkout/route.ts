import { checkoutPayment, isPaymentPlanId } from "@/lib/services/payment-service"

interface CheckoutRequestBody {
  planId: string
}

export async function POST(request: Request) {
  const body = await readJsonBody(request)

  if (!isCheckoutRequestBody(body) || !isPaymentPlanId(body.planId)) {
    return Response.json(
      {
        error: "Invalid checkout payload. Expected planId to be 'storage', 'ai', or 'ultimate'.",
      },
      { status: 400 }
    )
  }

  const checkout = checkoutPayment(body.planId)

  return Response.json({
    orderId: checkout.receipt.id,
    amount: checkout.totalAmount,
    currency: checkout.plan.currency,
    transferContent: checkout.bankTransfer.transferContent,
    qrCodeUrl: `/api/mock-qr?content=${encodeURIComponent(checkout.bankTransfer.transferContent)}`,
    receipt: checkout.receipt,
    paymentInstructions: {
      bankName: checkout.bankTransfer.bankName,
      accountNumber: checkout.bankTransfer.accountNumber,
      accountHolder: checkout.bankTransfer.accountHolder,
      providerLabel: checkout.bankTransfer.providerLabel,
      note: "Transfer exactly the provided amount and transfer content so Lumis can verify the payment.",
    },
  })
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function isCheckoutRequestBody(value: unknown): value is CheckoutRequestBody {
  return isRecord(value) && typeof value.planId === "string"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
