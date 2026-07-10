export type UserRole = "STUDENT" | "ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED"
export type UserTier = "FREE" | "PREMIUM"

export interface ManagedUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: UserRole
  status: UserStatus
  tier?: UserTier
  createdAt: string
  updatedAt?: string
}

export interface PaginatedUsers {
  data?: ManagedUser[]
  users?: ManagedUser[]
  items?: ManagedUser[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}
