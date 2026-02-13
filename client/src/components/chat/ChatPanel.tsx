import { useState, useRef, useEffect } from 'react'
import { HiX, HiPaperAirplane, HiTrash, HiChat } from 'react-icons/hi'
import { useChatStore } from '../../stores/chat'

function ChatBubble() {
  const { toggleChat, isOpen, messages } = useChatStore()
  const unread = messages.filter((m) => m.role === 'assistant').length

  return (
    <button
      onClick={toggleChat}
      aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
      className="fixed bottom-6 right-6 z-[60] flex items-center justify-center
        w-14 h-14 rounded-full bg-navy text-white shadow-lg
        hover:shadow-xl hover:scale-105 transition-all duration-200"
    >
      {isOpen ? (
        <HiX className="w-6 h-6" />
      ) : (
        <>
          <HiChat className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-green)]
              text-white text-xs flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </>
      )}
    </button>
  )
}

function MarkdownText({ text }: { text: string }) {
  // Simple markdown: bold, bullet points, line breaks
  const lines = text.split('\n')
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--color-muted)] mt-0.5 shrink-0">&bull;</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />
            </div>
          )
        }
        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^(\d+)\.\s/)![1]
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--color-muted)] mt-0.5 shrink-0 text-xs font-bold">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(line.replace(/^\d+\.\s/, '')) }} />
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
      })}
    </div>
  )
}

function boldify(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function ChatPanel() {
  const { messages, isOpen, loading, error, sendMessage, clearMessages, closeChat } =
    useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] flex flex-col
      bg-[var(--color-background)] border-l border-[var(--color-border)] shadow-2xl
      transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]
        bg-navy text-white shrink-0">
        <div className="flex items-center gap-2">
          <HiChat className="w-5 h-5" />
          <span className="font-semibold text-sm">BlueAlly AI Analyst</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            aria-label="Clear chat"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <HiTrash className="w-4 h-4" />
          </button>
          <button
            onClick={closeChat}
            aria-label="Close chat"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center mb-4">
              <HiChat className="w-6 h-6 text-navy" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-2">
              VAR Intelligence Assistant
            </h3>
            <p className="text-xs text-[var(--color-muted)] mb-6 max-w-[280px]">
              Ask about VAR acquisition targets, market analysis, scoring breakdowns, or strategic recommendations.
            </p>
            <div className="grid gap-2 w-full max-w-[300px]">
              {[
                'Which VARs in the Southeast have the highest composite scores?',
                'Compare top 3 acquisition targets',
                'What are the best tuck-in acquisition opportunities?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border border-[var(--color-border)]
                    text-[var(--color-muted)] hover:text-[var(--color-foreground)]
                    hover:border-navy/30 hover:bg-[var(--color-subtle)] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-navy text-white rounded-br-md'
                  : 'bg-[var(--color-subtle)] text-[var(--color-foreground)] rounded-bl-md border border-[var(--color-border)]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <MarkdownText text={msg.content} />
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-subtle)] border border-[var(--color-border)] px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-navy/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-navy/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-navy/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-[85%] px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[var(--color-border)] px-4 py-3 bg-[var(--color-background)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about VARs, scores, or strategy..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--color-border)]
              bg-[var(--color-subtle)] px-3.5 py-2.5 text-sm
              text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]
              focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/50
              transition-all max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex items-center justify-center w-10 h-10 rounded-xl
              bg-navy text-white disabled:opacity-40
              hover:bg-navy/90 transition-all shrink-0"
          >
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { ChatBubble, ChatPanel }
