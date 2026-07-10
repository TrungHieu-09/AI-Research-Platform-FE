"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { setAuthUser } from "@/components/layouts/landing-header"
import { verifyOtp } from "@/features/auth/api/auth-api"
import { getDefaultRouteByRole } from "@/lib/api/client"

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [otpCode, setOtpCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = await verifyOtp({ email, otpCode })
      const initials = response.user.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

      setAuthUser({
        name: response.user.name,
        email: response.user.email,
        initials,
        role: response.user.role === "ADMIN" ? "admin" : "user",
      })
      router.push(getDefaultRouteByRole(response.user.role))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Xác thực OTP thất bại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4 pt-24 pb-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#c2c6d6]/40 bg-white p-8 shadow-xl"
        style={{ width: "min(100%, 420px)" }}
      >
        <h1 className="text-[28px] font-bold text-[#121c2a] mb-2">Verify your email</h1>
        <p className="text-[14px] text-[#424754] mb-6">
          Enter the 6-digit verification code sent to <span className="font-bold">{email}</span>.
        </p>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <label className="block text-[13px] font-bold text-[#424754] mb-1.5">
          Verification code
        </label>
        <input
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          className="w-full h-12 rounded-xl border border-[#c2c6d6] bg-[#f8f9ff] px-4 text-center text-[20px] font-bold tracking-[0.4em] outline-none focus:border-[#0058be]"
          maxLength={6}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="mt-6 w-full h-12 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#2170e4] disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>

        <Link
          href="/signup"
          className="mt-4 block text-center text-[13px] font-semibold text-[#0058be] hover:underline"
        >
          Back to signup
        </Link>
      </form>
    </main>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
