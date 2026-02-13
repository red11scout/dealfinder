import { Router, Request, Response } from 'express'
import type { UnifiedVar } from '@shared/types'
import { db } from '../db/index.js'
import { vars as varsTable } from '../db/schema.js'
import { ilike, or, eq, gte, lte, sql } from 'drizzle-orm'

const router = Router()

// ============================================================================
// Data Access — DB with in-memory fallback
// ============================================================================

let cachedVars: UnifiedVar[] | null = null

async function getAllVars(): Promise<UnifiedVar[]> {
  if (db) {
    try {
      const rows = await db.select().from(varsTable)
      return rows.map(mapDbRowToUnifiedVar)
    } catch (e) {
      console.error('DB query failed, using cache/fallback:', e)
    }
  }
  // Fallback: return cache if available, empty array otherwise
  return cachedVars ?? []
}

function mapDbRowToUnifiedVar(row: any): UnifiedVar {
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    hqCity: row.hqCity ?? '',
    hqState: row.hqState ?? '',
    annualRevenue: row.annualRevenue ?? 0,
    profit: row.profit,
    employeeCount: row.employeeCount ?? 0,
    ownershipType: row.ownershipType ?? 'Private',
    strategicSpecialty: row.strategicSpecialty ?? '',
    strategicFocus: row.strategicFocus,
    topVendors: row.topVendors ?? [],
    topCustomers: row.topCustomers ?? [],
    yearFounded: row.yearFounded ?? 2000,
    description: row.description ?? '',
    confidenceScore: row.confidenceScore ?? 0.5,
    dataSources: row.dataSources,
    growthRate: row.growthRate,
    ebitdaMargin: row.ebitdaMargin,
    customerSegment: row.customerSegment,
    specialties: row.specialties,
    branchLocations: row.branchLocations,
    certifications: row.certifications,
    servicesMix: row.servicesMix,
    glassdoorRating: row.glassdoorRating,
    latitude: row.latitude,
    longitude: row.longitude,
    discoveredBy: row.discoveredBy ?? 'seed',
    lastResearchedAt: row.lastResearchedAt?.toISOString() ?? null,
  }
}

// ============================================================================
// Filter helper (operates on UnifiedVar[])
// ============================================================================

function filterVars(
  data: UnifiedVar[],
  query: Record<string, string | undefined>
): UnifiedVar[] {
  let result = data

  if (query.search) {
    const q = query.search.toLowerCase()
    result = result.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.hqCity.toLowerCase().includes(q) ||
        v.hqState.toLowerCase().includes(q) ||
        v.strategicSpecialty.toLowerCase().includes(q) ||
        (v.strategicFocus?.toLowerCase().includes(q) ?? false) ||
        (v.description?.toLowerCase().includes(q) ?? false) ||
        v.topVendors.some((vendor) => vendor.toLowerCase().includes(q))
    )
  }

  if (query.ownershipType) {
    const types = query.ownershipType.split(',')
    result = result.filter((v) => types.includes(v.ownershipType))
  }

  if (query.state) {
    const states = query.state.split(',')
    result = result.filter((v) => states.includes(v.hqState))
  }

  if (query.minRevenue) {
    const min = parseFloat(query.minRevenue)
    result = result.filter((v) => v.annualRevenue >= min)
  }

  if (query.maxRevenue) {
    const max = parseFloat(query.maxRevenue)
    result = result.filter((v) => v.annualRevenue <= max)
  }

  if (query.specialty) {
    const spec = query.specialty.toLowerCase()
    result = result.filter(
      (v) =>
        v.strategicSpecialty.toLowerCase().includes(spec) ||
        (v.specialties?.some((s) => s.toLowerCase().includes(spec)) ?? false)
    )
  }

  return result
}

// ============================================================================
// Stats computation
// ============================================================================

function computeStats(data: UnifiedVar[]) {
  const totalRevenue = data.reduce((sum, v) => sum + v.annualRevenue, 0)
  const totalEmployees = data.reduce((sum, v) => sum + v.employeeCount, 0)
  return {
    totalVars: data.length,
    totalRevenue,
    avgRevenue: data.length > 0 ? Math.round(totalRevenue / data.length) : 0,
    totalEmployees,
    ownershipBreakdown: {
      public: data.filter((v) => v.ownershipType === 'Public').length,
      private: data.filter((v) => v.ownershipType === 'Private').length,
      pe: data.filter((v) => v.ownershipType === 'PE').length,
      vc: data.filter((v) => v.ownershipType === 'VC').length,
      esop: data.filter((v) => v.ownershipType === 'ESOP').length,
    },
    stateDistribution: data.reduce(
      (acc, v) => {
        acc[v.hqState] = (acc[v.hqState] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
  }
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/vars/stats
router.get('/vars/stats', async (req: Request, res: Response) => {
  try {
    const allVars = await getAllVars()
    const hasFilters = Object.keys(req.query).length > 0
    const data = hasFilters
      ? filterVars(allVars, req.query as Record<string, string>)
      : allVars
    res.json(computeStats(data))
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute stats' })
  }
})

// GET /api/vars — list all VARs with pagination
router.get('/vars', async (req: Request, res: Response) => {
  try {
    const allVars = await getAllVars()
    const filtered = filterVars(allVars, req.query as Record<string, string>)

    // Pagination
    const page = parseInt((req.query.page as string) || '1', 10)
    const limit = parseInt((req.query.limit as string) || '0', 10) // 0 = no pagination
    const sortBy = (req.query.sortBy as string) || 'annualRevenue'
    const sortDir = (req.query.sortDir as string) || 'desc'

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aVal = (a as any)[sortBy]
      const bVal = (b as any)[sortBy]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    if (limit > 0) {
      const start = (page - 1) * limit
      const paginated = sorted.slice(start, start + limit)
      res.json({
        vars: paginated,
        count: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      })
    } else {
      res.json({
        vars: sorted,
        count: sorted.length,
      })
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch VARs' })
  }
})

// GET /api/vars/:id — single VAR detail
router.get('/vars/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    const allVars = await getAllVars()
    const varCompany = allVars.find((v) => v.id === id)

    if (!varCompany) {
      res.status(404).json({ error: `VAR with id ${id} not found` })
      return
    }

    res.json(varCompany)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch VAR' })
  }
})

// POST /api/vars/:id/research — AI research agent for enrichment
router.post('/vars/:id/research', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    const allVars = await getAllVars()
    const varCompany = allVars.find((v) => v.id === id)

    if (!varCompany) {
      res.status(404).json({ error: `VAR with id ${id} not found` })
      return
    }

    // Dynamic import to avoid circular dependencies
    const { analyzeVar } = await import('../agents/ai-service.js')
    const analysis = await analyzeVar(varCompany.name, varCompany as any)
    res.json({ analysis, varId: id, timestamp: new Date().toISOString() })
  } catch (e: any) {
    console.error('Research error:', e)
    res.status(500).json({ error: 'Research failed' })
  }
})

export default router
