import { create } from 'zustand'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  loading: boolean
  error: string | null

  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  loading: false,
  error: null,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }
    const currentMessages = [...get().messages, userMessage]
    set({ messages: currentMessages, loading: true, error: null })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Chat failed: ${res.statusText}`)
      }

      const data = await res.json()
      set({
        messages: [...currentMessages, { role: 'assistant', content: data.content }],
        loading: false,
      })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}))
