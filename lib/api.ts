// hemut-frontend/lib/api.ts
// API client for communicating with the FastAPI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Question {
  question_id: number
  user_id: number | null
  message: string
  timestamp: string
  status: string
  escalated: boolean
  answered_by: number | null
}

export interface User {
  username: string
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type?: string
}

// Helper function to make API requests
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.detail || `API Error: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

// Auth endpoints
export const auth = {
  register: (user: User): Promise<Token> =>
    apiCall<Token>('/register', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  login: (credentials: { username: string; password: string }): Promise<Token> =>
    apiCall<Token>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
}

// Questions endpoints
export const questions = {
  list: (): Promise<Question[]> =>
    apiCall<Question[]>('/questions', {
      method: 'GET',
    }),

  submit: (message: string): Promise<Question> =>
    apiCall<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  answer: (
    questionId: number,
    token?: string
  ): Promise<{ detail: string }> =>
    apiCall<{ detail: string }>(`/questions/${questionId}/answer`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  escalate: (questionId: number): Promise<{ detail: string }> =>
    apiCall<{ detail: string }>(`/questions/${questionId}/escalate`, {
      method: 'POST',
    }),
}

// WebSocket helper for real-time updates
export function createWebSocket(
  onMessage: (data: any) => void,
  onError?: (error: Event) => void
): WebSocket {
  const wsUrl = `${API_URL.replace('http', 'ws')}/ws`
  const ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    onError?.(error)
  }

  return ws
}
