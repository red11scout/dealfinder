import { Router, Request, Response } from 'express'
import type { UnifiedVar, AcquisitionCriteria, ScoredVar } from '@shared/types'
import { db } from '../db/index.js'
import { vars as varsTable } from '../db/schema.js'
import {
  DEFAULT_CRITERIA,
  computeAllScores,
  generateScoreExplanation,
} from '../lib/scoring.js'

const router = Router()

// ============================================================================
// Criteria Weights (mutable per-session, in-memory)
// ============================================================================

let currentCriteria: AcquisitionCriteria = { ...DEFAULT_CRITERIA }

// ============================================================================
// Data Access — DB with fallback
// ============================================================================

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

async function getAllVars(): Promise<UnifiedVar[]> {
  if (db) {
    try {
      const rows = await db.select().from(varsTable)
      return rows.map(mapDbRowToUnifiedVar)
    } catch (e) {
      console.error('DB query failed in M&A route:', e)
    }
  }
  return []
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/ma/rankings — return ranked VARs with scores
router.get('/ma/rankings', async (_req: Request, res: Response) => {
  try {
    const allVars = await getAllVars()
    const scored = computeAllScores(allVars, currentCriteria)
    res.json({
      rankings: scored,
      criteria: currentCriteria,
      count: scored.length,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute rankings' })
  }
})

// GET /api/ma/criteria — return current acquisition criteria
router.get('/ma/criteria', (_req: Request, res: Response) => {
  res.json(currentCriteria)
})

// PUT /api/ma/criteria — update criteria weights and recalculate
router.put('/ma/criteria', async (req: Request, res: Response) => {
  const updates = req.body as Partial<AcquisitionCriteria>

  const validKeys: (keyof AcquisitionCriteria)[] = [
    'revenueFitWeight',
    'geographicFitWeight',
    'specialtyFitWeight',
    'cultureFitWeight',
    'customerOverlapWeight',
    'vendorSynergyWeight',
    'growthTrajectoryWeight',
    'marginProfileWeight',
  ]

  const invalidKeys = Object.keys(updates).filter(
    (k) => !validKeys.includes(k as keyof AcquisitionCriteria)
  )

  if (invalidKeys.length > 0) {
    res.status(400).json({
      error: `Invalid criteria keys: ${invalidKeys.join(', ')}`,
      validKeys,
    })
    return
  }

  currentCriteria = { ...currentCriteria, ...updates }

  try {
    const allVars = await getAllVars()
    const scored = computeAllScores(allVars, currentCriteria)
    res.json({
      criteria: currentCriteria,
      rankings: scored,
      count: scored.length,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to recalculate rankings' })
  }
})

// GET /api/ma/rankings/:id/explanation — detailed score breakdown
router.get('/ma/rankings/:id/explanation', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    const allVars = await getAllVars()
    const scored = computeAllScores(allVars, currentCriteria)
    const sv = scored.find((s) => s.var.id === id)

    if (!sv) {
      res.status(404).json({ error: `VAR with id ${id} not found in rankings` })
      return
    }

    const explanation = generateScoreExplanation(sv, currentCriteria)
    res.json(explanation)
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate explanation' })
  }
})

// GET /api/ma/compare?ids=1,2,3 — return comparison data
router.get('/ma/compare', async (req: Request, res: Response) => {
  const idsParam = req.query.ids as string

  if (!idsParam) {
    res.status(400).json({ error: 'ids query parameter required (comma-separated)' })
    return
  }

  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))

  if (ids.length < 2 || ids.length > 3) {
    res.status(400).json({ error: 'Provide 2 or 3 VAR IDs for comparison' })
    return
  }

  try {
    const allVars = await getAllVars()
    const scored = computeAllScores(allVars, currentCriteria)
    const selected = ids
      .map((id) => scored.find((sv) => sv.var.id === id))
      .filter(Boolean) as ScoredVar[]

    if (selected.length !== ids.length) {
      res.status(404).json({ error: 'One or more VAR IDs not found' })
      return
    }

    res.json({
      candidates: selected,
      criteria: currentCriteria,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate comparison' })
  }
})

// POST /api/ma/scenarios — simulate acquisition
router.post('/ma/scenarios', async (req: Request, res: Response) => {
  const {
    name,
    targetVarIds,
    ebitdaMultiple = 7,
    synergyCrossSell = 0.05,
    synergyMarginImprovement = 0.15,
    integrationCostPercent = 0.03,
  } = req.body

  if (!targetVarIds || !Array.isArray(targetVarIds) || targetVarIds.length === 0) {
    res.status(400).json({ error: 'targetVarIds array required' })
    return
  }

  try {
    const allVars = await getAllVars()
    const targets = targetVarIds
      .map((id: number) => allVars.find((v) => v.id === id))
      .filter(Boolean) as UnifiedVar[]

    if (targets.length !== targetVarIds.length) {
      res.status(404).json({ error: 'One or more target VAR IDs not found' })
      return
    }

    // BlueAlly baseline
    const blueAllyRevenue = 50
    const blueAllyEbitda = 5

    const combinedRevenue = blueAllyRevenue + targets.reduce((sum, t) => sum + t.annualRevenue, 0)
    const targetEbitda = targets.reduce(
      (sum, t) => sum + (t.annualRevenue * (t.ebitdaMargin ?? 10)) / 100,
      0
    )
    const combinedEbitda = blueAllyEbitda + targetEbitda

    const estimatedValuation = targetEbitda * ebitdaMultiple
    const priceVariance = estimatedValuation * 0.2
    const estimatedPriceRange = {
      low: Math.round(estimatedValuation - priceVariance),
      high: Math.round(estimatedValuation + priceVariance),
    }

    const crossSellRevenue = targets.reduce((sum, t) => sum + t.annualRevenue * synergyCrossSell, 0)
    const marginGain = targets.reduce(
      (sum, t) => sum + t.annualRevenue * synergyMarginImprovement,
      0
    )
    const integrationCost = estimatedValuation * integrationCostPercent
    const projectedRoi =
      ((crossSellRevenue + marginGain - integrationCost) / estimatedValuation) * 100

    const allSpecialties = targets.flatMap((t) => t.specialties ?? [])
    const blueAllySpecialties = ['Cloud', 'AI/ML', 'Data Analytics', 'Managed Services']
    const capabilityOverlaps = [
      ...new Set(allSpecialties.filter((s) => blueAllySpecialties.includes(s))),
    ]
    const capabilityGains = [
      ...new Set(allSpecialties.filter((s) => !blueAllySpecialties.includes(s))),
    ]

    const allVendors = targets.flatMap((t) => t.topVendors)
    const blueAllyVendors = ['Microsoft', 'AWS', 'Dell', 'Cisco', 'Anthropic', 'ServiceNow']
    const vendorOverlaps = [...new Set(allVendors.filter((v) => blueAllyVendors.includes(v)))]

    const allStates = targets.map((t) => t.hqState)
    const geographicOverlaps = allStates.includes('NC') ? ['NC'] : []

    res.json({
      name: name || `Scenario: ${targets.map((t) => t.name).join(' + ')}`,
      targets,
      combinedRevenue: Math.round(combinedRevenue),
      combinedEbitda: Math.round(combinedEbitda),
      estimatedValuation: Math.round(estimatedValuation),
      estimatedPriceRange,
      projectedRoi: Math.round(projectedRoi * 10) / 10,
      crossSellRevenue: Math.round(crossSellRevenue),
      marginGain: Math.round(marginGain),
      integrationCost: Math.round(integrationCost),
      capabilityOverlaps,
      capabilityGains,
      vendorOverlaps,
      geographicOverlaps,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute scenario' })
  }
})

export default router
