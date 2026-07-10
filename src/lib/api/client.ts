const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")
const ACCESS_TOKEN_KEY = "lumis_access_token"
const AUTH_USER_KEY = "lumis_auth_user"

export type AuthRole = "STUDENT" | "ADMIN"
export type AuthTier = "FREE" | "PREMIUM"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: AuthRole
  status?: "ACTIVE" | "SUSPENDED"
  tier: AuthTier
}

interface ApiErrorResponse {
  error?: unknown
  message?: unknown
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

function extractErrorMessage(value: unknown): string | null {
  if (typeof value === "string") return value

  if (Array.isArray(value)) {
    const messages = value
      .map(extractErrorMessage)
      .filter((message): message is string => Boolean(message))

    return messages.length > 0 ? messages.join(" ") : null
  }

  if (value && typeof value === "object") {
    const messages = Object.entries(value).flatMap(([field, fieldError]) => {
      const message = extractErrorMessage(fieldError)
      return message ? [`${field}: ${message}`] : []
    })

    return messages.length > 0 ? messages.join(" ") : null
  }

  return null
}

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
}

export function setAuthUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  setAccessToken(token)
  setAuthUser(user)
}

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getAuthUser() {
  if (typeof window === "undefined") return null

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function getDefaultRouteByRole(role: AuthRole) {
  return role === "ADMIN" ? "/admin/dashboard" : "/user/library"
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(AUTH_USER_KEY)
    window.localStorage.removeItem("lumis_auth")
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const accessToken = getAccessToken()

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(resolveApiUrl(path), {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const responseBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const errorBody = responseBody as ApiErrorResponse | string
    const message =
      typeof errorBody === "string"
        ? errorBody
        : extractErrorMessage(errorBody.message) ??
          extractErrorMessage(errorBody.error) ??
          "Không thể kết nối API."

    throw new ApiError(message || "Không thể kết nối API.", response.status)
  }

  return responseBody as T
}
