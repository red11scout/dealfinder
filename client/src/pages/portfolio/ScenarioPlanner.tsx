import { useState, useMemo, useCallback } from "react";
import { usePortfolioStore } from "../../stores/portfolio";
import { Card, Badge, Button, SearchBar } from "../../components/shared";
import {
  calculateValueScore,
  calculateReadinessScore,
  calculateAdjustedEbitda,
  calculatePriorityScore,
  determineQuadrant,
  formatCurrency,
  formatNumber,
} from "../../lib/calculations";
import type { Company, CompanyScores, Cohort, Quadrant } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const COHORTS: Cohort[] = [
  "Industrial",
  "Services",
  "Consumer",
  "Healthcare",
  "Logistics",
];

const QUADRANT_BADGE_VARIANT: Record<Quadrant, "green" | "blue" | "navy" | "gray"> = {
  Champion: "green",
  "Quick Win": "blue",
  Strategic: "navy",
  Foundation: "gray",
};

// ============================================================================
// Types
// ============================================================================

interface ScenarioScores {
  ebitdaImpact: number;
  revenueEnablement: number;
  riskReduction: number;
  orgCapacity: number;
  dataReadiness: number;
  techInfrastructure: number;
  timelineFit: number;
}

interface CohortAdjustment {
  cohort: Cohort | null;
  dimension: keyof ScenarioScores;
  delta: number;
}

// ============================================================================
// Slider Component
// ============================================================================

function ScoreSlider({
  label,
  value,
  originalValue,
  onChange,
  min = 1,
  max = 10,
  step = 0.5,
}: {
  label: string;
  value: number;
  originalValue: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const delta = value - originalValue;
  const deltaColor =
    delta > 0
      ? "text-[var(--color-green)]"
      : delta < 0
        ? "text-red-500"
        : "text-[var(--color-muted)]";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-foreground)]">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-muted)]">
            was {originalValue.toFixed(1)}
          </span>
          <span className="text-sm font-bold text-[var(--color-foreground)] w-10 text-right">
            {value.toFixed(1)}
          </span>
          {delta !== 0 && (
            <span className={`text-xs font-medium ${deltaColor} w-12 text-right`}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer
          bg-[var(--color-border)]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--color-blue)]
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:hover:scale-125
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[var(--color-blue)]
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[var(--color-muted)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Delta Display Component
// ============================================================================

function DeltaValue({
  label,
  before,
  after,
  format = "number",
}: {
  label: string;
  before: number;
  after: number;
  format?: "number" | "currency" | "score";
}) {
  const delta = after - before;
  const deltaColor =
    delta > 0
      ? "text-[var(--color-green)]"
      : delta < 0
        ? "text-red-500"
        : "text-[var(--color-muted)]";

  const fmt = (v: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(v);
      case "score":
        return v.toFixed(2);
      default:
        return formatNumber(v);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-b-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-muted)] line-through">
          {fmt(before)}
        </span>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">
          {fmt(after)}
        </span>
        <span className={`text-xs font-medium ${deltaColor} min-w-[60px] text-right`}>
          {delta > 0 ? "+" : ""}
          {fmt(delta)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ScenarioPlanner() {
  const { companies, getTopCompanies } = usePortfolioStore();

  // Company selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Individual company score adjustments
  const [scenarioScores, setScenarioScores] = useState<ScenarioScores | null>(null);

  // Cohort what-if
  const [cohortAdjustment, setCohortAdjustment] = useState<CohortAdjustment>({
    cohort: null,
    dimension: "dataReadiness",
    delta: 0,
  });

  // Top 10 for quick-select
  const topCompanies = useMemo(() => getTopCompanies(10), [companies]);

  // Filter companies by search
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cohort.toLowerCase().includes(q)
    );
  }, [searchQuery, companies]);

  // Select a company
  const handleSelectCompany = useCallback(
    (company: Company) => {
      setSelectedCompany(company);
      setSearchQuery("");
      setScenarioScores({
        ebitdaImpact: company.scores.ebitdaImpact,
        revenueEnablement: company.scores.revenueEnablement,
        riskReduction: company.scores.riskReduction,
        orgCapacity: company.scores.orgCapacity,
        dataReadiness: company.scores.dataReadiness,
        techInfrastructure: company.scores.techInfrastructure,
        timelineFit: company.scores.timelineFit,
      });
    },
    []
  );

  // Update a single score dimension
  const handleScoreChange = useCallback(
    (key: keyof ScenarioScores, value: number) => {
      setScenarioScores((prev) => (prev ? { ...prev, [key]: value } : null));
    },
    []
  );

  // Computed scenario results for individual company
  const scenarioResult = useMemo(() => {
    if (!selectedCompany || !scenarioScores) return null;

    const orig = selectedCompany.scores;

    const newValueScore = calculateValueScore(
      scenarioScores.ebitdaImpact,
      scenarioScores.revenueEnablement,
      scenarioScores.riskReduction
    );
    const newReadinessScore = calculateReadinessScore(
      scenarioScores.orgCapacity,
      scenarioScores.dataReadiness,
      scenarioScores.techInfrastructure,
      scenarioScores.timelineFit
    );
    const newQuadrant = determineQuadrant(newValueScore, newReadinessScore);
    const newAdjustedEbitda = calculateAdjustedEbitda(
      selectedCompany.ebitda,
      newValueScore
    );
    const newPriorityScore = calculatePriorityScore(
      selectedCompany.ebitda,
      newValueScore,
      newReadinessScore
    );

    return {
      original: {
        valueScore: orig.valueScore,
        readinessScore: orig.readinessScore,
        quadrant: selectedCompany.quadrant,
        adjustedEbitda: selectedCompany.adjustedEbitda,
        priorityScore: orig.priorityScore,
      },
      scenario: {
        valueScore: newValueScore,
        readinessScore: newReadinessScore,
        quadrant: newQuadrant,
        adjustedEbitda: newAdjustedEbitda,
        priorityScore: newPriorityScore,
      },
    };
  }, [selectedCompany, scenarioScores]);

  // Cohort what-if analysis
  const cohortResult = useMemo(() => {
    if (!cohortAdjustment.cohort || cohortAdjustment.delta === 0) return null;

    const cohortCompanies = companies.filter(
      (c) => c.cohort === cohortAdjustment.cohort
    );

    let quadrantChanges = 0;
    let totalOriginalEbitda = 0;
    let totalNewEbitda = 0;

    const beforeQuadrants: Record<Quadrant, number> = {
      Champion: 0,
      "Quick Win": 0,
      Strategic: 0,
      Foundation: 0,
    };
    const afterQuadrants: Record<Quadrant, number> = {
      Champion: 0,
      "Quick Win": 0,
      Strategic: 0,
      Foundation: 0,
    };

    for (const c of cohortCompanies) {
      const adjustedScore = Math.max(
        1,
        Math.min(10, c.scores[cohortAdjustment.dimension] + cohortAdjustment.delta)
      );

      // Build new scores with the adjustment
      const newScores: ScenarioScores = {
        ebitdaImpact: c.scores.ebitdaImpact,
        revenueEnablement: c.scores.revenueEnablement,
        riskReduction: c.scores.riskReduction,
        orgCapacity: c.scores.orgCapacity,
        dataReadiness: c.scores.dataReadiness,
        techInfrastructure: c.scores.techInfrastructure,
        timelineFit: c.scores.timelineFit,
      };
      newScores[cohortAdjustment.dimension] = adjustedScore;

      const newValueScore = calculateValueScore(
        newScores.ebitdaImpact,
        newScores.revenueEnablement,
        newScores.riskReduction
      );
      const newReadinessScore = calculateReadinessScore(
        newScores.orgCapacity,
        newScores.dataReadiness,
        newScores.techInfrastructure,
        newScores.timelineFit
      );
      const newQuadrant = determineQuadrant(newValueScore, newReadinessScore);
      const newAdjustedEbitda = calculateAdjustedEbitda(c.ebitda, newValueScore);

      beforeQuadrants[c.quadrant]++;
      afterQuadrants[newQuadrant]++;

      if (newQuadrant !== c.quadrant) {
        quadrantChanges++;
      }

      totalOriginalEbitda += c.adjustedEbitda;
      totalNewEbitda += newAdjustedEbitda;
    }

    return {
      companyCount: cohortCompanies.length,
      quadrantChanges,
      totalOriginalEbitda,
      totalNewEbitda,
      ebitdaDelta: totalNewEbitda - totalOriginalEbitda,
      beforeQuadrants,
      afterQuadrants,
    };
  }, [cohortAdjustment, companies]);

  // Reset all modifications
  const handleReset = useCallback(() => {
    if (selectedCompany) {
      setScenarioScores({
        ebitdaImpact: selectedCompany.scores.ebitdaImpact,
        revenueEnablement: selectedCompany.scores.revenueEnablement,
        riskReduction: selectedCompany.scores.riskReduction,
        orgCapacity: selectedCompany.scores.orgCapacity,
        dataReadiness: selectedCompany.scores.dataReadiness,
        techInfrastructure: selectedCompany.scores.techInfrastructure,
        timelineFit: selectedCompany.scores.timelineFit,
      });
    }
    setCohortAdjustment({ cohort: null, dimension: "dataReadiness", delta: 0 });
  }, [selectedCompany]);

  // Save scenario placeholder
  const handleSave = useCallback(() => {
    alert("Scenario saved. (Placeholder -- persistence not yet implemented.)");
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Section 1: Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          Scenario Planner
        </h1>
        <p className="mt-2 text-[var(--color-muted)] text-sm italic">
          "Change the numbers. Watch the story change. That is the power of what-if."
        </p>
      </div>

      {/* Two-column layout: controls (left) + preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Controls                                        */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* Section 2: Company Selector */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
              Select a Company
            </h2>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name or cohort..."
            />

            {/* Search results dropdown */}
            {filteredCompanies.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
                {filteredCompanies.map((c) => (
                  <button
                    key={c.rank}
                    onClick={() => handleSelectCompany(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-subtle)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <span className="text-sm font-medium text-[var(--color-foreground)]">
                      {c.name}
                    </span>
                    <span className="text-xs text-[var(--color-muted)] ml-2">
                      {c.cohort} &middot; {formatCurrency(c.ebitda)}M EBITDA
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick-select top 10 */}
            <div className="mt-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Top 10 by Portfolio Priority
              </p>
              <div className="flex flex-wrap gap-2">
                {topCompanies.map((c) => (
                  <button
                    key={c.rank}
                    onClick={() => handleSelectCompany(c)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                      ${
                        selectedCompany?.rank === c.rank
                          ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)]"
                          : "bg-[var(--color-card)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
                      }
                    `}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected company summary */}
            {selectedCompany && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-[var(--color-foreground)]">
                    {selectedCompany.name}
                  </h3>
                  <Badge
                    label={selectedCompany.quadrant}
                    variant={QUADRANT_BADGE_VARIANT[selectedCompany.quadrant]}
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Cohort</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {selectedCompany.cohort}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">EBITDA</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      ${selectedCompany.ebitda}M
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Revenue</p>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      ${selectedCompany.revenue}M
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Section 3: Score Adjustment Panel */}
          {selectedCompany && scenarioScores && (
            <Card>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                Adjust Scores
              </h2>

              {/* Value Components */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--color-navy)] uppercase tracking-wider">
                    Value Components
                  </h3>
                  {scenarioResult && (
                    <span className="text-sm font-bold text-[var(--color-navy)]">
                      Value: {scenarioResult.scenario.valueScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <ScoreSlider
                    label="EBITDA Impact"
                    value={scenarioScores.ebitdaImpact}
                    originalValue={selectedCompany.scores.ebitdaImpact}
                    onChange={(v) => handleScoreChange("ebitdaImpact", v)}
                  />
                  <ScoreSlider
                    label="Revenue Enablement"
                    value={scenarioScores.revenueEnablement}
                    originalValue={selectedCompany.scores.revenueEnablement}
                    onChange={(v) => handleScoreChange("revenueEnablement", v)}
                  />
                  <ScoreSlider
                    label="Risk Reduction"
                    value={scenarioScores.riskReduction}
                    originalValue={selectedCompany.scores.riskReduction}
                    onChange={(v) => handleScoreChange("riskReduction", v)}
                  />
                </div>
              </div>

              {/* Readiness Components */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--color-blue)] uppercase tracking-wider">
                    Readiness Components
                  </h3>
                  {scenarioResult && (
                    <span className="text-sm font-bold text-[var(--color-blue)]">
                      Readiness: {scenarioResult.scenario.readinessScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <ScoreSlider
                    label="Organizational Capacity"
                    value={scenarioScores.orgCapacity}
                    originalValue={selectedCompany.scores.orgCapacity}
                    onChange={(v) => handleScoreChange("orgCapacity", v)}
                  />
                  <ScoreSlider
                    label="Data Readiness"
                    value={scenarioScores.dataReadiness}
                    originalValue={selectedCompany.scores.dataReadiness}
                    onChange={(v) => handleScoreChange("dataReadiness", v)}
                  />
                  <ScoreSlider
                    label="Technical Infrastructure"
                    value={scenarioScores.techInfrastructure}
                    originalValue={selectedCompany.scores.techInfrastructure}
                    onChange={(v) => handleScoreChange("techInfrastructure", v)}
                  />
                  <ScoreSlider
                    label="Timeline Fit"
                    value={scenarioScores.timelineFit}
                    originalValue={selectedCompany.scores.timelineFit}
                    onChange={(v) => handleScoreChange("timelineFit", v)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Section 5: Cohort What-If Analysis */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
              Cohort What-If Analysis
            </h2>

            {/* Cohort selector pills */}
            <div className="mb-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Select Cohort
              </p>
              <div className="flex flex-wrap gap-2">
                {COHORTS.map((cohort) => (
                  <button
                    key={cohort}
                    onClick={() =>
                      setCohortAdjustment((prev) => ({
                        ...prev,
                        cohort: prev.cohort === cohort ? null : cohort,
                        delta: prev.cohort === cohort ? 0 : prev.delta,
                      }))
                    }
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                      ${
                        cohortAdjustment.cohort === cohort
                          ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                          : "bg-[var(--color-card)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-blue)]"
                      }
                    `}
                  >
                    {cohort}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension selector */}
            <div className="mb-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Dimension to Adjust
              </p>
              <select
                value={cohortAdjustment.dimension}
                onChange={(e) =>
                  setCohortAdjustment((prev) => ({
                    ...prev,
                    dimension: e.target.value as keyof ScenarioScores,
                  }))
                }
                className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              >
                <option value="ebitdaImpact">EBITDA Impact</option>
                <option value="revenueEnablement">Revenue Enablement</option>
                <option value="riskReduction">Risk Reduction</option>
                <option value="orgCapacity">Organizational Capacity</option>
                <option value="dataReadiness">Data Readiness</option>
                <option value="techInfrastructure">Technical Infrastructure</option>
                <option value="timelineFit">Timeline Fit</option>
              </select>
            </div>

            {/* Delta slider */}
            {cohortAdjustment.cohort && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">
                    Point Adjustment
                  </label>
                  <span
                    className={`text-sm font-bold ${
                      cohortAdjustment.delta > 0
                        ? "text-[var(--color-green)]"
                        : cohortAdjustment.delta < 0
                          ? "text-red-500"
                          : "text-[var(--color-muted)]"
                    }`}
                  >
                    {cohortAdjustment.delta > 0 ? "+" : ""}
                    {cohortAdjustment.delta}
                  </span>
                </div>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={cohortAdjustment.delta}
                  onChange={(e) =>
                    setCohortAdjustment((prev) => ({
                      ...prev,
                      delta: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                    bg-[var(--color-border)]
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[var(--color-blue)]
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[var(--color-blue)]
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-md
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--color-muted)]">
                  <span>-3</span>
                  <span>0</span>
                  <span>+3</span>
                </div>
              </div>
            )}

            {/* Cohort Results */}
            {cohortResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Companies Affected</p>
                  <p className="text-lg font-bold text-[var(--color-foreground)]">
                    {cohortResult.companyCount}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-muted)] mb-1">
                    Quadrant Changes
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      cohortResult.quadrantChanges > 0
                        ? "text-[var(--color-blue)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {cohortResult.quadrantChanges} compan
                    {cohortResult.quadrantChanges === 1 ? "y" : "ies"} moved
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-muted)] mb-1">
                    EBITDA Opportunity Change
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      cohortResult.ebitdaDelta > 0
                        ? "text-[var(--color-green)]"
                        : cohortResult.ebitdaDelta < 0
                          ? "text-red-500"
                          : "text-[var(--color-muted)]"
                    }`}
                  >
                    {cohortResult.ebitdaDelta > 0 ? "+" : ""}
                    ${cohortResult.ebitdaDelta.toFixed(2)}M
                  </p>
                </div>

                {/* Quadrant distribution before/after */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">Before</p>
                    {(Object.keys(cohortResult.beforeQuadrants) as Quadrant[]).map((q) => (
                      <div key={q} className="flex justify-between text-xs py-0.5">
                        <span className="text-[var(--color-muted)]">{q}</span>
                        <span className="font-medium text-[var(--color-foreground)]">
                          {cohortResult.beforeQuadrants[q]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">After</p>
                    {(Object.keys(cohortResult.afterQuadrants) as Quadrant[]).map((q) => (
                      <div key={q} className="flex justify-between text-xs py-0.5">
                        <span className="text-[var(--color-muted)]">{q}</span>
                        <span
                          className={`font-medium ${
                            cohortResult.afterQuadrants[q] !==
                            cohortResult.beforeQuadrants[q]
                              ? "text-[var(--color-blue)]"
                              : "text-[var(--color-foreground)]"
                          }`}
                        >
                          {cohortResult.afterQuadrants[q]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!cohortAdjustment.cohort && (
              <p className="text-sm text-[var(--color-muted)] italic">
                Select a cohort above to model group-level adjustments.
              </p>
            )}
          </Card>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Preview                                        */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* Section 4: Impact Preview */}
          {selectedCompany && scenarioResult ? (
            <>
              {/* Quadrant transition */}
              <Card>
                <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                  Impact Preview
                </h2>

                {/* Quadrant arrow */}
                <div className="flex items-center justify-center gap-4 py-4 mb-4 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                  <Badge
                    label={scenarioResult.original.quadrant}
                    variant={QUADRANT_BADGE_VARIANT[scenarioResult.original.quadrant]}
                  />
                  <svg
                    className={`w-8 h-8 ${
                      scenarioResult.original.quadrant !==
                      scenarioResult.scenario.quadrant
                        ? "text-[var(--color-blue)]"
                        : "text-[var(--color-muted)]"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <Badge
                    label={scenarioResult.scenario.quadrant}
                    variant={QUADRANT_BADGE_VARIANT[scenarioResult.scenario.quadrant]}
                  />
                </div>

                {scenarioResult.original.quadrant !==
                  scenarioResult.scenario.quadrant && (
                  <p className="text-sm text-[var(--color-blue)] font-medium text-center mb-4">
                    Quadrant shift detected
                  </p>
                )}
              </Card>

              {/* Before / After cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Card */}
                <Card className="border-l-4 border-l-[var(--color-muted)]">
                  <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                    Before
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Value Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.original.valueScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Readiness Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.original.readinessScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Adj. EBITDA</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        ${scenarioResult.original.adjustedEbitda.toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Priority Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.original.priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* After Card */}
                <Card className="border-l-4 border-l-[var(--color-blue)]">
                  <h3 className="text-sm font-semibold text-[var(--color-blue)] uppercase tracking-wider mb-3">
                    After
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Value Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.scenario.valueScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Readiness Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.scenario.readinessScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Adj. EBITDA</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        ${scenarioResult.scenario.adjustedEbitda.toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Priority Score</span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {scenarioResult.scenario.priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Deltas summary */}
              <Card>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider mb-3">
                  Deltas
                </h3>
                <DeltaValue
                  label="Value Score"
                  before={scenarioResult.original.valueScore}
                  after={scenarioResult.scenario.valueScore}
                  format="score"
                />
                <DeltaValue
                  label="Readiness Score"
                  before={scenarioResult.original.readinessScore}
                  after={scenarioResult.scenario.readinessScore}
                  format="score"
                />
                <DeltaValue
                  label="Adjusted EBITDA ($M)"
                  before={scenarioResult.original.adjustedEbitda}
                  after={scenarioResult.scenario.adjustedEbitda}
                  format="score"
                />
                <DeltaValue
                  label="Priority Score"
                  before={scenarioResult.original.priorityScore}
                  after={scenarioResult.scenario.priorityScore}
                  format="number"
                />
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <svg
                className="w-16 h-16 text-[var(--color-muted)] opacity-30 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
              <p className="text-[var(--color-muted)] text-sm">
                Select a company to begin modeling scenarios.
              </p>
              <p className="text-[var(--color-muted)] text-xs mt-1">
                Adjust scores and watch the impact in real time.
              </p>
            </Card>
          )}

          {/* Section 6: Reset / Save */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset to Original
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save Scenario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
