import { getPaymentReceipts } from "@/lib/services/payment-service"

export function GET() {
  return Response.json({
    items: getPaymentReceipts(),
  })
}
