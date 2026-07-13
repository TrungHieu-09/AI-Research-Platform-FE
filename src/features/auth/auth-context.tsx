"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: string   // "STUDENT" | "ADMIN"
  tier: string   // "FREE" | "PREMIUM"
  initials: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ email: string }>
  verifyOtp: (email: string, otpCode: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  verifyResetOtp: (email: string, otpCode: string) => Promise<void>
  resetPassword: (email: string, otpCode: string, password: string) => Promise<void>
  updateProfile: (data: { name: string }) => Promise<void>
  refreshProfile: () => Promise<void>
  upgradeTierToPremium: () => void
  logout: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = React.createContext<AuthContextValue | null>(null)

function makeInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("")
}

function saveSession(token: string, user: AuthUser) {
  localStorage.setItem("lumis_token", token)
  localStorage.setItem("lumis_user", JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem("lumis_token")
  localStorage.removeItem("lumis_user")
  // Legacy key cleanup
  localStorage.removeItem("lumis_auth")
}

function loadSession(): { token: string; user: AuthUser } | null {
  try {
    const token = localStorage.getItem("lumis_token")
    const raw = localStorage.getItem("lumis_user")
    if (!token || !raw) return null
    return { token, user: JSON.parse(raw) }
  } catch {
    return null
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Rehydrate session on mount
  React.useEffect(() => {
    const session = loadSession()
    if (session) {
      setToken(session.token)
      setUser(session.user)
    }
    setIsLoading(false)
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: any }>(
      "/api/auth/login",
      { email, password },
      { noAuth: true }
    )
    const authUser: AuthUser = { ...res.user, initials: makeInitials(res.user.name) }
    saveSession(res.token, authUser)
    setToken(res.token)
    setUser(authUser)

    // Redirect by role
    if (res.user.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else {
      router.push("/")
    }
  }, [router])

  const register = React.useCallback(async (name: string, email: string, password: string) => {
    await api.post("/api/auth/register", { name, email, password }, { noAuth: true })
    // Returns { message: "..." } — user needs OTP verification
    return { email }
  }, [])

  const verifyOtp = React.useCallback(async (email: string, otpCode: string) => {
    await api.post<{ token: string; user: any }>(
      "/api/auth/verify-otp",
      { email, otpCode },
      { noAuth: true }
    )
    // We intentionally do not save the token here.
    // The user is prompted to log in manually after a successful verification.
  }, [])

  const forgotPassword = React.useCallback(async (email: string) => {
    await api.post("/api/auth/forgot-password", { email }, { noAuth: true })
  }, [])

  const verifyResetOtp = React.useCallback(async (email: string, otpCode: string) => {
    await api.post("/api/auth/verify-reset-otp", { email, otpCode }, { noAuth: true })
  }, [])

  const resetPassword = React.useCallback(async (email: string, otpCode: string, password: string) => {
    await api.post("/api/auth/reset-password", { email, otpCode, password }, { noAuth: true })
  }, [])

  const updateProfile = React.useCallback(async (data: { name: string }) => {
    const res = await api.put<{ user: any }>("/api/users/me", data)
    const updatedAuthUser: AuthUser = { ...res.user, initials: makeInitials(res.user.name) }
    
    // Update local state and storage
    setUser(updatedAuthUser)
    if (token) {
      saveSession(token, updatedAuthUser)
    }
  }, [token])

  const refreshProfile = React.useCallback(async () => {
    if (!token) return
    try {
      const res = await api.get<{ user: any }>("/api/users/me")
      if (res && res.user) {
        const updatedAuthUser: AuthUser = { ...res.user, initials: makeInitials(res.user.name || "User") }
        setUser(updatedAuthUser)
        saveSession(token, updatedAuthUser)
      }
    } catch (e) {
      // ignore silently if session expired
    }
  }, [token])

  const upgradeTierToPremium = React.useCallback(() => {
    if (!user || !token) return
    const updatedUser: AuthUser = { ...user, tier: "PREMIUM" }
    setUser(updatedUser)
    saveSession(token, updatedUser)
  }, [user, token])

  const logout = React.useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, verifyOtp, forgotPassword, verifyResetOtp, resetPassword, updateProfile, refreshProfile, upgradeTierToPremium, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
