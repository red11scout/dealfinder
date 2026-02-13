import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiSparkles,
  HiExclamationTriangle,
  HiCheckBadge,
  HiArrowTrendingUp,
  HiNewspaper,
  HiBuildingOffice2,
  HiChartBar,
} from "react-icons/hi2";

import { Card, MetricCard, Badge, Button } from "../components/shared";
import { useMaStore } from "../stores/ma";
import type { ScoredVar } from "@shared/types";

function scoreColor(score: number): string {
  if (score >= 7) return "text-[var(--color-green)]";
  if (score >= 5) return "text-[var(--color-blue)]";
  return "text-[var(--color-muted)]";
}

function formatRevenue(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${Math.round(m)}M`;
}

// Generate insight items from scoring data
function generateInsights(scoredVars: ScoredVar[]) {
  const highlights: { title: string; description: string; type: "highlight" | "risk" | "opportunity" }[] = [];

  // Top movers
  const topScorers = scoredVars.filter((sv) => sv.compositeScore >= 7.5);
  if (topScorers.length > 0) {
    highlights.push({
      title: `${topScorers.length} High-Score Targets Identified`,
      description: `${topScorers.map((sv) => sv.var.name).slice(0, 3).join(", ")} score above 7.5 composite — strong acquisition candidates for BlueAlly.`,
      type: "highlight",
    });
  }

  // Geographic clusters
  const stateCount: Record<string, number> = {};
  scoredVars.forEach((sv) => {
    stateCount[sv.var.hqState] = (stateCount[sv.var.hqState] || 0) + 1;
  });
  const topStates = Object.entries(stateCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  highlights.push({
    title: "Geographic Concentration",
    description: `Highest VAR density: ${topStates.map(([s, c]) => `${s} (${c})`).join(", ")}. Consider geographic expansion into underserved markets.`,
    type: "opportunity",
  });

  // Margin risks
  const lowMargin = scoredVars.filter(
    (sv) => sv.var.ebitdaMargin != null && sv.var.ebitdaMargin < 10
  );
  if (lowMargin.length > 0) {
    highlights.push({
      title: `${lowMargin.length} VARs with Sub-10% EBITDA Margins`,
      description: `${lowMargin.map((sv) => sv.var.name).slice(0, 3).join(", ")} have thin margins. May indicate operational inefficiency or pricing pressure.`,
      type: "risk",
    });
  }

  // PE-backed targets
  const peTargets = scoredVars.filter(
    (sv) => sv.var.ownershipType === "PE-Backed" || sv.var.ownershipType === "PE"
  );
  if (peTargets.length > 0) {
    highlights.push({
      title: `${peTargets.length} PE-Backed VARs — Deal-Ready`,
      description: `PE-backed targets typically have cleaner financials and more structured deal processes. Top: ${peTargets.slice(0, 3).map((sv) => sv.var.name).join(", ")}.`,
      type: "highlight",
    });
  }

  // High growth
  const highGrowth = scoredVars.filter(
    (sv) => sv.var.growthRate != null && sv.var.growthRate >= 15
  );
  if (highGrowth.length > 0) {
    highlights.push({
      title: `${highGrowth.length} VARs Growing 15%+ YoY`,
      description: `${highGrowth.map((sv) => `${sv.var.name} (${sv.var.growthRate}%)`).slice(0, 3).join(", ")} show strong market momentum.`,
      type: "opportunity",
    });
  }

  // Vendor synergy
  const strongVendor = scoredVars.filter((sv) => sv.scores.vendorSynergy >= 8);
  if (strongVendor.length > 0) {
    highlights.push({
      title: `${strongVendor.length} VARs with Strong Vendor Overlap`,
      description: `Microsoft, Cisco, Dell partnerships align with BlueAlly. Integration accelerators: ${strongVendor.slice(0, 3).map((sv) => sv.var.name).join(", ")}.`,
      type: "highlight",
    });
  }

  // Low specialty fit
  const lowSpecialty = scoredVars.filter((sv) => sv.scores.specialtyFit <= 4);
  if (lowSpecialty.length > 0) {
    highlights.push({
      title: `${lowSpecialty.length} VARs with Weak Specialty Alignment`,
      description: `Limited overlap with Cloud, Cybersecurity, Managed Services. May need significant capability investment post-acquisition.`,
      type: "risk",
    });
  }

  return highlights;
}

// Culture compatibility scoring
function cultureLead(scoredVars: ScoredVar[]) {
  return scoredVars
    .map((sv) => {
      let cultureIndex = sv.scores.cultureFit;
      // Boost for geographic proximity
      if (sv.scores.geographicFit >= 8) cultureIndex += 0.5;
      // Boost for good Glassdoor
      if (sv.var.glassdoorRating && sv.var.glassdoorRating >= 4.0) cultureIndex += 0.5;
      // Boost for size compatibility
      if (sv.var.employeeCount >= 50 && sv.var.employeeCount <= 500) cultureIndex += 0.5;
      return { ...sv, cultureIndex: Math.min(10, Math.round(cultureIndex * 10) / 10) };
    })
    .sort((a, b) => b.cultureIndex - a.cultureIndex)
    .slice(0, 10);
}

export default function Insights() {
  const navigate = useNavigate();
  const { scoredVars, fetchRankings } = useMaStore();

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const insights = generateInsights(scoredVars);
  const cultureLeaders = cultureLead(scoredVars);
  const totalRevenue = scoredVars.reduce((s, sv) => s + sv.var.annualRevenue, 0);
  const avgScore = scoredVars.length > 0
    ? (scoredVars.reduce((s, sv) => s + sv.compositeScore, 0) / scoredVars.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">
          Market Insights
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-2xl">
          AI-generated intelligence across the VAR landscape. Highlights, risks, and opportunities.
        </p>
      </section>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="VARs Tracked"
          value={scoredVars.length}
          icon={<HiBuildingOffice2 className="w-7 h-7" />}
          color="navy"
        />
        <MetricCard
          label="Combined Revenue"
          value={formatRevenue(totalRevenue)}
          icon={<HiChartBar className="w-7 h-7" />}
          color="blue"
        />
        <MetricCard
          label="Avg Composite Score"
          value={avgScore}
          icon={<HiArrowTrendingUp className="w-7 h-7" />}
          color="green"
        />
        <MetricCard
          label="Insights Generated"
          value={insights.length}
          icon={<HiSparkles className="w-7 h-7" />}
          color="navy"
        />
      </section>

      {/* Insights Feed */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          Intelligence Feed
        </h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <Card key={i} padding="md">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    insight.type === "highlight"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                      : insight.type === "risk"
                        ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                        : "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                  }`}
                >
                  {insight.type === "highlight" && <HiCheckBadge className="w-5 h-5" />}
                  {insight.type === "risk" && <HiExclamationTriangle className="w-5 h-5" />}
                  {insight.type === "opportunity" && <HiArrowTrendingUp className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                      {insight.title}
                    </h3>
                    <Badge
                      label={insight.type}
                      variant={insight.type === "highlight" ? "green" : insight.type === "risk" ? "red" : "blue"}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Culture Compatibility Leaderboard */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          Culture Compatibility Leaderboard
        </h2>
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-3 text-left text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="py-3 px-3 text-left text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Company
                  </th>
                  <th className="py-3 px-3 text-center text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Culture Score
                  </th>
                  <th className="py-3 px-3 text-center text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Ownership
                  </th>
                  <th className="py-3 px-3 text-center text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Location
                  </th>
                  <th className="py-3 px-3 text-center text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    M&A Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {cultureLeaders.map((sv, i) => (
                  <tr
                    key={sv.var.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-subtle)] cursor-pointer transition-colors"
                    onClick={() => navigate(`/vars/${sv.var.id}`)}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-navy)]">
                      #{i + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--color-foreground)]">
                      {sv.var.name}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-bold ${scoreColor(sv.cultureIndex)}`}>
                        {sv.cultureIndex.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge label={sv.var.ownershipType} variant="gray" size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-muted)]">
                      {sv.var.hqState}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-bold ${scoreColor(sv.compositeScore)}`}>
                        {sv.compositeScore.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
