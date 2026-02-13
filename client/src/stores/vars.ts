import { create } from "zustand";
import type { UnifiedVar } from "@shared/types";

// ============================================================================
// Filter Types
// ============================================================================

export interface VarFilters {
  searchQuery: string;
  ownershipType: string; // "" = all, or "VC" | "PE" | "Public" | "Private"
  revenueRange: string; // "" = all, or "0-100" | "100-1000" | "1000-5000" | "5000+"
  stateFilter: string; // "" = all, or state code
  specialtyFilter: string; // "" = all, or specialty name
}

const DEFAULT_FILTERS: VarFilters = {
  searchQuery: "",
  ownershipType: "",
  revenueRange: "",
  stateFilter: "",
  specialtyFilter: "",
};

// ============================================================================
// Filter Logic
// ============================================================================

function applyFilters(vars: UnifiedVar[], filters: VarFilters): UnifiedVar[] {
  return vars.filter((v) => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesSearch =
        v.name.toLowerCase().includes(q) ||
        v.hqCity.toLowerCase().includes(q) ||
        v.hqState.toLowerCase().includes(q) ||
        v.strategicSpecialty.toLowerCase().includes(q) ||
        (v.strategicFocus ?? "").toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.topVendors.some((vendor) => vendor.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Ownership type
    if (filters.ownershipType && v.ownershipType !== filters.ownershipType) {
      return false;
    }

    // Revenue range
    if (filters.revenueRange) {
      switch (filters.revenueRange) {
        case "0-100":
          if (v.annualRevenue > 100) return false;
          break;
        case "100-1000":
          if (v.annualRevenue <= 100 || v.annualRevenue > 1000) return false;
          break;
        case "1000-5000":
          if (v.annualRevenue <= 1000 || v.annualRevenue > 5000) return false;
          break;
        case "5000+":
          if (v.annualRevenue <= 5000) return false;
          break;
      }
    }

    // State filter
    if (filters.stateFilter && v.hqState !== filters.stateFilter) {
      return false;
    }

    // Specialty filter
    if (filters.specialtyFilter) {
      const matchSpec =
        v.strategicSpecialty
          .toLowerCase()
          .includes(filters.specialtyFilter.toLowerCase()) ||
        (v.specialties ?? []).some((s) =>
          s.toLowerCase().includes(filters.specialtyFilter.toLowerCase())
        );
      if (!matchSpec) return false;
    }

    return true;
  });
}

// ============================================================================
// Zustand Store
// ============================================================================

interface VarState {
  // Data
  vars: UnifiedVar[];
  loading: boolean;
  error: string | null;

  // Selection
  selectedVar: UnifiedVar | null;
  setSelectedVar: (v: UnifiedVar | null) => void;

  // Filters
  filters: VarFilters;
  setFilter: <K extends keyof VarFilters>(key: K, value: VarFilters[K]) => void;
  clearFilters: () => void;

  // Derived
  getFilteredVars: () => UnifiedVar[];
  getStats: () => {
    totalVars: number;
    totalRevenue: number;
    avgRevenue: number;
    totalEmployees: number;
  };

  // View
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;

  // Sort (for table view)
  sortField: keyof UnifiedVar;
  sortDirection: "asc" | "desc";
  setSortField: (field: keyof UnifiedVar) => void;

  // API
  fetchVars: () => Promise<void>;
}

export const useVarStore = create<VarState>((set, get) => ({
  // Data
  vars: [],
  loading: false,
  error: null,

  // Selection
  selectedVar: null,
  setSelectedVar: (v) => set({ selectedVar: v }),

  // Filters
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // Derived
  getFilteredVars: () => {
    const { vars, filters, sortField, sortDirection } = get();
    const filtered = applyFilters(vars, filters);
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  },

  getStats: () => {
    const filtered = get().getFilteredVars();
    const totalRevenue = filtered.reduce((sum, v) => sum + v.annualRevenue, 0);
    return {
      totalVars: filtered.length,
      totalRevenue,
      avgRevenue: filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0,
      totalEmployees: filtered.reduce((sum, v) => sum + v.employeeCount, 0),
    };
  },

  // View
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  // Sort
  sortField: "annualRevenue",
  sortDirection: "desc",
  setSortField: (field) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field && state.sortDirection === "desc"
          ? "asc"
          : "desc",
    })),

  // API
  fetchVars: async () => {
    if (get().vars.length > 0) return; // already loaded
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/vars");
      if (!res.ok) throw new Error(`Failed to fetch VARs: ${res.statusText}`);
      const data = await res.json();
      set({ vars: data.vars, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      console.error("Failed to fetch VARs:", e);
    }
  },
}));
