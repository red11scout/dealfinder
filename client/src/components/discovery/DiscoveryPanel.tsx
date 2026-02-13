import { useState } from 'react'
import { HiX, HiSearch, HiCheck, HiDownload, HiSparkles } from 'react-icons/hi'
import { useDiscoveryStore } from '../../stores/discovery'
import { Badge } from '../shared/Badge'

export function DiscoveryPanel() {
  const {
    isOpen,
    query,
    results,
    summary,
    loading,
    error,
    importStatus,
    closeDiscovery,
    setQuery,
    search,
    toggleSelect,
    selectAll,
    deselectAll,
    importSelected,
    clearResults,
  } = useDiscoveryStore()

  const selectedCount = results.filter((r) => r.selected).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-background)] rounded-2xl shadow-2xl border border-[var(--color-border)]
        w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <HiSparkles className="w-5 h-5 text-navy" />
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              AI VAR Discovery
            </h2>
          </div>
          <button
            onClick={closeDiscovery}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)]
              hover:bg-[var(--color-subtle)] transition-all"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "VARs in Florida with cybersecurity focus" or "PE-backed MSPs in Texas"'
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-subtle)]
                px-4 py-2.5 text-sm text-[var(--color-foreground)]
                placeholder:text-[var(--color-muted)]
                focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/50"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 3}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-medium
                disabled:opacity-40 hover:bg-navy/90 transition-all shrink-0"
            >
              <HiSearch className="w-4 h-4" />
              Discover
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'VARs in Southeast with Cloud focus',
              'PE-backed MSPs over $100M revenue',
              'Cybersecurity VARs in Texas or Florida',
            ].map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); }}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)]
                  text-[var(--color-muted)] hover:text-[var(--color-foreground)]
                  hover:border-navy/30 hover:bg-[var(--color-subtle)] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-[var(--color-muted)]">Searching for VARs...</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">This may take 10-20 seconds</p>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {importStatus && (
            <div className="px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20
              border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm mb-4">
              <p className="font-medium">Imported {importStatus.imported} VARs successfully!</p>
              {importStatus.errors.length > 0 && (
                <p className="text-xs mt-1">Errors: {importStatus.errors.join('; ')}</p>
              )}
            </div>
          )}

          {!loading && summary && (
            <p className="text-xs text-[var(--color-muted)] mb-4 italic">{summary}</p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {/* Select controls */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">
                  {selectedCount} of {results.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-navy hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-[var(--color-muted)] hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Results list */}
              {results.map((r) => (
                <div
                  key={r.var.name}
                  onClick={() => toggleSelect(r.var.name!)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                    ${
                      r.selected
                        ? 'border-navy/30 bg-navy/5 dark:bg-navy/10'
                        : 'border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-subtle)]'
                    }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5
                      ${r.selected ? 'bg-navy border-navy' : 'border-[var(--color-border)]'}`}
                  >
                    {r.selected && <HiCheck className="w-3 h-3 text-white" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--color-foreground)]">
                        {r.var.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        Score: {r.compositeScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {r.var.hqCity}, {r.var.hqState} &middot; ${r.var.annualRevenue}M rev &middot;{' '}
                      {r.var.employeeCount} employees &middot; {r.var.ownershipType}
                    </p>
                    {r.var.description && (
                      <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">
                        {r.var.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(r.var.specialties ?? []).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-subtle)]
                            text-[var(--color-muted)] border border-[var(--color-border)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && !error && !summary && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HiSearch className="w-10 h-10 text-[var(--color-muted)] mb-3" />
              <p className="text-sm text-[var(--color-muted)]">
                Describe the type of VARs you're looking for
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                AI will identify potential acquisition targets matching your criteria
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && !importStatus && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex items-center justify-between">
            <button
              onClick={clearResults}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Clear Results
            </button>
            <button
              onClick={importSelected}
              disabled={selectedCount === 0 || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-green)] text-white text-sm font-medium
                disabled:opacity-40 hover:opacity-90 transition-all"
            >
              <HiDownload className="w-4 h-4" />
              Import {selectedCount} VAR{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
