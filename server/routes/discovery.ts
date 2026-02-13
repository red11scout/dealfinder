import { Router, Request, Response } from 'express'
import { discoverVars, importDiscoveredVars, scoreDiscoveredVars } from '../agents/discovery-agent.js'

const router = Router()

// ============================================================================
// POST /api/discovery/search — trigger AI discovery
// ============================================================================

router.post('/discovery/search', async (req: Request, res: Response) => {
  const { query } = req.body

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    res.status(400).json({ error: 'Search query required (min 3 characters)' })
    return
  }

  try {
    const result = await discoverVars(query.trim())
    const scored = scoreDiscoveredVars(result.varsFound)

    // Sort by composite score descending
    scored.sort((a, b) => b.compositeScore - a.compositeScore)

    res.json({
      query: query.trim(),
      results: scored,
      summary: result.summary,
      count: scored.length,
    })
  } catch (e: any) {
    console.error('Discovery search error:', e)
    res.status(500).json({ error: 'Discovery search failed' })
  }
})

// ============================================================================
// POST /api/discovery/import — import selected VARs into database
// ============================================================================

router.post('/discovery/import', async (req: Request, res: Response) => {
  const { vars } = req.body

  if (!vars || !Array.isArray(vars) || vars.length === 0) {
    res.status(400).json({ error: 'vars array required' })
    return
  }

  try {
    const result = await importDiscoveredVars(vars)
    res.json(result)
  } catch (e: any) {
    console.error('Discovery import error:', e)
    res.status(500).json({ error: 'Import failed' })
  }
})

export default router
