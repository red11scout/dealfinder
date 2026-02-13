import { Router, Request, Response } from 'express'
import { db } from '../db/index.js'
import { vars as varsTable } from '../db/schema.js'
import {
  computeAllScores,
  DEFAULT_CRITERIA,
} from '../lib/scoring.js'
import type { UnifiedVar } from '@shared/types'

const router = Router()

// ============================================================================
// Helpers
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
    } catch {}
  }
  return []
}

// ============================================================================
// GET /api/export/vars — CSV export of VAR directory
// ============================================================================

router.get('/export/vars', async (_req: Request, res: Response) => {
  try {
    const allVars = await getAllVars()

    const headers = ['Name', 'City', 'State', 'Revenue ($M)', 'Employees', 'Ownership', 'Specialties', 'Top Vendors', 'Growth Rate (%)', 'EBITDA Margin (%)']
    const rows = allVars.map((v) => [
      v.name,
      v.hqCity,
      v.hqState,
      v.annualRevenue,
      v.employeeCount,
      v.ownershipType,
      (v.specialties ?? []).join('; '),
      v.topVendors.join('; '),
      v.growthRate ?? '',
      v.ebitdaMargin ?? '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((val) => {
          const str = String(val)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        }).join(',')
      ),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=var-directory.csv')
    res.send(csvContent)
  } catch (e) {
    res.status(500).json({ error: 'Export failed' })
  }
})

// ============================================================================
// GET /api/export/rankings — CSV export of M&A rankings
// ============================================================================

router.get('/export/rankings', async (_req: Request, res: Response) => {
  try {
    const allVars = await getAllVars()
    const scored = computeAllScores(allVars, DEFAULT_CRITERIA)

    const headers = [
      'Rank', 'Name', 'City', 'State', 'Revenue ($M)', 'Composite Score',
      'Revenue Fit', 'Geographic Fit', 'Specialty Fit', 'Culture Fit',
      'Customer Overlap', 'Vendor Synergy', 'Growth Trajectory', 'Margin Profile',
    ]
    const rows = scored.map((sv) => [
      sv.rank,
      sv.var.name,
      sv.var.hqCity,
      sv.var.hqState,
      sv.var.annualRevenue,
      sv.compositeScore.toFixed(1),
      sv.scores.revenueFit,
      sv.scores.geographicFit,
      sv.scores.specialtyFit,
      sv.scores.cultureFit,
      sv.scores.customerOverlap,
      sv.scores.vendorSynergy,
      sv.scores.growthTrajectory,
      sv.scores.marginProfile,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((val) => {
          const str = String(val)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        }).join(',')
      ),
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=ma-rankings.csv')
    res.send(csvContent)
  } catch (e) {
    res.status(500).json({ error: 'Export failed' })
  }
})

export default router
