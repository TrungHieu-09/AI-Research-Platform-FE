export type ChatScope = "SINGLE" | "SINGLE_DOCUMENT" | "SUBJECT" | "GLOBAL"

export interface ChatCitation {
  documentId: string
  pageNumber?: number
  paragraphIndex?: number
  textExcerpt?: string
}

export interface ChatResponse {
  answer?: string
  message?: string
  citations?: ChatCitation[]
  sessionId?: string
}

export interface AiLimit {
  queriesToday: number
  limit: number
  tier: "FREE" | "PREMIUM"
}

export interface ChatSession {
  id: string
  title?: string | null
  userId?: string
  documentId?: string | null
  subjectId?: string | null
  scope?: ChatScope
  createdAt: string
  updatedAt?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  sender: "USER" | "AI"
  message: string
  createdAt: string
  citations?: ChatCitation[]
}
