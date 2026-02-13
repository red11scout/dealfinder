import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  HiTrophy,
  HiScale,
  HiBuildingOffice2,
  HiChartBar,
  HiArrowTrendingUp,
  HiAdjustmentsHorizontal,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi2";

import { Card, MetricCard, Badge, Button } from "../components/shared";
import { useMaStore } from "../stores/ma";
import { ScoreBreakdown } from "../components/ma/ScoreBreakdown";
import type { AcquisitionCriteria, ScoredVar } from "@shared/types";

// ============================================================================
// Preset Scenarios
// ============================================================================

const PRESETS: { label: string; description: string; weights: AcquisitionCriteria }[] = [
  {
    label: "Balanced",
    description: "Equal weight across all dimensions",
    weights: {
      revenueFitWeight: 0.125, geographicFitWeight: 0.125, specialtyFitWeight: 0.125,
      cultureFitWeight: 0.125, customerOverlapWeight: 0.125, vendorSynergyWeight: 0.125,
      growthTrajectoryWeight: 0.125, marginProfileWeight: 0.125,
    },
  },
  {
    label: "Revenue Boost",
    description: "Maximize near-term revenue impact",
    weights: {
      revenueFitWeight: 0.30, geographicFitWeight: 0.05, specialtyFitWeight: 0.10,
      cultureFitWeight: 0.05, customerOverlapWeight: 0.15, vendorSynergyWeight: 0.10,
      growthTrajectoryWeight: 0.15, marginProfileWeight: 0.10,
    },
  },
  {
    label: "Strategic Synergy",
    description: "Capability and vendor alignment first",
    weights: {
      revenueFitWeight: 0.10, geographicFitWeight: 0.05, specialtyFitWeight: 0.30,
      cultureFitWeight: 0.10, customerOverlapWeight: 0.10, vendorSynergyWeight: 0.25,
      growthTrajectoryWeight: 0.05, marginProfileWeight: 0.05,
    },
  },
  {
    label: "Geographic Expansion",
    description: "Prioritize new market presence",
    weights: {
      revenueFitWeight: 0.10, geographicFitWeight: 0.30, specialtyFitWeight: 0.10,
      cultureFitWeight: 0.10, customerOverlapWeight: 0.15, vendorSynergyWeight: 0.05,
      growthTrajectoryWeight: 0.10, marginProfileWeight: 0.10,
    },
  },
  {
    label: "Tuck-in",
    description: "Small, easy-to-integrate targets",
    weights: {
      revenueFitWeight: 0.10, geographicFitWeight: 0.15, specialtyFitWeight: 0.15,
      cultureFitWeight: 0.20, customerOverlapWeight: 0.10, vendorSynergyWeight: 0.10,
      growthTrajectoryWeight: 0.05, marginProfileWeight: 0.15,
    },
  },
];

// ============================================================================
// Constants
// ============================================================================

const CRITERIA_LABELS: Record<keyof AcquisitionCriteria, string> = {
  revenueFitWeight: "Revenue Fit",
  geographicFitWeight: "Geographic Fit",
  specialtyFitWeight: "Specialty Fit",
  cultureFitWeight: "Culture Fit",
  customerOverlapWeight: "Customer Overlap",
  vendorSynergyWeight: "Vendor Synergy",
  growthTrajectoryWeight: "Growth Trajectory",
  marginProfileWeight: "Margin Profile",
};

const RADAR_DIMENSIONS = [
  { key: "revenueFit", label: "Revenue" },
  { key: "geographicFit", label: "Geography" },
  { key: "specialtyFit", label: "Specialty" },
  { key: "cultureFit", label: "Culture" },
  { key: "customerOverlap", label: "Customers" },
  { key: "vendorSynergy", label: "Vendors" },
  { key: "growthTrajectory", label: "Growth" },
  { key: "marginProfile", label: "Margin" },
];

const RADAR_COLORS = [
  "#001278", // navy
  "#02a2fd", // blue
  "#36bf78", // green
];

function scoreColor(score: number): string {
  if (score >= 7) return "text-[var(--color-green)]";
  if (score >= 5) return "text-[var(--color-blue)]";
  return "text-[var(--color-muted)]";
}

function scoreBg(score: number): string {
  if (score >= 7) return "bg-[var(--color-green)]/10";
  if (score >= 5) return "bg-[var(--color-blue)]/10";
  return "bg-[var(--color-muted)]/10";
}

function formatRevenue(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m}M`;
}

// ============================================================================
// Subcomponents
// ============================================================================

function CriteriaSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--color-foreground)] w-36 shrink-0">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={40}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="flex-1 h-2 rounded-full appearance-none bg-[var(--color-subtle)] accent-[var(--color-navy)]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-navy)]
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="text-sm font-semibold text-[var(--color-navy)] w-12 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function VarRadarChart({
  scoredVars,
  height = 220,
}: {
  scoredVars: ScoredVar[];
  height?: number;
}) {
  const data = RADAR_DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim.label };
    scoredVars.forEach((sv, i) => {
      entry[`var${i}`] = sv.scores[dim.key as keyof typeof sv.scores];
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
        />
        <PolarRadiusAxis
          domain={[0, 10]}
          tick={{ fontSize: 10, fill: "var(--color-muted)" }}
          axisLine={false}
        />
        {scoredVars.map((_, i) => (
          <Radar
            key={i}
            name={scoredVars[i].var.name}
            dataKey={`var${i}`}
            stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
            fill={RADAR_COLORS[i % RADAR_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const bg =
    rank === 1
      ? "bg-[var(--color-green)]"
      : rank <= 3
        ? "bg-[var(--color-navy)]"
        : "bg-[var(--color-blue)]";
  return (
    <div
      className={`${bg} text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0`}
    >
      {rank}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function MaEngine() {
  const {
    acquisitionCriteria,
    scoredVars,
    topTen,
    comparisonIds,
    updateCriteriaWeight,
    recalculateScores,
    toggleComparison,
    clearComparison,
  } = useMaStore();
  const fetchRankings = useMaStore((s) => s.fetchRankings);
  const loading = useMaStore((s) => s.loading);
  const navTo = useNavigate();

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const [sortColumn, setSortColumn] = useState<string>("compositeScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [breakdownVar, setBreakdownVar] = useState<ScoredVar | null>(null);

  const applyPreset = useCallback(
    (preset: typeof PRESETS[number]) => {
      const keys = Object.keys(preset.weights) as (keyof AcquisitionCriteria)[];
      keys.forEach((k) => updateCriteriaWeight(k, preset.weights[k]));
      recalculateScores();
    },
    [updateCriteriaWeight, recalculateScores],
  );

  // Weight sum validation
  const weightSum = useMemo(() => {
    return Object.values(acquisitionCriteria).reduce((s, v) => s + v, 0);
  }, [acquisitionCriteria]);

  // Comparison candidates
  const comparisonVars = useMemo(() => {
    return comparisonIds
      .map((id) => scoredVars.find((sv) => sv.var.id === id))
      .filter(Boolean) as ScoredVar[];
  }, [comparisonIds, scoredVars]);

  // Sorted table data
  const sortedVars = useMemo(() => {
    const copy = [...scoredVars];
    copy.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortColumn) {
        case "rank":
          aVal = a.rank;
          bVal = b.rank;
          break;
        case "revenue":
          aVal = a.var.annualRevenue;
          bVal = b.var.annualRevenue;
          break;
        case "compositeScore":
          aVal = a.compositeScore;
          bVal = b.compositeScore;
          break;
        case "revenueFit":
          aVal = a.scores.revenueFit;
          bVal = b.scores.revenueFit;
          break;
        case "specialtyFit":
          aVal = a.scores.specialtyFit;
          bVal = b.scores.specialtyFit;
          break;
        case "vendorSynergy":
          aVal = a.scores.vendorSynergy;
          bVal = b.scores.vendorSynergy;
          break;
        case "growthTrajectory":
          aVal = a.scores.growthTrajectory;
          bVal = b.scores.growthTrajectory;
          break;
        default:
          aVal = a.compositeScore;
          bVal = b.compositeScore;
      }
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
    return copy;
  }, [scoredVars, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (col: string) => {
      if (sortColumn === col) {
        setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortColumn(col);
        setSortDirection("desc");
      }
    },
    [sortColumn],
  );

  const numberOne = topTen[0];

  // ========================================================================
  // Weight bar segments
  // ========================================================================
  const weightBarSegments = useMemo(() => {
    const keys = Object.keys(acquisitionCriteria) as (keyof AcquisitionCriteria)[];
    const colors = [
      "bg-[var(--color-navy)]",
      "bg-[var(--color-blue)]",
      "bg-[var(--color-green)]",
      "bg-amber-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    return keys.map((k, i) => ({
      key: k,
      label: CRITERIA_LABELS[k],
      weight: acquisitionCriteria[k],
      color: colors[i],
    }));
  }, [acquisitionCriteria]);

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ================================================================ */}
      {/* Section 1: Header */}
      {/* ================================================================ */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-navy)]">
            M&A Intelligence Engine
          </h1>
          <p className="text-[var(--color-muted)] text-lg max-w-2xl">
            Find the right acquisition. Score it. Rank it. Know why.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navTo("/ma-engine/scenario")}
          icon={<HiScale className="w-4 h-4" />}
        >
          Simulate Acquisition
        </Button>
      </section>

      {/* ================================================================ */}
      {/* Section 1.5: Summary Metrics */}
      {/* ================================================================ */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="VARs Evaluated"
            value={scoredVars.length}
            subtitle="In acquisition pipeline"
            icon={<HiBuildingOffice2 className="w-7 h-7" />}
            color="navy"
          />
          <MetricCard
            label="Top Candidate"
            value={numberOne ? numberOne.var.name : "--"}
            subtitle={numberOne ? `Score: ${numberOne.compositeScore.toFixed(1)}` : ""}
            icon={<HiTrophy className="w-7 h-7" />}
            color="green"
          />
          <MetricCard
            label="Avg Composite"
            value={
              (
                scoredVars.reduce((s, v) => s + v.compositeScore, 0) /
                scoredVars.length
              ).toFixed(1)
            }
            subtitle="Across all VARs"
            icon={<HiChartBar className="w-7 h-7" />}
            color="blue"
          />
          <MetricCard
            label="High Scorers (7+)"
            value={scoredVars.filter((v) => v.compositeScore >= 7).length}
            subtitle="Strong acquisition targets"
            icon={<HiArrowTrendingUp className="w-7 h-7" />}
            color="green"
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Section 2: Acquisition Profile Card */}
      {/* ================================================================ */}
      <section>
        <Card>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            <div className="flex items-center gap-3">
              <HiAdjustmentsHorizontal className="w-5 h-5 text-[var(--color-navy)]" />
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">
                BlueAlly Acquisition Profile
              </h2>
              <span className="text-sm text-[var(--color-muted)]">
                {Math.round(weightSum * 100)}% allocated
              </span>
              {Math.abs(weightSum - 1) > 0.01 && (
                <Badge label="Weights must sum to 100%" variant="red" size="sm" />
              )}
            </div>
            {profileExpanded ? (
              <HiChevronUp className="w-5 h-5 text-[var(--color-muted)]" />
            ) : (
              <HiChevronDown className="w-5 h-5 text-[var(--color-muted)]" />
            )}
          </div>

          {/* Weight distribution bar */}
          <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-[var(--color-subtle)]">
            {weightBarSegments.map((seg) => (
              <div
                key={seg.key}
                className={`${seg.color} transition-all duration-300`}
                style={{ width: `${seg.weight * 100}%` }}
                title={`${seg.label}: ${Math.round(seg.weight * 100)}%`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {weightBarSegments.map((seg) => (
              <div key={seg.key} className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                {seg.label}
              </div>
            ))}
          </div>

          {/* Expanded sliders */}
          {profileExpanded && (
            <div className="mt-6 space-y-4">
              {/* Preset buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  Preset Scenarios
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      title={p.description}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)]
                        text-[var(--color-muted)] hover:text-[var(--color-foreground)]
                        hover:border-navy/30 hover:bg-navy/5 dark:hover:bg-navy/10 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              {(
                Object.keys(acquisitionCriteria) as (keyof AcquisitionCriteria)[]
              ).map((key) => (
                <CriteriaSlider
                  key={key}
                  label={CRITERIA_LABELS[key]}
                  value={acquisitionCriteria[key]}
                  onChange={(v) => updateCriteriaWeight(key, v)}
                />
              ))}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={recalculateScores}
                  disabled={Math.abs(weightSum - 1) > 0.05}
                  icon={<HiScale className="w-4 h-4" />}
                >
                  Recalculate Rankings
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* ================================================================ */}
      {/* Section 3: Top 10 Acquisitions */}
      {/* ================================================================ */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          Top 10 Acquisition Targets
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topTen.map((sv) => (
            <Card key={sv.var.id} padding="md">
              <div className="flex gap-4">
                {/* Rank + Radar */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <RankBadge rank={sv.rank} />
                  <div className="w-36 h-36">
                    <VarRadarChart scoredVars={[sv]} height={144} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-foreground)] truncate">
                        {sv.var.name}
                      </h3>
                      <p className="text-xs text-[var(--color-muted)]">
                        {sv.var.hqCity}, {sv.var.hqState}
                      </p>
                    </div>
                    <button
                      onClick={() => setBreakdownVar(sv)}
                      title="Click for score breakdown"
                      className={`text-2xl font-bold cursor-pointer hover:underline ${scoreColor(sv.compositeScore)}`}
                    >
                      {sv.compositeScore.toFixed(1)}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      label={formatRevenue(sv.var.annualRevenue)}
                      variant="navy"
                      size="sm"
                    />
                    <Badge
                      label={`${sv.var.employeeCount.toLocaleString()} emp`}
                      variant="gray"
                      size="sm"
                    />
                    <Badge
                      label={sv.var.ownershipType}
                      variant={sv.var.ownershipType === "PE-Backed" ? "blue" : "gray"}
                      size="sm"
                    />
                  </div>

                  <p className="text-sm text-[var(--color-muted)] mt-3 leading-relaxed line-clamp-3">
                    {sv.reasoning}
                  </p>

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comparisonIds.includes(sv.var.id)}
                        onChange={() => toggleComparison(sv.var.id)}
                        className="rounded border-[var(--color-border)] text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                      />
                      Compare
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* Section 4: Comparison View */}
      {/* ================================================================ */}
      {comparisonVars.length >= 2 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">
              Side-by-Side Comparison
            </h2>
            <Button variant="ghost" size="sm" onClick={clearComparison}>
              Clear
            </Button>
          </div>

          <Card>
            {/* Overlay Radar */}
            <div className="h-72 mb-6">
              <VarRadarChart scoredVars={comparisonVars} height={288} />
            </div>
            <div className="flex justify-center gap-6 mb-6">
              {comparisonVars.map((sv, i) => (
                <div key={sv.var.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RADAR_COLORS[i] }}
                  />
                  <span className="font-medium text-[var(--color-foreground)]">
                    {sv.var.name}
                  </span>
                  <span className={`font-bold ${scoreColor(sv.compositeScore)}`}>
                    {sv.compositeScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Dimension-by-dimension table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 px-3 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                      Dimension
                    </th>
                    {comparisonVars.map((sv) => (
                      <th
                        key={sv.var.id}
                        className="text-center py-2 px-3 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider"
                      >
                        {sv.var.name}
                      </th>
                    ))}
                    <th className="text-center py-2 px-3 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                      Winner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RADAR_DIMENSIONS.map((dim) => {
                    const scores = comparisonVars.map(
                      (sv) => sv.scores[dim.key as keyof typeof sv.scores],
                    );
                    const maxScore = Math.max(...scores);
                    const winnerIdx = scores.indexOf(maxScore);
                    const isTie = scores.filter((s) => s === maxScore).length > 1;
                    return (
                      <tr
                        key={dim.key}
                        className="border-b border-[var(--color-border)] last:border-0"
                      >
                        <td className="py-2.5 px-3 font-medium text-[var(--color-foreground)]">
                          {dim.label}
                        </td>
                        {comparisonVars.map((sv, i) => {
                          const val =
                            sv.scores[dim.key as keyof typeof sv.scores];
                          const isWinner = val === maxScore && !isTie;
                          return (
                            <td
                              key={sv.var.id}
                              className={`text-center py-2.5 px-3 font-semibold ${
                                isWinner
                                  ? "text-[var(--color-green)]"
                                  : "text-[var(--color-foreground)]"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                        <td className="text-center py-2.5 px-3 text-sm font-medium text-[var(--color-navy)]">
                          {isTie
                            ? "Tie"
                            : comparisonVars[winnerIdx]?.var.name.split(" ")[0]}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Composite row */}
                  <tr className="bg-[var(--color-subtle)]">
                    <td className="py-2.5 px-3 font-bold text-[var(--color-foreground)]">
                      Composite
                    </td>
                    {comparisonVars.map((sv) => (
                      <td
                        key={sv.var.id}
                        className={`text-center py-2.5 px-3 font-bold ${scoreColor(sv.compositeScore)}`}
                      >
                        {sv.compositeScore.toFixed(1)}
                      </td>
                    ))}
                    <td className="text-center py-2.5 px-3 font-bold text-[var(--color-navy)]">
                      {comparisonVars.reduce((best, sv) =>
                        sv.compositeScore > best.compositeScore ? sv : best,
                      ).var.name.split(" ")[0]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {/* ================================================================ */}
      {/* Section 5: Full VAR Ranking Table */}
      {/* ================================================================ */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          Full VAR Rankings
        </h2>
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {[
                    { key: "rank", label: "Rank", align: "text-center" },
                    { key: "name", label: "Company", align: "text-left" },
                    { key: "revenue", label: "Revenue", align: "text-right" },
                    { key: "hq", label: "HQ", align: "text-left" },
                    { key: "ownership", label: "Ownership", align: "text-left" },
                    { key: "compositeScore", label: "Score", align: "text-center" },
                    { key: "revenueFit", label: "Rev Fit", align: "text-center" },
                    { key: "specialtyFit", label: "Specialty", align: "text-center" },
                    { key: "vendorSynergy", label: "Vendors", align: "text-center" },
                    { key: "growthTrajectory", label: "Growth", align: "text-center" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() =>
                        col.key !== "name" && col.key !== "hq" && col.key !== "ownership"
                          ? handleSort(col.key)
                          : undefined
                      }
                      className={`py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider ${col.align} ${
                        col.key !== "name" && col.key !== "hq" && col.key !== "ownership"
                          ? "cursor-pointer hover:text-[var(--color-foreground)]"
                          : ""
                      }`}
                    >
                      {col.label}
                      {sortColumn === col.key && (
                        <span className="ml-1">
                          {sortDirection === "desc" ? "\u2193" : "\u2191"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedVars.map((sv) => (
                  <tr
                    key={sv.var.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                  >
                    <td className="py-2.5 px-2 text-center font-semibold text-[var(--color-navy)]">
                      #{sv.rank}
                    </td>
                    <td className="py-2.5 px-2 font-medium whitespace-nowrap">
                      <button
                        onClick={() => navTo(`/vars/${sv.var.id}`)}
                        className="text-[var(--color-navy)] hover:underline cursor-pointer"
                      >
                        {sv.var.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-right text-[var(--color-foreground)]">
                      {formatRevenue(sv.var.annualRevenue)}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--color-muted)] whitespace-nowrap">
                      {sv.var.hqCity}, {sv.var.hqState}
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge
                        label={sv.var.ownershipType}
                        variant={sv.var.ownershipType === "PE-Backed" ? "blue" : "gray"}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => setBreakdownVar(sv)}
                        title="Click for score breakdown"
                        className={`inline-flex items-center justify-center w-10 h-7 rounded-md text-sm font-bold cursor-pointer
                          hover:ring-2 hover:ring-navy/30 transition-all ${scoreColor(sv.compositeScore)} ${scoreBg(sv.compositeScore)}`}
                      >
                        {sv.compositeScore.toFixed(1)}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-center text-[var(--color-foreground)]">
                      {sv.scores.revenueFit}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[var(--color-foreground)]">
                      {sv.scores.specialtyFit}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[var(--color-foreground)]">
                      {sv.scores.vendorSynergy}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[var(--color-foreground)]">
                      {sv.scores.growthTrajectory}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* Section 6: #1 Acquisition Rationale */}
      {/* ================================================================ */}
      {/* Score Breakdown Modal */}
      {breakdownVar && (
        <ScoreBreakdown scoredVar={breakdownVar} onClose={() => setBreakdownVar(null)} />
      )}

      {numberOne && (
        <section>
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
            #1 Acquisition Rationale: {numberOne.var.name}
          </h2>
          <Card padding="lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Score breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  Scoring Breakdown
                </h3>
                {RADAR_DIMENSIONS.map((dim) => {
                  const val =
                    numberOne.scores[dim.key as keyof typeof numberOne.scores];
                  return (
                    <div key={dim.key} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-foreground)]">
                        {dim.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[var(--color-subtle)] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              val >= 7
                                ? "bg-[var(--color-green)]"
                                : val >= 5
                                  ? "bg-[var(--color-blue)]"
                                  : "bg-[var(--color-muted)]"
                            }`}
                            style={{ width: `${val * 10}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold w-6 text-right ${scoreColor(val)}`}
                        >
                          {val}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--color-foreground)]">
                    Composite Score
                  </span>
                  <span
                    className={`text-xl font-bold ${scoreColor(numberOne.compositeScore)}`}
                  >
                    {numberOne.compositeScore.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Center: Radar */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                  Fit Profile
                </h3>
                <VarRadarChart scoredVars={[numberOne]} height={240} />
              </div>

              {/* Right: Strengths, Risks, Synergy */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-green)] uppercase tracking-wider mb-2">
                    Strengths
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[var(--color-foreground)]">
                    {RADAR_DIMENSIONS.filter(
                      (d) =>
                        numberOne.scores[d.key as keyof typeof numberOne.scores] >=
                        8,
                    ).map((d) => (
                      <li key={d.key} className="flex items-start gap-2">
                        <span className="text-[var(--color-green)] mt-0.5">+</span>
                        {d.label} ({numberOne.scores[d.key as keyof typeof numberOne.scores]}/10)
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">
                    Watch Areas
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[var(--color-foreground)]">
                    {RADAR_DIMENSIONS.filter(
                      (d) =>
                        numberOne.scores[d.key as keyof typeof numberOne.scores] <=
                        5,
                    ).map((d) => (
                      <li key={d.key} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">!</span>
                        {d.label} ({numberOne.scores[d.key as keyof typeof numberOne.scores]}/10)
                      </li>
                    ))}
                    {RADAR_DIMENSIONS.filter(
                      (d) =>
                        numberOne.scores[d.key as keyof typeof numberOne.scores] <=
                        5,
                    ).length === 0 && (
                      <li className="text-[var(--color-muted)]">
                        No significant concerns identified
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-2">
                    Strategic Fit
                  </h3>
                  <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                    {numberOne.var.name} brings{" "}
                    {(numberOne.var.specialties ?? []).slice(0, 3).join(", ")} capabilities
                    with {formatRevenue(numberOne.var.annualRevenue)} revenue and{" "}
                    {numberOne.var.employeeCount.toLocaleString()} employees.{" "}
                    {numberOne.var.ownershipType === "PE-Backed"
                      ? "PE ownership means a structured deal process."
                      : numberOne.var.ownershipType === "Private"
                        ? "Private ownership could mean a cleaner negotiation."
                        : "Ownership structure will shape the approach."}{" "}
                    Vendor alignment with{" "}
                    {numberOne.var.topVendors.slice(0, 3).join(", ")} creates
                    immediate cross-sell opportunity.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-blue)] uppercase tracking-wider mb-2">
                    Estimated Synergy
                  </h3>
                  <p className="text-sm text-[var(--color-foreground)]">
                    Revenue synergy potential:{" "}
                    <span className="font-bold">
                      {formatRevenue(
                        Math.round(numberOne.var.annualRevenue * 0.05),
                      )}
                    </span>{" "}
                    (5% cross-sell uplift). Cost synergy:{" "}
                    <span className="font-bold">
                      {formatRevenue(
                        Math.round(
                          numberOne.var.annualRevenue *
                            ((numberOne.var.ebitdaMargin ?? 10) / 100) *
                            0.15,
                        ),
                      )}
                    </span>{" "}
                    (15% margin improvement from integration).
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
