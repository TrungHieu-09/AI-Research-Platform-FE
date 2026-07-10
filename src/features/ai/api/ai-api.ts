import { apiFetch } from "@/lib/api/client"

import type {
  AiLimit,
  ChatMessage,
  ChatResponse,
  ChatScope,
  ChatSession,
} from "../types"

export interface SendChatRequest {
  message: string
  sessionId?: string
  documentId?: string
  scope?: ChatScope
}

const AI_ENDPOINTS = {
  chat: "/api/ai/chat",
  limit: "/api/ai/limit",
  sessions: "/api/ai/sessions",
  sessionMessages: (sessionId: string) => `/api/ai/sessions/${sessionId}/messages`,
} as const

export function sendChatMessage(payload: SendChatRequest) {
  return apiFetch<ChatResponse>(AI_ENDPOINTS.chat, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getAiLimit() {
  return apiFetch<AiLimit>(AI_ENDPOINTS.limit)
}

export function getAiSessions() {
  return apiFetch<ChatSession[]>(AI_ENDPOINTS.sessions)
}

export function getAiSessionMessages(sessionId: string) {
  return apiFetch<ChatMessage[]>(AI_ENDPOINTS.sessionMessages(sessionId))
}
