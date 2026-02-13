import { create } from 'zustand'
import type { UnifiedVar } from '@shared/types'

interface DiscoveredVar {
  var: Partial<UnifiedVar>
  compositeScore: number
  selected: boolean
}

interface DiscoveryState {
  isOpen: boolean
  query: string
  results: DiscoveredVar[]
  summary: string
  loading: boolean
  error: string | null
  importStatus: { imported: number; errors: string[] } | null

  openDiscovery: () => void
  closeDiscovery: () => void
  setQuery: (query: string) => void
  search: () => Promise<void>
  toggleSelect: (name: string) => void
  selectAll: () => void
  deselectAll: () => void
  importSelected: () => Promise<void>
  clearResults: () => void
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  isOpen: false,
  query: '',
  results: [],
  summary: '',
  loading: false,
  error: null,
  importStatus: null,

  openDiscovery: () => set({ isOpen: true }),
  closeDiscovery: () => set({ isOpen: false }),
  setQuery: (query) => set({ query }),

  search: async () => {
    const { query } = get()
    if (!query.trim() || query.trim().length < 3) return

    set({ loading: true, error: null, results: [], summary: '', importStatus: null })

    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Search failed: ${res.statusText}`)
      }

      const data = await res.json()
      set({
        results: (data.results || []).map((r: any) => ({ ...r, selected: true })),
        summary: data.summary || '',
        loading: false,
      })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  toggleSelect: (name) =>
    set((s) => ({
      results: s.results.map((r) =>
        r.var.name === name ? { ...r, selected: !r.selected } : r
      ),
    })),

  selectAll: () =>
    set((s) => ({ results: s.results.map((r) => ({ ...r, selected: true })) })),

  deselectAll: () =>
    set((s) => ({ results: s.results.map((r) => ({ ...r, selected: false })) })),

  importSelected: async () => {
    const selected = get().results.filter((r) => r.selected)
    if (selected.length === 0) return

    set({ loading: true, error: null })

    try {
      const res = await fetch('/api/discovery/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vars: selected.map((r) => r.var) }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Import failed: ${res.statusText}`)
      }

      const data = await res.json()
      set({ importStatus: data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  clearResults: () =>
    set({ results: [], summary: '', error: null, importStatus: null }),
}))
