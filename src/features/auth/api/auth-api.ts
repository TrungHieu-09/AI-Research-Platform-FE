import { apiFetch, setAuthSession, type AuthUser } from "@/lib/api/client"

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  accessToken?: string
  user: AuthUser
}

export interface VerifyOtpRequest {
  email: string
  otpCode: string
}

export interface GoogleAuthRequest {
  token: string
}

const AUTH_ENDPOINTS = {
  register: "/api/auth/register",
  verifyOtp: "/api/auth/verify-otp",
  login: "/api/auth/login",
  google: "/api/auth/google",
} as const

function getToken(response: LoginResponse) {
  return response.token ?? response.accessToken ?? ""
}

export function register(payload: RegisterRequest) {
  return apiFetch<RegisterResponse>(AUTH_ENDPOINTS.register, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function login(payload: LoginRequest) {
  const response = await apiFetch<LoginResponse>(AUTH_ENDPOINTS.login, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  setAuthSession(getToken(response), response.user)
  return response
}

export async function verifyOtp(payload: VerifyOtpRequest) {
  const response = await apiFetch<LoginResponse>(AUTH_ENDPOINTS.verifyOtp, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  setAuthSession(getToken(response), response.user)
  return response
}

export async function loginWithGoogle(payload: GoogleAuthRequest) {
  const response = await apiFetch<LoginResponse>(AUTH_ENDPOINTS.google, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  setAuthSession(getToken(response), response.user)
  return response
}
