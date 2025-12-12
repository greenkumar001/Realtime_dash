/**
 * WebSocket hook for real-time forum updates.
 * Listens for new questions, answers, and status changes.
 */
import { useEffect } from "react"

type Message = {
  type: string
  [key: string]: any
}

type UseWebSocketProps = {
  url: string
  onMessage: (message: Message) => void
  onError?: (error: Event) => void
  onOpen?: () => void
}

export function useWebSocket({ url, onMessage, onError, onOpen }: UseWebSocketProps) {
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectDelay = 2000

    const connect = () => {
      try {
        ws = new WebSocket(url)

        ws.onopen = () => {
          console.log("[WebSocket] Connected")
          reconnectAttempts = 0
          if (onOpen) onOpen()
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            onMessage(data)
          } catch (e) {
            console.error("[WebSocket] Failed to parse message", e)
          }
        }

        ws.onerror = (error) => {
          console.error("[WebSocket] Error", error)
          if (onError) onError(error)
        }

        ws.onclose = () => {
          console.log("[WebSocket] Disconnected")
          // Attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            setTimeout(() => {
              console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttempts})...`)
              connect()
            }, reconnectDelay)
          }
        }
      } catch (e) {
        console.error("[WebSocket] Connection failed", e)
      }
    }

    connect()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [url, onMessage, onError, onOpen])
}
