import { apiFetch } from "@/lib/api/client"

import type {
  BookmarkResponse,
  ForumDocumentSort,
  ForumRatingPayload,
  ForumRatingsResponse,
  PaginatedPublicForumDocuments,
  PublicForumDocument,
} from "../types"

export interface GetPublicForumDocumentsQuery {
  page?: number
  pageSize?: number
  subjectId?: string
  search?: string
  sort?: ForumDocumentSort
}

export interface GetDocumentRatingsQuery {
  page?: number
  pageSize?: number
}

const FORUM_DOCUMENT_ENDPOINTS = {
  publicDocuments: "/api/documents/public",
  documentById: (id: string) => `/api/documents/${id}`,
  ratings: (id: string) => `/api/documents/${id}/ratings`,
  bookmarks: "/api/bookmarks",
  bookmarkByDocumentId: (documentId: string) => `/api/bookmarks/${documentId}`,
} as const

function buildQueryString(query: object = {}) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

function getItems(response: PaginatedPublicForumDocuments): PublicForumDocument[] {
  return response.items ?? response.data ?? response.documents ?? []
}

export async function getPublicForumDocuments(query: GetPublicForumDocumentsQuery = {}) {
  const response = await apiFetch<PaginatedPublicForumDocuments>(
    `${FORUM_DOCUMENT_ENDPOINTS.publicDocuments}${buildQueryString(query)}`,
  )

  return {
    ...response,
    items: getItems(response),
    page: response.page ?? query.page ?? 1,
    pageSize: response.pageSize ?? query.pageSize ?? 20,
    total: response.total ?? getItems(response).length,
    totalPages: response.totalPages ?? 1,
  }
}

export function getPublicForumDocument(id: string) {
  return apiFetch<PublicForumDocument>(FORUM_DOCUMENT_ENDPOINTS.documentById(id))
}

export function getDocumentRatings(id: string, query: GetDocumentRatingsQuery = {}) {
  return apiFetch<ForumRatingsResponse>(
    `${FORUM_DOCUMENT_ENDPOINTS.ratings(id)}${buildQueryString(query)}`,
  )
}

export function createDocumentRating(id: string, payload: ForumRatingPayload) {
  return apiFetch<ForumRatingsResponse>(FORUM_DOCUMENT_ENDPOINTS.ratings(id), {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateDocumentRating(id: string, payload: ForumRatingPayload) {
  return apiFetch<ForumRatingsResponse>(FORUM_DOCUMENT_ENDPOINTS.ratings(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function bookmarkDocument(documentId: string) {
  return apiFetch<BookmarkResponse>(FORUM_DOCUMENT_ENDPOINTS.bookmarks, {
    method: "POST",
    body: JSON.stringify({ documentId }),
  })
}

export function removeDocumentBookmark(documentId: string) {
  return apiFetch<BookmarkResponse>(FORUM_DOCUMENT_ENDPOINTS.bookmarkByDocumentId(documentId), {
    method: "DELETE",
  })
}
