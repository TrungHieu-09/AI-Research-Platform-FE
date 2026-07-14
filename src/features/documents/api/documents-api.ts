import { apiFetch, getAccessToken, getAuthUser } from "@/lib/api/client"

import type {
  AuditLog,
  DocumentRecord,
  DocumentStatus,
  DocumentVisibility,
  PaginatedDocuments,
} from "../types"

export interface RequestUploadUrlRequest {
  filename: string
  fileHash: string
  fileSize: number
  mimeType: string
}

export interface RequestUploadUrlResponse {
  uploadUrl?: string
  url?: string
  fileUrl?: string
  publicUrl?: string
  documentId?: string
  id?: string
  deduplicated?: boolean
  isDuplicate?: boolean
  document?: DocumentRecord
}

export interface CreateDocumentRequest {
  title: string
  description?: string
  filename?: string
  subjectId: string
  visibility: DocumentVisibility
  fileUrl: string
  fileHash: string
  fileSize: number
  mimeType: string
  pageCount: number
}

export interface GetDocumentsQuery {
  subjectId?: string
  status?: DocumentStatus
  search?: string
  page?: number
  pageSize?: number
  limit?: number
  ownerId?: string
  visibility?: DocumentVisibility
}

export interface ModerateDocumentRequest {
  decision: "APPROVED" | "REJECTED"
  rejectionReason?: string
}

export interface MessageResponse {
  message: string
}

const DOCUMENT_ENDPOINTS = {
  list: "/api/documents",
  adminList: "/api/admin/documents",
  uploadUrl: "/api/documents/upload-url",
  byId: (id: string) => `/api/documents/${id}`,
  moderate: (id: string) => `/api/documents/${id}/moderate`,
  restore: (id: string) => `/api/documents/${id}/restore`,
  hardDelete: (id: string) => `/api/admin/documents/${id}/hard`,
  audit: (id: string) => `/api/documents/${id}/audit`,
} as const

function buildQueryString(query: object = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

function getAdminHeaders(includeUserId = false): HeadersInit {
  const user = getAuthUser()
  const role = user?.role?.toUpperCase()
  const headers: Record<string, string> = {
    "x-user-role": role === "ADMIN" ? "ADMIN" : role || "ADMIN",
  }

  if (includeUserId && user?.id) {
    headers["x-user-id"] = user.id
  }

  return headers
}

function isDocumentLike(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("id" in value || "title" in value || "fileUrl" in value || "status" in value),
  )
}

function findDocumentArray(value: unknown): DocumentRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isDocumentLike) as DocumentRecord[]
  }

  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  const knownKeys = [
    "documents",
    "docs",
    "items",
    "rows",
    "records",
    "list",
    "data",
    "result",
    "results",
  ]

  for (const key of knownKeys) {
    const found = findDocumentArray(record[key])
    if (found.length > 0) return found
  }

  for (const nestedValue of Object.values(record)) {
    const found = findDocumentArray(nestedValue)
    if (found.length > 0) return found
  }

  return []
}

export function getDocumentItems(response: DocumentRecord[] | PaginatedDocuments): DocumentRecord[] {
  if (Array.isArray(response)) return response
  if (Array.isArray(response.data)) return response.data
  if (response.data) return getDocumentItems(response.data)
  if (Array.isArray(response.result)) return response.result
  if (response.result) return getDocumentItems(response.result)
  if (Array.isArray(response.results)) return response.results
  if (response.results) return getDocumentItems(response.results)

  return (
    response.documents ??
    response.docs ??
    response.items ??
    response.rows ??
    response.records ??
    response.list ??
    findDocumentArray(response)
  )
}

export function requestDocumentUploadUrl(payload: RequestUploadUrlRequest) {
  return apiFetch<RequestUploadUrlResponse>(DOCUMENT_ENDPOINTS.uploadUrl, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function createDocument(payload: CreateDocumentRequest) {
  return apiFetch<DocumentRecord>(DOCUMENT_ENDPOINTS.list, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getDocuments(query?: GetDocumentsQuery) {
  return apiFetch<DocumentRecord[] | PaginatedDocuments>(
    `${DOCUMENT_ENDPOINTS.list}${buildQueryString(query)}`,
  )
}

export function getAdminDocuments(query?: GetDocumentsQuery) {
  return apiFetch<DocumentRecord[] | PaginatedDocuments>(
    `${DOCUMENT_ENDPOINTS.adminList}${buildQueryString(query)}`,
    {
      headers: getAdminHeaders(),
    },
  )
}

export function getDocument(id: string) {
  return apiFetch<DocumentRecord>(DOCUMENT_ENDPOINTS.byId(id))
}

export function moderateDocument(id: string, payload: ModerateDocumentRequest) {
  if (!id) {
    throw new Error("Không thể duyệt document vì thiếu document id.")
  }

  const endpoint = DOCUMENT_ENDPOINTS.moderate(id)

  if (process.env.NODE_ENV !== "production") {
    console.info("[documents-api] moderateDocument", endpoint, payload)
  }

  return apiFetch<MessageResponse>(endpoint, {
    method: "POST",
    headers: getAdminHeaders(true),
    body: JSON.stringify(payload),
  })
}

export function deleteDocument(id: string) {
  return apiFetch<MessageResponse>(DOCUMENT_ENDPOINTS.byId(id), {
    method: "DELETE",
  })
}

export function restoreDocument(id: string) {
  return apiFetch<DocumentRecord>(DOCUMENT_ENDPOINTS.restore(id), {
    method: "POST",
  })
}

export function hardDeleteDocument(id: string) {
  return apiFetch<MessageResponse>(DOCUMENT_ENDPOINTS.hardDelete(id), {
    method: "DELETE",
  })
}

export function getDocumentAuditLogs(id: string) {
  return apiFetch<AuditLog[]>(DOCUMENT_ENDPOINTS.audit(id))
}

function resolveUploadUrl(uploadUrl: string) {
  if (typeof window === "undefined") return uploadUrl

  try {
    const url = new URL(uploadUrl)
    const isLocalBackend =
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.port === "4000"

    if (isLocalBackend && url.pathname.startsWith("/api/")) {
      return `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return uploadUrl
  }

  return uploadUrl
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
  const resolvedUploadUrl = resolveUploadUrl(uploadUrl)
  const headers = new Headers({
    "Content-Type": file.type || "application/octet-stream",
  })

  if (resolvedUploadUrl.startsWith("/api/")) {
    const token = getAccessToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(resolvedUploadUrl, {
    method: "PUT",
    headers,
    body: file,
  })

  if (!response.ok) {
    throw new Error("Không thể upload file lên storage.")
  }
}
