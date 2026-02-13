import { Router, Request, Response } from 'express'
import { chatResponse } from '../agents/ai-service.js'

const router = Router()

// ============================================================================
// POST /api/chat — send message, get AI response
// ============================================================================

router.post('/chat', async (req: Request, res: Response) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array required' })
    return
  }

  // Validate message format
  const valid = messages.every(
    (m: any) =>
      m &&
      typeof m.role === 'string' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string'
  )

  if (!valid) {
    res.status(400).json({
      error: 'Each message must have role ("user"|"assistant") and content (string)',
    })
    return
  }

  try {
    const reply = await chatResponse(messages)
    res.json({ role: 'assistant', content: reply })
  } catch (e: any) {
    console.error('Chat API error:', e)
    res.status(500).json({ error: 'Failed to generate response' })
  }
})

export default router
