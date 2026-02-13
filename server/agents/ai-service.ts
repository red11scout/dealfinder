import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db/index.js'
import { vars as varsTable } from '../db/schema.js'

// ============================================================================
// Singleton Anthropic Client
// ============================================================================

let client: Anthropic | null = null

function getClient(): Anthropic | null {
  if (client) return client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set — AI features will be unavailable')
    return null
  }
  client = new Anthropic({ apiKey })
  return client
}

// ============================================================================
// System Prompt — BlueAlly VAR Intelligence Context
// ============================================================================

const SYSTEM_PROMPT = `You are an AI analyst for BlueAlly Technology Solutions, a PE-backed IT solutions and consulting firm based in Morrisville, NC. You help BlueAlly's M&A team evaluate Value Added Reseller (VAR) acquisition targets.

Key Context:
- BlueAlly is a $50M revenue company with ~100 employees
- Focus areas: AI/ML, Data Analytics, Cloud Migration, Managed Services
- Key vendor partnerships: Microsoft, AWS, Dell, Cisco, Anthropic, ServiceNow
- Target customer segment: Mid-Market enterprises and PE portfolio companies
- Preferred acquisition geography: Southeast/Mid-Atlantic US (NC, VA, GA, FL, TX, SC, MD, AL, TN, PA)
- Ideal acquisition target: $50-300M revenue, PE-backed or Private, with Cloud/Cybersecurity/Managed Services specialties

Scoring Dimensions (8 total, each 1-10):
1. Revenue Fit: $100-300M ideal (10), $50-100M or $300-500M (7), others lower
2. Geographic Fit: Preferred states (10), Adjacent states (7), others (4)
3. Specialty Fit: Cloud + Cybersecurity + Managed Services overlap
4. Culture Fit: PE-Backed (9), Private (8), ESOP (6), Public (4)
5. Customer Overlap: Mid-Market (10), Mixed (8), Enterprise (6), SMB (5)
6. Vendor Synergy: Microsoft + Cisco + Dell overlap
7. Growth Trajectory: 20%+ (10), 15-19% (9), 10-14% (7), 5-9% (5)
8. Margin Profile: 18%+ EBITDA (10), 15-17% (9), 12-14% (7)

You have access to a database of ~76 VARs. When answering questions:
- Be concise and analytical — think like a McKinsey consultant
- Use data and numbers to support your analysis
- Provide clear recommendations with reasoning
- Flag risks and concerns alongside strengths
- Reference specific VARs by name when relevant
- Use Hemingway-style prose — short, direct, powerful`

// ============================================================================
// Get VAR Context for RAG
// ============================================================================

async function getVarContext(): Promise<string> {
  if (!db) return 'Database not available. Working with limited context.'

  try {
    const allVars = await db.select().from(varsTable)
    const summary = allVars.map(v =>
      `${v.name}: $${v.annualRevenue}M rev, ${v.hqState}, ${v.ownershipType}, specialties: ${(v.specialties as string[] | null)?.join(', ') ?? 'N/A'}, growth: ${v.growthRate ?? 'N/A'}%, EBITDA margin: ${v.ebitdaMargin ?? 'N/A'}%`
    ).join('\n')

    return `VAR Database (${allVars.length} companies):\n${summary}`
  } catch (e) {
    console.error('Failed to load VAR context:', e)
    return 'Database query failed. Working with limited context.'
  }
}

// ============================================================================
// Chat Response
// ============================================================================

export async function chatResponse(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const anthropic = getClient()
  if (!anthropic) {
    return 'AI features are not available. Please set the ANTHROPIC_API_KEY environment variable.'
  }

  const varContext = await getVarContext()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: `${SYSTEM_PROMPT}\n\n${varContext}`,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.text ?? 'No response generated.'
  } catch (e: any) {
    console.error('AI chat error:', e)
    return `AI error: ${e.message ?? 'Unknown error'}`
  }
}

// ============================================================================
// Analyze VAR (for dossier enrichment)
// ============================================================================

export async function analyzeVar(varName: string, varData: Record<string, any>): Promise<string> {
  const anthropic = getClient()
  if (!anthropic) return 'AI analysis unavailable.'

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Provide a concise M&A analysis of ${varName} as an acquisition target for BlueAlly. Include: strategic fit assessment, key risks, estimated valuation range (if revenue/margin data available), and recommended next steps.

Data:
${JSON.stringify(varData, null, 2)}`,
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.text ?? 'No analysis generated.'
  } catch (e: any) {
    console.error('AI analyze error:', e)
    return `Analysis error: ${e.message}`
  }
}

// ============================================================================
// Generate Score Explanation (AI-enhanced)
// ============================================================================

export async function generateAiExplanation(
  varName: string,
  scores: Record<string, number>,
  compositeScore: number,
  rank: number,
): Promise<string> {
  const anthropic = getClient()
  if (!anthropic) return ''

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Write a 2-3 sentence executive summary for ${varName} (Rank #${rank}, Composite: ${compositeScore.toFixed(1)}/10).
Scores: ${JSON.stringify(scores)}
Be specific and actionable. McKinsey/BCG style.`,
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.text ?? ''
  } catch {
    return ''
  }
}

export { getClient }
