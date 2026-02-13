import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiArrowTrendingUp,
  HiCurrencyDollar,
  HiBuildingOffice2,
  HiScale,
  HiSparkles,
} from "react-icons/hi2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

import { Card, MetricCard, Badge, Button } from "../components/shared";
import { useMaStore } from "../stores/ma";
import type { ScoredVar, UnifiedVar } from "@shared/types";

function formatRevenue(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${Math.round(m)}M`;
}

interface ScenarioResult {
  name: string;
  targets: UnifiedVar[];
  combinedRevenue: number;
  combinedEbitda: number;
  estimatedValuation: number;
  estimatedPriceRange: { low: number; high: number };
  projectedRoi: number;
  crossSellRevenue: number;
  marginGain: number;
  integrationCost: number;
  capabilityOverlaps: string[];
  capabilityGains: string[];
  vendorOverlaps: string[];
}

export default function MaScenario() {
  const navigate = useNavigate();
  const { scoredVars, fetchRankings } = useMaStore();

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [ebitdaMultiple, setEbitdaMultiple] = useState(7);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topVars = useMemo(() => scoredVars.slice(0, 20), [scoredVars]);

  const toggleTarget = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setResult(null);
  };

  const simulate = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ma/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetVarIds: selectedIds,
          ebitdaMultiple,
        }),
      });
      if (!res.ok) throw new Error("Scenario simulation failed");
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const comparisonData = result
    ? [
        { name: "BlueAlly (Pre)", revenue: 50, fill: "#001278" },
        { name: "Combined", revenue: result.combinedRevenue, fill: "#36bf78" },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/ma-engine")}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]
          hover:text-[var(--color-foreground)] transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to M&A Engine
      </button>

      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">
          Acquisition Scenario Modeling
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-2xl">
          Select targets. Simulate the deal. See the numbers.
        </p>
      </section>

      {/* Target Selection */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
              Select Acquisition Targets (top 20 ranked)
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {topVars.map((sv) => {
                const isSelected = selectedIds.includes(sv.var.id);
                return (
                  <button
                    key={sv.var.id}
                    onClick={() => toggleTarget(sv.var.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                      ${isSelected
                        ? "bg-navy/5 dark:bg-navy/10 border-navy/30 border"
                        : "border border-[var(--color-border)] hover:bg-[var(--color-subtle)]"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0
                        ${isSelected ? "bg-navy border-navy text-white" : "border-[var(--color-border)]"}`}
                    >
                      {isSelected && <span className="text-xs font-bold">&#10003;</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                          #{sv.rank} {sv.var.name}
                        </span>
                        <Badge label={formatRevenue(sv.var.annualRevenue)} variant="navy" size="sm" />
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">
                        {sv.var.hqCity}, {sv.var.hqState} &middot; {sv.var.ownershipType} &middot; Score: {sv.compositeScore.toFixed(1)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
              Assumptions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--color-foreground)] block mb-1">
                  EBITDA Multiple: <span className="font-bold">{ebitdaMultiple}x</span>
                </label>
                <input
                  type="range"
                  min={4}
                  max={12}
                  step={0.5}
                  value={ebitdaMultiple}
                  onChange={(e) => {
                    setEbitdaMultiple(Number(e.target.value));
                    setResult(null);
                  }}
                  className="w-full h-2 rounded-full appearance-none bg-[var(--color-subtle)] accent-[var(--color-navy)]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-navy)]
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
                  <span>4x</span>
                  <span>8x</span>
                  <span>12x</span>
                </div>
              </div>

              <div className="text-xs text-[var(--color-muted)] space-y-1">
                <p>Cross-sell uplift: 5%</p>
                <p>Margin improvement: 15%</p>
                <p>Integration cost: 3% of valuation</p>
              </div>
            </div>
          </Card>

          <Button
            variant="primary"
            size="lg"
            onClick={simulate}
            disabled={selectedIds.length === 0 || loading}
            icon={<HiScale className="w-5 h-5" />}
            className="w-full"
          >
            {loading ? "Simulating..." : `Simulate Acquisition (${selectedIds.length} target${selectedIds.length !== 1 ? "s" : ""})`}
          </Button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      </section>

      {/* Results */}
      {result && (
        <>
          {/* Key Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Combined Revenue"
              value={formatRevenue(result.combinedRevenue)}
              subtitle={`BlueAlly $50M + targets`}
              icon={<HiCurrencyDollar className="w-7 h-7" />}
              color="navy"
            />
            <MetricCard
              label="Est. Valuation"
              value={formatRevenue(result.estimatedValuation)}
              subtitle={`${formatRevenue(result.estimatedPriceRange.low)} - ${formatRevenue(result.estimatedPriceRange.high)}`}
              icon={<HiScale className="w-7 h-7" />}
              color="blue"
            />
            <MetricCard
              label="Projected ROI"
              value={`${result.projectedRoi}%`}
              subtitle="Year 1 estimate"
              icon={<HiArrowTrendingUp className="w-7 h-7" />}
              color="green"
            />
            <MetricCard
              label="Targets"
              value={result.targets.length}
              subtitle={result.targets.map((t) => t.name).join(", ")}
              icon={<HiBuildingOffice2 className="w-7 h-7" />}
              color="navy"
            />
          </section>

          {/* Revenue Comparison + Synergies */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
                Revenue Comparison
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} />
                    <Tooltip
                      formatter={(value: number) => formatRevenue(value)}
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                      {comparisonData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
                Synergy Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-foreground)]">Cross-sell revenue</span>
                  <span className="text-sm font-bold text-[var(--color-green)]">
                    +{formatRevenue(result.crossSellRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-foreground)]">Margin improvement</span>
                  <span className="text-sm font-bold text-[var(--color-green)]">
                    +{formatRevenue(result.marginGain)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-foreground)]">Integration cost</span>
                  <span className="text-sm font-bold text-red-500">
                    -{formatRevenue(result.integrationCost)}
                  </span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--color-foreground)]">Net synergy (Year 1)</span>
                    <span className="text-sm font-bold text-[var(--color-navy)]">
                      {formatRevenue(result.crossSellRevenue + result.marginGain - result.integrationCost)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Capabilities */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.capabilityGains.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-[var(--color-green)] uppercase tracking-wider mb-3">
                  New Capabilities Gained
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.capabilityGains.map((c) => (
                    <Badge key={c} label={c} variant="green" size="sm" />
                  ))}
                </div>
              </Card>
            )}
            {result.capabilityOverlaps.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-[var(--color-blue)] uppercase tracking-wider mb-3">
                  Capability Overlaps (Reinforcement)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.capabilityOverlaps.map((c) => (
                    <Badge key={c} label={c} variant="blue" size="sm" />
                  ))}
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
