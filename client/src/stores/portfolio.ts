import { create } from "zustand";
import type {
  Company,
  Cohort,
  InvestmentGroup,
  Quadrant,
  Track,
  ValueTheme,
  PortfolioStats,
  QuadrantDistribution,
  TrackDistribution,
  CohortDistribution,
  ValueThemeDistribution,
} from "@shared/types";

// ============================================================================
// Computed Stats Helper
// ============================================================================

export function computeStats(companies: Company[]): PortfolioStats {
  const quadrantDistribution: QuadrantDistribution = {
    champion: 0,
    quickWin: 0,
    strategic: 0,
    foundation: 0,
  };

  const trackDistribution: TrackDistribution = { t1: 0, t2: 0, t3: 0 };

  const cohortDistribution: CohortDistribution = {
    industrial: 0,
    services: 0,
    consumer: 0,
    healthcare: 0,
    logistics: 0,
  };

  const valueThemeDistribution: ValueThemeDistribution = {
    revenueGrowth: 0,
    marginExpansion: 0,
    costCutting: 0,
  };

  let totalRevenue = 0;
  let totalEbitda = 0;
  let totalEbitdaOpportunity = 0;

  for (const c of companies) {
    totalRevenue += c.revenue;
    totalEbitda += c.ebitda;
    totalEbitdaOpportunity += c.adjustedEbitda;

    // Quadrant
    switch (c.quadrant) {
      case "Champion":
        quadrantDistribution.champion++;
        break;
      case "Quick Win":
        quadrantDistribution.quickWin++;
        break;
      case "Strategic":
        quadrantDistribution.strategic++;
        break;
      case "Foundation":
        quadrantDistribution.foundation++;
        break;
    }

    // Track
    switch (c.track) {
      case "T1":
        trackDistribution.t1++;
        break;
      case "T2":
        trackDistribution.t2++;
        break;
      case "T3":
        trackDistribution.t3++;
        break;
    }

    // Cohort
    switch (c.cohort) {
      case "Industrial":
        cohortDistribution.industrial++;
        break;
      case "Services":
        cohortDistribution.services++;
        break;
      case "Consumer":
        cohortDistribution.consumer++;
        break;
      case "Healthcare":
        cohortDistribution.healthcare++;
        break;
      case "Logistics":
        cohortDistribution.logistics++;
        break;
    }

    // Value Theme
    switch (c.valueTheme) {
      case "Revenue Growth":
        valueThemeDistribution.revenueGrowth++;
        break;
      case "Margin Expansion":
        valueThemeDistribution.marginExpansion++;
        break;
      case "Cost Cutting":
        valueThemeDistribution.costCutting++;
        break;
    }
  }

  return {
    totalCompanies: companies.length,
    totalRevenue,
    totalEbitda,
    totalEbitdaOpportunity,
    quadrantDistribution,
    trackDistribution,
    cohortDistribution,
    valueThemeDistribution,
  };
}

// ============================================================================
// Filter Types & Logic
// ============================================================================

export interface PortfolioFilters {
  selectedCohorts: Cohort[];
  selectedQuadrants: Quadrant[];
  selectedTracks: Track[];
  selectedInvestmentGroups: InvestmentGroup[];
  searchQuery: string;
}

const DEFAULT_FILTERS: PortfolioFilters = {
  selectedCohorts: [],
  selectedQuadrants: [],
  selectedTracks: [],
  selectedInvestmentGroups: [],
  searchQuery: "",
};

function applyFilters(
  companies: Company[],
  filters: PortfolioFilters
): Company[] {
  return companies.filter((c) => {
    if (
      filters.selectedCohorts.length > 0 &&
      !filters.selectedCohorts.includes(c.cohort)
    ) {
      return false;
    }
    if (
      filters.selectedQuadrants.length > 0 &&
      !filters.selectedQuadrants.includes(c.quadrant)
    ) {
      return false;
    }
    if (
      filters.selectedTracks.length > 0 &&
      !filters.selectedTracks.includes(c.track)
    ) {
      return false;
    }
    if (
      filters.selectedInvestmentGroups.length > 0 &&
      !filters.selectedInvestmentGroups.includes(c.investmentGroup)
    ) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.cohort.toLowerCase().includes(q) ||
        c.trackDescription.toLowerCase().includes(q) ||
        c.valueTheme.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

// ============================================================================
// Zustand Store
// ============================================================================

interface PortfolioState {
  // Data
  companies: Company[];
  stats: PortfolioStats;
  loading: boolean;
  error: string | null;

  // Selection
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;

  // Filters
  filters: PortfolioFilters;
  setFilter: <K extends keyof PortfolioFilters>(
    key: K,
    value: PortfolioFilters[K]
  ) => void;
  clearFilters: () => void;

  // Derived
  getFilteredCompanies: () => Company[];
  getFilteredStats: () => PortfolioStats;
  getTopCompanies: (count: number) => Company[];
  getCompaniesByQuadrant: (quadrant: Quadrant) => Company[];
  getCompaniesByTrack: (track: Track) => Company[];
  getCompaniesByValueTheme: (theme: ValueTheme) => Company[];
  getPlatformCount: () => number;
  getReplicationOpportunities: () => number;

  // What-if score updates (local only)
  updateCompanyScores: (
    rank: number,
    scores: Partial<Company["scores"]>
  ) => void;

  // API
  fetchCompanies: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Data
  companies: [],
  stats: computeStats([]),
  loading: false,
  error: null,

  // Selection
  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),

  // Filters
  filters: { ...DEFAULT_FILTERS },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // Derived getters
  getFilteredCompanies: () => {
    const { companies, filters } = get();
    return applyFilters(companies, filters);
  },

  getFilteredStats: () => {
    const filtered = get().getFilteredCompanies();
    return computeStats(filtered);
  },

  getTopCompanies: (count: number) => {
    return [...get().companies]
      .sort(
        (a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority
      )
      .slice(0, count);
  },

  getCompaniesByQuadrant: (quadrant: Quadrant) => {
    return get().companies.filter((c) => c.quadrant === quadrant);
  },

  getCompaniesByTrack: (track: Track) => {
    return get().companies.filter((c) => c.track === track);
  },

  getCompaniesByValueTheme: (theme: ValueTheme) => {
    return get().companies.filter((c) => c.valueTheme === theme);
  },

  getPlatformCount: () => {
    return get().companies.filter(
      (c) => c.platformClassification === "Platform"
    ).length;
  },

  getReplicationOpportunities: () => {
    return get().companies.reduce((sum, c) => sum + c.replicationCount, 0);
  },

  // What-if score updates
  updateCompanyScores: (rank, newScores) =>
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.rank !== rank) return c;
        return {
          ...c,
          scores: { ...c.scores, ...newScores },
        };
      });
      return { companies, stats: computeStats(companies) };
    }),

  // API
  fetchCompanies: async () => {
    if (get().companies.length > 0) return; // already loaded
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/portfolio/companies");
      if (!res.ok) throw new Error(`Failed to fetch companies: ${res.statusText}`);
      const data = await res.json();
      const companies: Company[] = data.companies;
      set({
        companies,
        stats: computeStats(companies),
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      console.error("Failed to fetch portfolio companies:", e);
    }
  },
}));
