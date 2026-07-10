export type SubjectStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"
export type SuggestionStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Subject {
  id: string
  name: string
  code: string
  status: SubjectStatus
  createdAt: string
  updatedAt?: string
}

export interface SubjectSuggestion {
  id: string
  name: string
  status: SuggestionStatus
  proposedById?: string
  proposedBy?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt?: string
}

export interface PaginatedSubjects {
  data?: Subject[]
  subjects?: Subject[]
  items?: Subject[]
}
