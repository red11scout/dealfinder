import Anthropic from '@anthropic-ai/sdk'
import { getClient } from './ai-service.js'
import { db } from '../db/index.js'
import { vars as varsTable } from '../db/schema.js'
import type { UnifiedVar } from '@shared/types'
import { scoreVar, computeComposite, DEFAULT_CRITERIA } from '../lib/scoring.js'

// ============================================================================
// Discovery Agent — Uses Claude to identify new VAR acquisition targets
// ============================================================================

interface DiscoveryResult {
  varsFound: Partial<UnifiedVar>[]
  summary: string
}

const DISCOVERY_PROMPT = `You are a research analyst identifying Value Added Reseller (VAR) companies in the US IT channel. Given a search query, return a JSON array of VARs matching the criteria.

For each VAR, provide as much data as possible:
- name: Company name (required)
- website: Company URL
- hqCity: Headquarters city
- hqState: 2-letter state code
- annualRevenue: Revenue in millions (numeric, e.g. 150 for $150M)
- employeeCount: Number of employees
- ownershipType: One of "Private", "PE-Backed", "Public", "ESOP", "VC"
- specialties: Array of specialties like ["Cloud", "Cybersecurity", "Managed Services", "Data Analytics", "AI/ML", "Networking"]
- topVendors: Array of vendor partners like ["Microsoft", "Cisco", "Dell", "AWS", "HPE"]
- customerSegment: One of "Mid-Market", "Enterprise", "SMB", "Mixed"
- growthRate: Estimated annual growth rate (numeric percentage, e.g. 12 for 12%)
- ebitdaMargin: Estimated EBITDA margin (numeric percentage, e.g. 15 for 15%)
- description: 1-2 sentence company description
- yearFounded: Year founded

Respond ONLY with valid JSON in this format:
{
  "vars": [...],
  "summary": "Brief summary of what you found and search methodology"
}

Be realistic. Only include companies you have reasonable confidence exist. Estimate financials based on industry norms if exact data isn't available. Include 3-8 results per search.`

export async function discoverVars(query: string): Promise<DiscoveryResult> {
  const anthropic = getClient()
  if (!anthropic) {
    return { varsFound: [], summary: 'AI features unavailable — no API key configured.' }
  }

  // Get existing VAR names to avoid duplicates
  let existingNames: string[] = []
  if (db) {
    try {
      const rows = await db.select({ name: varsTable.name }).from(varsTable)
      existingNames = rows.map((r) => r.name.toLowerCase())
    } catch {}
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      system: DISCOVERY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Search query: "${query}"\n\nExisting VARs in our database (exclude these): ${existingNames.slice(0, 30).join(', ')}`,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock?.text) return { varsFound: [], summary: 'No results generated.' }

    // Parse JSON from response
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { varsFound: [], summary: 'Could not parse AI response.' }

    const parsed = JSON.parse(jsonMatch[0])
    const vars: Partial<UnifiedVar>[] = (parsed.vars || [])
      .filter((v: any) => v.name && !existingNames.includes(v.name.toLowerCase()))
      .map((v: any) => ({
        name: v.name,
        website: v.website ?? null,
        hqCity: v.hqCity ?? '',
        hqState: v.hqState ?? '',
        annualRevenue: v.annualRevenue ?? 0,
        employeeCount: v.employeeCount ?? 0,
        ownershipType: v.ownershipType ?? 'Private',
        specialties: v.specialties ?? [],
        topVendors: v.topVendors ?? [],
        topCustomers: [],
        customerSegment: v.customerSegment ?? null,
        growthRate: v.growthRate ?? null,
        ebitdaMargin: v.ebitdaMargin ?? null,
        description: v.description ?? '',
        yearFounded: v.yearFounded ?? null,
        confidenceScore: 0.6,
        discoveredBy: 'ai_discovery' as const,
      }))

    return {
      varsFound: vars,
      summary: parsed.summary || `Found ${vars.length} potential VARs.`,
    }
  } catch (e: any) {
    console.error('Discovery agent error:', e)
    return { varsFound: [], summary: `Discovery error: ${e.message}` }
  }
}

// ============================================================================
// Import Discovered VARs into Database
// ============================================================================

export async function importDiscoveredVars(
  vars: Partial<UnifiedVar>[]
): Promise<{ imported: number; errors: string[] }> {
  if (!db) return { imported: 0, errors: ['Database not available'] }

  let imported = 0
  const errors: string[] = []

  for (const v of vars) {
    try {
      await db.insert(varsTable).values({
        name: v.name!,
        website: v.website ?? null,
        hqCity: v.hqCity ?? '',
        hqState: v.hqState ?? '',
        annualRevenue: v.annualRevenue ?? 0,
        employeeCount: v.employeeCount ?? 0,
        ownershipType: v.ownershipType ?? 'Private',
        specialties: v.specialties ?? [],
        topVendors: v.topVendors ?? [],
        topCustomers: [],
        customerSegment: v.customerSegment ?? null,
        growthRate: v.growthRate ?? null,
        ebitdaMargin: v.ebitdaMargin ?? null,
        description: v.description ?? '',
        yearFounded: v.yearFounded ?? 2000,
        confidenceScore: 0.6,
        discoveredBy: 'ai_discovery',
        dataSources: ['AI Discovery'],
      })
      imported++
    } catch (e: any) {
      errors.push(`${v.name}: ${e.message}`)
    }
  }

  return { imported, errors }
}

// ============================================================================
// Score Discovered VARs (preview before import)
// ============================================================================

export function scoreDiscoveredVars(
  vars: Partial<UnifiedVar>[]
): { var: Partial<UnifiedVar>; compositeScore: number }[] {
  return vars.map((v) => {
    const fullVar = {
      id: 0,
      name: v.name ?? '',
      website: v.website ?? null,
      hqCity: v.hqCity ?? '',
      hqState: v.hqState ?? '',
      annualRevenue: v.annualRevenue ?? 0,
      profit: null,
      employeeCount: v.employeeCount ?? 0,
      ownershipType: v.ownershipType ?? 'Private',
      strategicSpecialty: '',
      strategicFocus: null,
      topVendors: v.topVendors ?? [],
      topCustomers: [],
      yearFounded: v.yearFounded ?? 2000,
      description: v.description ?? '',
      confidenceScore: 0.6,
      dataSources: null,
      growthRate: v.growthRate ?? null,
      ebitdaMargin: v.ebitdaMargin ?? null,
      customerSegment: v.customerSegment ?? null,
      specialties: v.specialties ?? [],
      branchLocations: null,
      certifications: null,
      servicesMix: null,
      glassdoorRating: null,
      latitude: null,
      longitude: null,
      discoveredBy: 'ai_discovery',
      lastResearchedAt: null,
    } as UnifiedVar

    const scores = scoreVar(fullVar)
    const compositeScore = Math.round(computeComposite(scores, DEFAULT_CRITERIA) * 10) / 10

    return { var: v, compositeScore }
  })
}
