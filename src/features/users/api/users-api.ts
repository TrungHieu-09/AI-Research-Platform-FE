import { apiFetch } from "@/lib/api/client"

import type { ManagedUser, PaginatedUsers, UserRole, UserStatus } from "../types"

export interface GetUsersQuery {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserRequest {
  role?: UserRole
  status?: UserStatus
}

type UpdateUserResponse =
  | Partial<ManagedUser>
  | {
      user?: ManagedUser
      data?: ManagedUser
      item?: ManagedUser
      message?: string
    }

const USER_ENDPOINTS = {
  list: "/api/users",
  byId: (id: string) => `/api/users/${id}`,
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

export function getUserItems(response: ManagedUser[] | PaginatedUsers) {
  if (Array.isArray(response)) return response
  return response.data ?? response.users ?? response.items ?? []
}

export function getUserTotal(response: ManagedUser[] | PaginatedUsers) {
  if (Array.isArray(response)) return response.length
  return response.total ?? getUserItems(response).length
}

export function getUsers(query?: GetUsersQuery) {
  return apiFetch<ManagedUser[] | PaginatedUsers>(
    `${USER_ENDPOINTS.list}${buildQueryString(query)}`,
  )
}

function getUpdatedUser(response: UpdateUserResponse) {
  if ("user" in response && response.user) return response.user
  if ("data" in response && response.data) return response.data
  if ("item" in response && response.item) return response.item

  return response as Partial<ManagedUser>
}

export async function updateUser(id: string, payload: UpdateUserRequest) {
  const response = await apiFetch<UpdateUserResponse>(USER_ENDPOINTS.byId(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  return getUpdatedUser(response)
}
