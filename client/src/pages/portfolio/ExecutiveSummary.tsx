import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  HiChartBar,
  HiCurrencyDollar,
  HiSparkles,
  HiTrophy,
  HiArrowTrendingUp,
  HiClock,
  HiShare,
} from "react-icons/hi2";

import { Card, MetricCard, Badge, Button } from "../../components/shared";
import { usePortfolioStore } from "../../stores/portfolio";
import { formatCurrency } from "../../lib/calculations";
import type { Company, Quadrant, ValueTheme } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const QUADRANT_COLORS: Record<Quadrant, string> = {
  Champion: "#36bf78",
  "Quick Win": "#02a2fd",
  Strategic: "#001278",
  Foundation: "#94a3b8",
};

const QUADRANT_BADGE_VARIANT: Record<
  Quadrant,
  "green" | "blue" | "navy" | "gray"
> = {
  Champion: "green",
  "Quick Win": "blue",
  Strategic: "navy",
  Foundation: "gray",
};

const VALUE_THEME_COLORS: Record<ValueTheme, string> = {
  "Revenue Growth": "#36bf78",
  "Margin Expansion": "#02a2fd",
  "Cost Cutting": "#001278",
};

// ============================================================================
// Executive Summary Page
// ============================================================================

export default function ExecutiveSummary() {
  const {
    companies,
    stats,
    getTopCompanies,
    getPlatformCount,
    getReplicationOpportunities,
  } = usePortfolioStore();
  const fetchCompanies = usePortfolioStore((s) => s.fetchCompanies);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  const navigate = useNavigate();

  // Derived data
  const topFive = useMemo(() => getTopCompanies(5), [companies]);

  const quadrantData = useMemo(
    () => [
      { name: "Champion", value: stats.quadrantDistribution.champion },
      { name: "Quick Win", value: stats.quadrantDistribution.quickWin },
      { name: "Strategic", value: stats.quadrantDistribution.strategic },
      { name: "Foundation", value: stats.quadrantDistribution.foundation },
    ],
    [stats]
  );

  const valueThemeData = useMemo(() => {
    const themes: ValueTheme[] = [
      "Revenue Growth",
      "Margin Expansion",
      "Cost Cutting",
    ];
    return themes.map((theme) => {
      const themeCompanies = companies.filter((c) => c.valueTheme === theme);
      const ebitdaOpp = themeCompanies.reduce(
        (sum, c) => sum + c.adjustedEbitda,
        0
      );
      return {
        name: theme,
        companies: themeCompanies.length,
        ebitda: Math.round(ebitdaOpp * 10) / 10,
      };
    });
  }, [companies]);

  const platformCount = useMemo(() => getPlatformCount(), [companies]);
  const replicationOpps = useMemo(
    () => getReplicationOpportunities(),
    [companies]
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ================================================================ */}
      {/* Section 1: Hero */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--color-navy)]">
            AI Portfolio Intelligence
          </h1>
          <p className="text-lg text-[var(--color-muted)] mt-2 max-w-2xl">
            Three frameworks. One decision system. Built for PE timelines.
          </p>
        </div>

        <Card className="bg-[var(--color-subtle)] border-none max-w-xl">
          <p className="text-[var(--color-muted)] italic leading-relaxed">
            "The right question isn't which AI to build. It's which AI to build
            first."
          </p>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* Section 2: Portfolio Metrics */}
      {/* ================================================================ */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Portfolio Companies"
            value={stats.totalCompanies}
            subtitle="Under management"
            icon={<HiChartBar className="w-7 h-7" />}
            color="navy"
          />
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue * 1_000_000)}
            subtitle="Aggregate portfolio"
            icon={<HiCurrencyDollar className="w-7 h-7" />}
            color="blue"
          />
          <MetricCard
            label="EBITDA Opportunity"
            value={formatCurrency(stats.totalEbitdaOpportunity * 1_000_000)}
            subtitle="AI-adjusted upside"
            icon={<HiSparkles className="w-7 h-7" />}
            color="green"
          />
          <MetricCard
            label="Champions"
            value={stats.quadrantDistribution.champion}
            subtitle="High value + high readiness"
            icon={<HiTrophy className="w-7 h-7" />}
            color="green"
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Section 3: Three Framework Overview */}
      {/* ================================================================ */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          Three Frameworks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Framework 1: Value-Readiness Matrix */}
          <Card
            hover
            onClick={() => navigate("/portfolio/value-readiness")}
            padding="lg"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-green)]/10">
                <HiChartBar className="w-5 h-5 text-[var(--color-green)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                Value-Readiness Matrix
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                Which AI initiatives are ready now?
              </p>
              <p className="text-xs text-[var(--color-foreground)] font-medium">
                70% threshold separates Champions from Foundations
              </p>
              <div className="flex gap-2 pt-1">
                <Badge
                  label={`${stats.quadrantDistribution.champion} Champions`}
                  variant="green"
                  size="sm"
                />
                <Badge
                  label={`${stats.quadrantDistribution.quickWin} Quick Wins`}
                  variant="blue"
                  size="sm"
                />
              </div>
            </div>
          </Card>

          {/* Framework 2: Portfolio Amplification */}
          <Card
            hover
            onClick={() => navigate("/portfolio/portfolio-amplification")}
            padding="lg"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-blue)]/10">
                <HiShare className="w-5 h-5 text-[var(--color-blue)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                Portfolio Amplification
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                How do we leverage PE's structural advantage?
              </p>
              <p className="text-xs text-[var(--color-foreground)] font-medium">
                Deploy learnings across 54 companies, not one at a time
              </p>
              <div className="flex gap-2 pt-1">
                <Badge
                  label={`${platformCount} Platform plays`}
                  variant="blue"
                  size="sm"
                />
                <Badge
                  label={`${replicationOpps} replications`}
                  variant="navy"
                  size="sm"
                />
              </div>
            </div>
          </Card>

          {/* Framework 3: Hold Period Value Capture */}
          <Card
            hover
            onClick={() => navigate("/portfolio/hold-period")}
            padding="lg"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-navy)]/10">
                <HiClock className="w-5 h-5 text-[var(--color-navy)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                Hold Period Value Capture
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                How do we sequence against exit timelines?
              </p>
              <p className="text-xs text-[var(--color-foreground)] font-medium">
                25% cap on initiatives without 12-month visibility
              </p>
              <div className="flex gap-2 pt-1">
                <Badge
                  label={`${stats.trackDistribution.t1} Track 1`}
                  variant="green"
                  size="sm"
                />
                <Badge
                  label={`${stats.trackDistribution.t2} Track 2`}
                  variant="blue"
                  size="sm"
                />
                <Badge
                  label={`${stats.trackDistribution.t3} Track 3`}
                  variant="navy"
                  size="sm"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Section 4 + 5: Charts (2-column on desktop) */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quadrant Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
            Quadrant Distribution
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quadrantData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {quadrantData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={QUADRANT_COLORS[entry.name as Quadrant]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} companies`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {quadrantData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        QUADRANT_COLORS[item.name as Quadrant],
                    }}
                  />
                  <span className="text-sm text-[var(--color-foreground)] flex-1">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Value Theme Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
            Value Theme Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valueThemeData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{
                    fontSize: 12,
                    fill: "var(--color-muted)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "companies") return [`${value}`, "Companies"];
                    return [formatCurrency(value * 1_000_000), "EBITDA Opp."];
                  }}
                />
                <Bar
                  dataKey="companies"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {valueThemeData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={VALUE_THEME_COLORS[entry.name as ValueTheme]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {valueThemeData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        VALUE_THEME_COLORS[item.name as ValueTheme],
                    }}
                  />
                  <span className="text-[var(--color-muted)]">
                    {item.name}
                  </span>
                </div>
                <span className="font-medium text-[var(--color-foreground)]">
                  {formatCurrency(item.ebitda * 1_000_000)} opp.
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ================================================================ */}
      {/* Section 6: Top Companies Quick View */}
      {/* ================================================================ */}
      <section>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">
              Top Companies by Portfolio-Adjusted Priority
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/portfolio/dashboard")}
              icon={<HiArrowTrendingUp className="w-4 h-4" />}
            >
              View All
            </Button>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="text-left py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Cohort
                  </th>
                  <th className="text-left py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Quadrant
                  </th>
                  <th className="text-right py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    EBITDA Opp.
                  </th>
                  <th className="text-center py-3 px-2 text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">
                    Track
                  </th>
                </tr>
              </thead>
              <tbody>
                {topFive.map((company) => (
                  <tr
                    key={company.rank}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                  >
                    <td className="py-3 px-2 font-semibold text-[var(--color-navy)]">
                      #{company.rank}
                    </td>
                    <td className="py-3 px-2 font-medium text-[var(--color-foreground)]">
                      {company.name}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        label={company.cohort}
                        variant="gray"
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        label={company.quadrant}
                        variant={QUADRANT_BADGE_VARIANT[company.quadrant]}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-[var(--color-foreground)]">
                      {formatCurrency(company.adjustedEbitda * 1_000_000)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge
                        label={company.track}
                        variant={
                          company.track === "T1"
                            ? "green"
                            : company.track === "T2"
                              ? "blue"
                              : "navy"
                        }
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {topFive.map((company) => (
              <div
                key={company.rank}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-subtle)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[var(--color-navy)]">
                    #{company.rank}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-foreground)] text-sm">
                      {company.name}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge
                        label={company.quadrant}
                        variant={QUADRANT_BADGE_VARIANT[company.quadrant]}
                        size="sm"
                      />
                      <Badge
                        label={company.track}
                        variant={
                          company.track === "T1"
                            ? "green"
                            : company.track === "T2"
                              ? "blue"
                              : "navy"
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[var(--color-foreground)]">
                  {formatCurrency(company.adjustedEbitda * 1_000_000)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
