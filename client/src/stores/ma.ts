import { create } from "zustand";
import type {
  UnifiedVar,
  AcquisitionCriteria,
  VarScores,
  ScoredVar,
} from "@shared/types";

// ============================================================================
// Default Criteria Weights (sum to 1.0)
// ============================================================================

const DEFAULT_CRITERIA: AcquisitionCriteria = {
  revenueFitWeight: 0.15,
  geographicFitWeight: 0.10,
  specialtyFitWeight: 0.20,
  cultureFitWeight: 0.10,
  customerOverlapWeight: 0.10,
  vendorSynergyWeight: 0.15,
  growthTrajectoryWeight: 0.10,
  marginProfileWeight: 0.10,
};

// ============================================================================
// Client-Side Scoring (for instant weight tuning responsiveness)
// ============================================================================

const PREFERRED_STATES = ["NC", "VA", "GA", "FL", "TX", "SC", "MD", "AL", "TN", "PA"];
const ADJACENT_STATES = ["NY", "NJ", "MA", "CT", "DE", "WV", "KY", "MS", "LA", "OH", "IN", "IL"];
const PREFERRED_SPECIALTIES = ["Cloud", "Cybersecurity", "Managed Services"];
const PREFERRED_VENDORS = ["Microsoft", "Cisco", "Dell"];

function scoreRevenueFit(revenue: number): number {
  if (revenue >= 100 && revenue <= 300) return 10;
  if (revenue >= 50 && revenue < 100) return 7;
  if (revenue > 300 && revenue <= 500) return 7;
  if (revenue > 500 && revenue <= 800) return 5;
  if (revenue > 800 && revenue <= 1000) return 4;
  if (revenue >= 30 && revenue < 50) return 5;
  return 3;
}

function scoreGeographicFit(state: string): number {
  if (PREFERRED_STATES.includes(state)) return 10;
  if (ADJACENT_STATES.includes(state)) return 7;
  return 4;
}

function scoreSpecialtyFit(specialties: string[]): number {
  const overlap = specialties.filter((s) => PREFERRED_SPECIALTIES.includes(s)).length;
  if (overlap >= 3) return 10;
  if (overlap === 2) return 8;
  if (overlap === 1) return 5;
  return 2;
}

function scoreCultureFit(ownership: string): number {
  if (ownership === "PE" || ownership === "PE-Backed") return 9;
  if (ownership === "Private") return 8;
  if (ownership === "ESOP") return 6;
  return 4; // Public, VC
}

function scoreCustomerOverlap(segment: string | null): number {
  if (!segment) return 6;
  if (segment === "Mid-Market") return 10;
  if (segment === "Mixed") return 8;
  if (segment === "Enterprise") return 6;
  return 5; // SMB
}

function scoreVendorSynergy(vendors: string[]): number {
  const overlap = vendors.filter((v) => PREFERRED_VENDORS.includes(v)).length;
  if (overlap >= 3) return 10;
  if (overlap === 2) return 8;
  if (overlap === 1) return 5;
  return 2;
}

function scoreGrowthTrajectory(growthRate: number | null): number {
  if (growthRate == null) return 5;
  if (growthRate >= 20) return 10;
  if (growthRate >= 15) return 9;
  if (growthRate >= 10) return 7;
  if (growthRate >= 5) return 5;
  return 3;
}

function scoreMarginProfile(ebitdaMargin: number | null): number {
  if (ebitdaMargin == null) return 5;
  if (ebitdaMargin >= 18) return 10;
  if (ebitdaMargin >= 15) return 9;
  if (ebitdaMargin >= 12) return 7;
  if (ebitdaMargin >= 10) return 6;
  if (ebitdaMargin >= 8) return 4;
  return 3;
}

function scoreVar(v: UnifiedVar): VarScores {
  const specialties = v.specialties ?? [];
  return {
    revenueFit: scoreRevenueFit(v.annualRevenue),
    geographicFit: scoreGeographicFit(v.hqState),
    specialtyFit: scoreSpecialtyFit(specialties),
    cultureFit: scoreCultureFit(v.ownershipType),
    customerOverlap: scoreCustomerOverlap(v.customerSegment),
    vendorSynergy: scoreVendorSynergy(v.topVendors),
    growthTrajectory: scoreGrowthTrajectory(v.growthRate),
    marginProfile: scoreMarginProfile(v.ebitdaMargin),
  };
}

function computeComposite(scores: VarScores, criteria: AcquisitionCriteria): number {
  return (
    scores.revenueFit * criteria.revenueFitWeight +
    scores.geographicFit * criteria.geographicFitWeight +
    scores.specialtyFit * criteria.specialtyFitWeight +
    scores.cultureFit * criteria.cultureFitWeight +
    scores.customerOverlap * criteria.customerOverlapWeight +
    scores.vendorSynergy * criteria.vendorSynergyWeight +
    scores.growthTrajectory * criteria.growthTrajectoryWeight +
    scores.marginProfile * criteria.marginProfileWeight
  );
}

function generateReasoning(sv: ScoredVar): string {
  const v = sv.var;
  const s = sv.scores;

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (s.revenueFit >= 8) strengths.push(`revenue of $${v.annualRevenue}M sits in the sweet spot`);
  if (s.geographicFit >= 8) strengths.push(`${v.hqCity}, ${v.hqState} is home turf`);
  if (s.specialtyFit >= 8) strengths.push("specialty alignment is strong");
  if (s.vendorSynergy >= 8) strengths.push("vendor partnerships overlap well");
  if (s.growthTrajectory >= 8 && v.growthRate) strengths.push(`${v.growthRate}% growth shows momentum`);
  if (s.marginProfile >= 8 && v.ebitdaMargin) strengths.push(`${v.ebitdaMargin}% EBITDA margins are healthy`);
  if (s.cultureFit >= 8) strengths.push(`${v.ownershipType.toLowerCase()} ownership makes integration simpler`);
  if (s.customerOverlap >= 8 && v.customerSegment) strengths.push(`${v.customerSegment.toLowerCase()} customer base matches BlueAlly`);

  if (s.revenueFit <= 4) concerns.push("revenue size is a stretch");
  if (s.geographicFit <= 4) concerns.push("geography adds complexity");
  if (s.marginProfile <= 5) concerns.push("margins need work");
  if (s.growthTrajectory <= 4) concerns.push("growth has stalled");

  const strengthText = strengths.length > 0
    ? `${strengths.slice(0, 3).join(", ")}`
    : "several dimensions look promising";

  const concernText = concerns.length > 0
    ? ` Watch the ${concerns[0]}.`
    : "";

  return `${v.name} makes sense. The ${strengthText}. Composite score of ${sv.compositeScore.toFixed(1)} puts them at #${sv.rank}.${concernText} The numbers tell the story.`;
}

function computeAllScores(vars: UnifiedVar[], criteria: AcquisitionCriteria): ScoredVar[] {
  const scored = vars.map((v) => {
    const scores = scoreVar(v);
    const compositeScore = Math.round(computeComposite(scores, criteria) * 10) / 10;
    return { var: v, scores, compositeScore, rank: 0, reasoning: "" };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  scored.forEach((sv, i) => {
    sv.rank = i + 1;
    if (i < 10) {
      sv.reasoning = generateReasoning(sv);
    }
  });

  return scored;
}

// ============================================================================
// Zustand Store
// ============================================================================

interface MaState {
  acquisitionCriteria: AcquisitionCriteria;
  scoredVars: ScoredVar[];
  topTen: ScoredVar[];
  selectedCandidate: ScoredVar | null;
  comparisonIds: number[];
  loading: boolean;
  error: string | null;
  allVars: UnifiedVar[];

  // Actions
  updateCriteriaWeight: (key: keyof AcquisitionCriteria, value: number) => void;
  recalculateScores: () => void;
  setSelectedCandidate: (candidate: ScoredVar | null) => void;
  toggleComparison: (varId: number) => void;
  clearComparison: () => void;
  fetchRankings: () => Promise<void>;
}

export const useMaStore = create<MaState>((set, get) => ({
  acquisitionCriteria: { ...DEFAULT_CRITERIA },
  scoredVars: [],
  topTen: [],
  selectedCandidate: null,
  comparisonIds: [],
  loading: false,
  error: null,
  allVars: [],

  updateCriteriaWeight: (key, value) => {
    set((state) => ({
      acquisitionCriteria: {
        ...state.acquisitionCriteria,
        [key]: value,
      },
    }));
  },

  recalculateScores: () => {
    const { allVars, acquisitionCriteria } = get();
    if (allVars.length === 0) return;
    const recalculated = computeAllScores(allVars, acquisitionCriteria);
    set({
      scoredVars: recalculated,
      topTen: recalculated.slice(0, 10),
    });
  },

  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),

  toggleComparison: (varId) => {
    set((state) => {
      const exists = state.comparisonIds.includes(varId);
      if (exists) {
        return { comparisonIds: state.comparisonIds.filter((id) => id !== varId) };
      }
      if (state.comparisonIds.length >= 3) return state;
      return { comparisonIds: [...state.comparisonIds, varId] };
    });
  },

  clearComparison: () => set({ comparisonIds: [] }),

  fetchRankings: async () => {
    if (get().allVars.length > 0) return; // already loaded
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/ma/rankings");
      if (!res.ok) throw new Error(`Failed to fetch rankings: ${res.statusText}`);
      const data = await res.json();

      // Store the raw VARs for client-side recalculation on weight changes
      const rawVars: UnifiedVar[] = data.rankings.map((sv: ScoredVar) => sv.var);

      set({
        scoredVars: data.rankings,
        topTen: data.rankings.slice(0, 10),
        acquisitionCriteria: data.criteria,
        allVars: rawVars,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      console.error("Failed to fetch M&A rankings:", e);
    }
  },
}));
