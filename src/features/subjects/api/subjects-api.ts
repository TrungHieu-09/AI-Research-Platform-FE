import { apiFetch } from "@/lib/api/client"

import type {
  PaginatedSubjects,
  Subject,
  SubjectStatus,
  SubjectSuggestion,
} from "../types"

export interface CreateSubjectRequest {
  name: string
  code: string
}

export interface UpdateSubjectRequest {
  name?: string
  code?: string
  status?: SubjectStatus
}

export interface SuggestSubjectRequest {
  name: string
}

export interface ModerateSubjectSuggestionRequest {
  action: "APPROVED" | "REJECTED"
}

export interface MessageResponse {
  message: string
}

const SUBJECT_ENDPOINTS = {
  list: "/api/subjects",
  suggest: "/api/subjects/suggest",
  byId: (id: string) => `/api/subjects/${id}`,
  moderateSuggestion: (id: string) => `/api/subjects/suggest/${id}/moderate`,
} as const

export interface GetSubjectsQuery {
  status?: SubjectStatus
}

export function getSubjectItems(response: Subject[] | PaginatedSubjects) {
  if (Array.isArray(response)) return response
  return response.data ?? response.subjects ?? response.items ?? []
}

export async function getSubjects(query: GetSubjectsQuery = {}) {
  const params = new URLSearchParams()

  if (query.status) {
    params.set("status", query.status)
  }

  const endpoint = params.size
    ? `${SUBJECT_ENDPOINTS.list}?${params.toString()}`
    : SUBJECT_ENDPOINTS.list

  const response = await apiFetch<Subject[] | PaginatedSubjects>(endpoint)
  return getSubjectItems(response)
}

export function createSubject(payload: CreateSubjectRequest) {
  return apiFetch<Subject>(SUBJECT_ENDPOINTS.list, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateSubject(id: string, payload: UpdateSubjectRequest) {
  return apiFetch<Subject>(SUBJECT_ENDPOINTS.byId(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function deleteSubject(id: string) {
  return apiFetch<MessageResponse>(SUBJECT_ENDPOINTS.byId(id), {
    method: "DELETE",
  })
}

export function suggestSubject(payload: SuggestSubjectRequest) {
  return apiFetch<MessageResponse>(SUBJECT_ENDPOINTS.suggest, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getSubjectSuggestions() {
  return apiFetch<SubjectSuggestion[]>(SUBJECT_ENDPOINTS.suggest)
}

export function moderateSubjectSuggestion(
  id: string,
  payload: ModerateSubjectSuggestionRequest,
) {
  return apiFetch<MessageResponse>(SUBJECT_ENDPOINTS.moderateSuggestion(id), {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
