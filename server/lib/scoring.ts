import type { UnifiedVar, AcquisitionCriteria, VarScores, ScoredVar } from '@shared/types'

// ============================================================================
// Scoring Constants — BlueAlly Ideal Acquisition Profile
// ============================================================================

export const PREFERRED_STATES = ['NC', 'VA', 'GA', 'FL', 'TX', 'SC', 'MD', 'AL', 'TN', 'PA']
export const ADJACENT_STATES = ['NY', 'NJ', 'MA', 'CT', 'DE', 'WV', 'KY', 'MS', 'LA', 'OH', 'IN', 'IL']
export const PREFERRED_SPECIALTIES = ['Cloud', 'Cybersecurity', 'Managed Services']
export const PREFERRED_VENDORS = ['Microsoft', 'Cisco', 'Dell']

export const DEFAULT_CRITERIA: AcquisitionCriteria = {
  revenueFitWeight: 0.15,
  geographicFitWeight: 0.10,
  specialtyFitWeight: 0.20,
  cultureFitWeight: 0.10,
  customerOverlapWeight: 0.10,
  vendorSynergyWeight: 0.15,
  growthTrajectoryWeight: 0.10,
  marginProfileWeight: 0.10,
}

// ============================================================================
// Individual Scoring Functions (Deterministic)
// ============================================================================

export function scoreRevenueFit(revenue: number): number {
  if (revenue >= 100 && revenue <= 300) return 10
  if (revenue >= 50 && revenue < 100) return 7
  if (revenue > 300 && revenue <= 500) return 7
  if (revenue > 500 && revenue <= 800) return 5
  if (revenue > 800 && revenue <= 1000) return 4
  if (revenue >= 30 && revenue < 50) return 5
  return 3
}

export function scoreGeographicFit(state: string): number {
  if (PREFERRED_STATES.includes(state)) return 10
  if (ADJACENT_STATES.includes(state)) return 7
  return 4
}

export function scoreSpecialtyFit(specialties: string[]): number {
  const overlap = specialties.filter((s) => PREFERRED_SPECIALTIES.includes(s)).length
  if (overlap >= 3) return 10
  if (overlap === 2) return 8
  if (overlap === 1) return 5
  return 2
}

export function scoreCultureFit(ownership: string): number {
  if (ownership === 'PE' || ownership === 'PE-Backed') return 9
  if (ownership === 'Private') return 8
  if (ownership === 'ESOP') return 6
  return 4 // Public, VC
}

export function scoreCustomerOverlap(segment: string | null): number {
  if (!segment) return 6
  if (segment === 'Mid-Market') return 10
  if (segment === 'Mixed') return 8
  if (segment === 'Enterprise') return 6
  return 5 // SMB
}

export function scoreVendorSynergy(vendors: string[]): number {
  const overlap = vendors.filter((v) => PREFERRED_VENDORS.includes(v)).length
  if (overlap >= 3) return 10
  if (overlap === 2) return 8
  if (overlap === 1) return 5
  return 2
}

export function scoreGrowthTrajectory(growthRate: number | null): number {
  if (growthRate == null) return 5
  if (growthRate >= 20) return 10
  if (growthRate >= 15) return 9
  if (growthRate >= 10) return 7
  if (growthRate >= 5) return 5
  return 3
}

export function scoreMarginProfile(ebitdaMargin: number | null): number {
  if (ebitdaMargin == null) return 5
  if (ebitdaMargin >= 18) return 10
  if (ebitdaMargin >= 15) return 9
  if (ebitdaMargin >= 12) return 7
  if (ebitdaMargin >= 10) return 6
  if (ebitdaMargin >= 8) return 4
  return 3
}

// ============================================================================
// Composite Scoring
// ============================================================================

export function scoreVar(v: UnifiedVar): VarScores {
  const specialties = v.specialties ?? []
  return {
    revenueFit: scoreRevenueFit(v.annualRevenue),
    geographicFit: scoreGeographicFit(v.hqState),
    specialtyFit: scoreSpecialtyFit(specialties),
    cultureFit: scoreCultureFit(v.ownershipType),
    customerOverlap: scoreCustomerOverlap(v.customerSegment),
    vendorSynergy: scoreVendorSynergy(v.topVendors),
    growthTrajectory: scoreGrowthTrajectory(v.growthRate),
    marginProfile: scoreMarginProfile(v.ebitdaMargin),
  }
}

export function computeComposite(scores: VarScores, criteria: AcquisitionCriteria): number {
  return (
    scores.revenueFit * criteria.revenueFitWeight +
    scores.geographicFit * criteria.geographicFitWeight +
    scores.specialtyFit * criteria.specialtyFitWeight +
    scores.cultureFit * criteria.cultureFitWeight +
    scores.customerOverlap * criteria.customerOverlapWeight +
    scores.vendorSynergy * criteria.vendorSynergyWeight +
    scores.growthTrajectory * criteria.growthTrajectoryWeight +
    scores.marginProfile * criteria.marginProfileWeight
  )
}

// ============================================================================
// Hemingway-Style Reasoning Generator
// ============================================================================

export function generateReasoning(sv: ScoredVar): string {
  const v = sv.var
  const s = sv.scores

  const strengths: string[] = []
  const concerns: string[] = []

  if (s.revenueFit >= 8) strengths.push(`revenue of $${v.annualRevenue}M sits in the sweet spot`)
  if (s.geographicFit >= 8) strengths.push(`${v.hqCity}, ${v.hqState} is home turf`)
  if (s.specialtyFit >= 8) strengths.push('specialty alignment is strong')
  if (s.vendorSynergy >= 8) strengths.push('vendor partnerships overlap well')
  if (s.growthTrajectory >= 8 && v.growthRate) strengths.push(`${v.growthRate}% growth shows momentum`)
  if (s.marginProfile >= 8 && v.ebitdaMargin) strengths.push(`${v.ebitdaMargin}% EBITDA margins are healthy`)
  if (s.cultureFit >= 8) strengths.push(`${v.ownershipType.toLowerCase()} ownership makes integration simpler`)
  if (s.customerOverlap >= 8 && v.customerSegment) strengths.push(`${v.customerSegment.toLowerCase()} customer base matches BlueAlly`)

  if (s.revenueFit <= 4) concerns.push('revenue size is a stretch')
  if (s.geographicFit <= 4) concerns.push('geography adds complexity')
  if (s.marginProfile <= 5) concerns.push('margins need work')
  if (s.growthTrajectory <= 4) concerns.push('growth has stalled')

  const strengthText =
    strengths.length > 0
      ? `${strengths.slice(0, 3).join(', ')}`
      : 'several dimensions look promising'

  const concernText = concerns.length > 0 ? ` Watch the ${concerns[0]}.` : ''

  return `${v.name} makes sense. The ${strengthText}. Composite score of ${sv.compositeScore.toFixed(1)} puts them at #${sv.rank}.${concernText} The numbers tell the story.`
}

// ============================================================================
// Score Explanation Generator (McKinsey/BCG style)
// ============================================================================

export function generateScoreExplanation(sv: ScoredVar, criteria: AcquisitionCriteria) {
  const v = sv.var
  const s = sv.scores

  const dimensions = [
    { key: 'revenueFit', label: 'Revenue Fit', score: s.revenueFit, weight: criteria.revenueFitWeight },
    { key: 'geographicFit', label: 'Geographic Fit', score: s.geographicFit, weight: criteria.geographicFitWeight },
    { key: 'specialtyFit', label: 'Specialty Fit', score: s.specialtyFit, weight: criteria.specialtyFitWeight },
    { key: 'cultureFit', label: 'Culture Fit', score: s.cultureFit, weight: criteria.cultureFitWeight },
    { key: 'customerOverlap', label: 'Customer Overlap', score: s.customerOverlap, weight: criteria.customerOverlapWeight },
    { key: 'vendorSynergy', label: 'Vendor Synergy', score: s.vendorSynergy, weight: criteria.vendorSynergyWeight },
    { key: 'growthTrajectory', label: 'Growth Trajectory', score: s.growthTrajectory, weight: criteria.growthTrajectoryWeight },
    { key: 'marginProfile', label: 'Margin Profile', score: s.marginProfile, weight: criteria.marginProfileWeight },
  ]

  const reasoningMap: Record<string, (score: number) => string> = {
    revenueFit: (score) =>
      score >= 8
        ? `Revenue of $${v.annualRevenue}M falls in the ideal $100-300M sweet spot for tuck-in acquisitions`
        : score >= 5
          ? `Revenue of $${v.annualRevenue}M is within range but not in the ideal band`
          : `Revenue of $${v.annualRevenue}M is outside the preferred acquisition range`,
    geographicFit: (score) =>
      score >= 8
        ? `HQ in ${v.hqState} is within BlueAlly's core Southeast/Mid-Atlantic footprint`
        : score >= 7
          ? `${v.hqState} is in an adjacent market — reachable but not core geography`
          : `${v.hqState} adds geographic complexity to integration`,
    specialtyFit: (score) =>
      score >= 8
        ? `Strong alignment with Cloud, Cybersecurity, and Managed Services priorities`
        : score >= 5
          ? `Partial specialty alignment — some capability gaps to address`
          : `Limited specialty overlap with BlueAlly's core capabilities`,
    cultureFit: (score) =>
      score >= 8
        ? `${v.ownershipType} ownership structure simplifies acquisition dynamics`
        : score >= 6
          ? `${v.ownershipType} ownership is workable but may add negotiation complexity`
          : `Public ownership introduces regulatory and premium considerations`,
    customerOverlap: (score) =>
      score >= 8
        ? `${v.customerSegment || 'Mid-Market'} customer base aligns with BlueAlly's target market`
        : score >= 6
          ? `Customer mix has some alignment but serves different primary segments`
          : `Customer base skews toward segments outside BlueAlly's core`,
    vendorSynergy: (score) =>
      score >= 8
        ? `Strong vendor overlap with Microsoft, Cisco, Dell — integration accelerators`
        : score >= 5
          ? `Some vendor partnerships align — potential for incremental synergies`
          : `Limited vendor overlap — would add new but unfamiliar partnerships`,
    growthTrajectory: (score) =>
      score >= 8
        ? `${v.growthRate ?? 'N/A'}% YoY growth demonstrates strong market momentum`
        : score >= 5
          ? `Growth rate of ${v.growthRate ?? 'N/A'}% is steady but not exceptional`
          : `Growth has slowed — may indicate market saturation or operational issues`,
    marginProfile: (score) =>
      score >= 8
        ? `${v.ebitdaMargin ?? 'N/A'}% EBITDA margin reflects healthy unit economics`
        : score >= 5
          ? `Margins of ${v.ebitdaMargin ?? 'N/A'}% are acceptable but leave room for improvement`
          : `Thin margins suggest operational inefficiencies or competitive pressure`,
  }

  const breakdown = dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
    weight: d.weight,
    contribution: Math.round(d.score * d.weight * 100) / 100,
    reasoning: reasoningMap[d.key](d.score),
  }))

  const strengths = breakdown.filter((b) => b.score >= 8).map((b) => b.reasoning)
  const concerns = breakdown.filter((b) => b.score <= 5).map((b) => b.reasoning)

  return {
    summary: `Composite score: ${sv.compositeScore.toFixed(1)} (#${sv.rank} rank)`,
    breakdown,
    strengths,
    concerns,
    dataSources: v.dataSources ?? ['Company website', 'Industry reports'],
  }
}

// ============================================================================
// Compute & Rank All VARs
// ============================================================================

export function computeAllScores(allVars: UnifiedVar[], criteria: AcquisitionCriteria): ScoredVar[] {
  const scored = allVars.map((v) => {
    const scores = scoreVar(v)
    const compositeScore = Math.round(computeComposite(scores, criteria) * 10) / 10
    return { var: v, scores, compositeScore, rank: 0, reasoning: '' }
  })

  scored.sort((a, b) => b.compositeScore - a.compositeScore)
  scored.forEach((sv, i) => {
    sv.rank = i + 1
    if (i < 10) {
      sv.reasoning = generateReasoning(sv)
    }
  })

  return scored
}
