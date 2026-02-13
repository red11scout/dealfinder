import { useState, useEffect } from 'react'
import { HiX } from 'react-icons/hi'
import type { ScoredVar } from '@shared/types'

interface ScoreBreakdownProps {
  scoredVar: ScoredVar
  onClose: () => void
}

const DIMENSIONS = [
  { key: 'revenueFit', label: 'Revenue Fit' },
  { key: 'geographicFit', label: 'Geographic Fit' },
  { key: 'specialtyFit', label: 'Specialty Fit' },
  { key: 'cultureFit', label: 'Culture Fit' },
  { key: 'customerOverlap', label: 'Customer Overlap' },
  { key: 'vendorSynergy', label: 'Vendor Synergy' },
  { key: 'growthTrajectory', label: 'Growth Trajectory' },
  { key: 'marginProfile', label: 'Margin Profile' },
] as const

function barColor(score: number): string {
  if (score >= 8) return 'bg-[var(--color-green)]'
  if (score >= 6) return 'bg-[var(--color-blue)]'
  if (score >= 4) return 'bg-amber-500'
  return 'bg-red-500'
}

function textColor(score: number): string {
  if (score >= 8) return 'text-[var(--color-green)]'
  if (score >= 6) return 'text-[var(--color-blue)]'
  if (score >= 4) return 'text-amber-500'
  return 'text-red-500'
}

interface ExplanationData {
  summary: string
  breakdown: {
    dimension: string
    score: number
    weight: number
    contribution: number
    reasoning: string
  }[]
  strengths: string[]
  concerns: string[]
}

export function ScoreBreakdown({ scoredVar, onClose }: ScoreBreakdownProps) {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ma/rankings/${scoredVar.var.id}/explanation`)
      .then((r) => r.json())
      .then((data) => {
        setExplanation(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [scoredVar.var.id])

  const sv = scoredVar

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-background)] rounded-2xl shadow-2xl border border-[var(--color-border)]
        w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              {sv.var.name}
            </h2>
            <p className="text-xs text-[var(--color-muted)]">
              Rank #{sv.rank} &middot; Composite: {sv.compositeScore.toFixed(1)}/10
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)]
              hover:bg-[var(--color-subtle)] transition-all"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Score bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
              Dimension Scores
            </h3>
            {DIMENSIONS.map((dim) => {
              const score = sv.scores[dim.key]
              const bd = explanation?.breakdown?.find((b) => b.dimension === dim.label)
              return (
                <div key={dim.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-foreground)]">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      {bd && (
                        <span className="text-[10px] text-[var(--color-muted)]">
                          ({bd.weight * 100}% &times; {score} = {bd.contribution.toFixed(1)})
                        </span>
                      )}
                      <span className={`text-sm font-bold ${textColor(score)}`}>{score}/10</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-subtle)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(score)} transition-all`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                  {bd && (
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">{bd.reasoning}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Strengths & Concerns */}
          {explanation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {explanation.strengths.length > 0 && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {explanation.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-green-800 dark:text-green-300 flex gap-1.5">
                        <span className="shrink-0">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {explanation.concerns.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                    Concerns
                  </h4>
                  <ul className="space-y-1">
                    {explanation.concerns.map((c, i) => (
                      <li key={i} className="text-xs text-red-800 dark:text-red-300 flex gap-1.5">
                        <span className="shrink-0">!</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-[var(--color-muted)]">Loading analysis...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
