import type { Subject } from "@/features/subjects/types"
import type { AuthUser } from "@/lib/api/client"

export type DocumentVisibility = "PRIVATE" | "PUBLIC"
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface DocumentRecord {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  fileHash: string
  fileSize: number
  mimeType: string
  visibility: DocumentVisibility
  status: DocumentStatus
  rejectionReason?: string | null
  pageCount: number
  ownerId: string
  subjectId: string
  moderatedById?: string | null
  moderatedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  subject?: Subject
  owner?: Pick<AuthUser, "id" | "name" | "email" | "avatarUrl" | "role">
}

export interface PaginatedDocuments {
  data?: DocumentRecord[] | PaginatedDocuments
  docs?: DocumentRecord[]
  documents?: DocumentRecord[]
  items?: DocumentRecord[]
  list?: DocumentRecord[]
  rows?: DocumentRecord[]
  records?: DocumentRecord[]
  result?: DocumentRecord[] | PaginatedDocuments
  results?: DocumentRecord[] | PaginatedDocuments
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface AuditLog {
  id: string
  userId?: string | null
  action: string
  targetEntity: string
  targetId?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: Pick<AuthUser, "id" | "name" | "email"> | null
}
