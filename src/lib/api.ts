// ─── API client helper ─────────────────────────────────────────────────────
// In local dev, keep requests relative (`/api/...`) so Next rewrites proxy them to BACKEND_URL.
// Setting NEXT_PUBLIC_API_URL makes the browser call the backend directly and requires BE CORS.
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("lumis_token") ?? localStorage.getItem("lumis_access_token")
}

type ApiOptions = {
  token?: string
  noAuth?: boolean
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: ApiOptions = {}
): Promise<T> {
  const token = opts.token ?? (opts.noAuth ? null : getToken())

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    // Extract a readable error message from server response
    const message =
      typeof data?.error === "string"
        ? data.error
        : data?.error
        ? Object.values(data.error).flat().join(" · ")
        : `Request failed (${res.status})`
    throw new Error(message)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body: unknown, opts?: ApiOptions) => request<T>("POST", path, body, opts),
  put: <T>(path: string, body: unknown, opts?: ApiOptions) => request<T>("PUT", path, body, opts),
  patch: <T>(path: string, body: unknown, opts?: ApiOptions) => request<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: ApiOptions) => request<T>("DELETE", path, undefined, opts),
}
