import type { DocumentRecord } from "@/features/documents/types"

export type ForumDocumentSort = "newest" | "popular" | "top_rated"

export interface PublicForumDocument extends DocumentRecord {
  viewCount?: number
  ratingAverage?: number
  averageRating?: number
  ratingCount?: number
  totalRatings?: number
  bookmarkCount?: number
  savedCount?: number
  isBookmarked?: boolean
}

export interface PaginatedPublicForumDocuments {
  items?: PublicForumDocument[]
  data?: PublicForumDocument[]
  documents?: PublicForumDocument[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ForumRatingAuthor {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
}

export interface ForumRatingItem {
  id: string
  documentId?: string
  userId?: string
  authorId?: string
  user?: ForumRatingAuthor | null
  author?: ForumRatingAuthor | null
  rating: number
  comment?: string | null
  createdAt: string
  updatedAt?: string
}

export interface ForumRatingsResponse {
  average: number
  total: number
  items: ForumRatingItem[]
}

export interface ForumRatingPayload {
  rating: number
  comment: string
}

export interface BookmarkResponse {
  message?: string
}
