import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  HiArrowTrendingUp,
  HiAdjustmentsHorizontal,
  HiScissors,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi2";

import { Card, Badge } from "../../components/shared";
import { usePortfolioStore } from "../../stores/portfolio";
import { formatCurrency } from "../../lib/calculations";
import type { Company, ValueTheme, Cohort, Quadrant } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const THEME_CONFIG: Record<
  ValueTheme,
  {
    color: string;
    icon: React.ReactNode;
    definition: string;
    badgeVariant: "green" | "blue" | "navy";
  }
> = {
  "Revenue Growth": {
    color: "#36bf78",
    icon: <HiArrowTrendingUp className="w-6 h-6" />,
    definition:
      "AI applications that create new revenue streams, expand markets, enable premium pricing, or unlock new customer segments.",
    badgeVariant: "green",
  },
  "Margin Expansion": {
    color: "#02a2fd",
    icon: <HiAdjustmentsHorizontal className="w-6 h-6" />,
    definition:
      "AI applications that improve EBITDA through yield optimization, throughput enhancement, quality improvement, and labor productivity gains.",
    badgeVariant: "blue",
  },
  "Cost Cutting": {
    color: "#001278",
    icon: <HiScissors className="w-6 h-6" />,
    definition:
      "AI applications that reduce SG&A through automation of back-office functions, manual processing, and administrative overhead.",
    badgeVariant: "navy",
  },
};

const THEMES: ValueTheme[] = [
  "Revenue Growth",
  "Margin Expansion",
  "Cost Cutting",
];

const COHORTS: Cohort[] = [
  "Industrial",
  "Services",
  "Consumer",
  "Healthcare",
  "Logistics",
];

const QUADRANT_BADGE_VARIANT: Record<
  Quadrant,
  "green" | "blue" | "navy" | "gray"
> = {
  Champion: "green",
  "Quick Win": "blue",
  Strategic: "navy",
  Foundation: "gray",
};

type SortField =
  | "rank"
  | "name"
  | "cohort"
  | "quadrant"
  | "ebitda"
  | "adjustedEbitda"
  | "track";

type SortDirection = "asc" | "desc";

type BarViewMode = "count" | "ebitda";

// ============================================================================
// ValueDrivers Page
// ============================================================================

export default function ValueDrivers() {
  const { companies, getCompaniesByValueTheme } = usePortfolioStore();
  const fetchCompanies = usePortfolioStore((s) => s.fetchCompanies);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Local state
  const [activeTab, setActiveTab] = useState<ValueTheme>("Revenue Growth");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [barViewMode, setBarViewMode] = useState<BarViewMode>("count");

  // ========================================================================
  // Derived data
  // ========================================================================

  // Theme aggregation data
  const themeData = useMemo(() => {
    return THEMES.map((theme) => {
      const themeCompanies = getCompaniesByValueTheme(theme);
      const totalOpportunity = themeCompanies.reduce(
        (sum, c) => sum + c.adjustedEbitda,
        0
      );
      return {
        theme,
        companies: themeCompanies,
        count: themeCompanies.length,
        opportunity: totalOpportunity,
      };
    });
  }, [companies]);

  // Donut chart data
  const donutData = useMemo(() => {
    return themeData.map((t) => ({
      name: t.theme,
      value: t.count,
      opportunity: t.opportunity,
    }));
  }, [themeData]);

  const totalOpportunity = useMemo(
    () => themeData.reduce((sum, t) => sum + t.opportunity, 0),
    [themeData]
  );

  const totalCompanies = useMemo(
    () => themeData.reduce((sum, t) => sum + t.count, 0),
    [themeData]
  );

  // Stacked bar chart data
  const stackedBarData = useMemo(() => {
    return COHORTS.map((cohort) => {
      const cohortCompanies = companies.filter((c) => c.cohort === cohort);
      const row: Record<string, string | number> = { cohort };

      for (const theme of THEMES) {
        const themeCompanies = cohortCompanies.filter(
          (c) => c.valueTheme === theme
        );
        if (barViewMode === "count") {
          row[theme] = themeCompanies.length;
        } else {
          row[theme] = Math.round(
            themeCompanies.reduce((sum, c) => sum + c.adjustedEbitda, 0) * 10
          ) / 10;
        }
      }

      return row;
    });
  }, [companies, barViewMode]);

  // Active tab companies (sorted)
  const activeTabCompanies = useMemo(() => {
    const themeCompanies = getCompaniesByValueTheme(activeTab);

    return [...themeCompanies].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "rank":
          aVal = a.rank;
          bVal = b.rank;
          break;
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "cohort":
          aVal = a.cohort;
          bVal = b.cohort;
          break;
        case "quadrant":
          aVal = a.quadrant;
          bVal = b.quadrant;
          break;
        case "ebitda":
          aVal = a.ebitda;
          bVal = b.ebitda;
          break;
        case "adjustedEbitda":
          aVal = a.adjustedEbitda;
          bVal = b.adjustedEbitda;
          break;
        case "track":
          aVal = a.track;
          bVal = b.track;
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [activeTab, companies, sortField, sortDirection]);

  // ========================================================================
  // Handlers
  // ========================================================================

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" || field === "cohort" ? "asc" : "desc");
    }
  }

  // ========================================================================
  // Sub-components
  // ========================================================================

  function SortHeader({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-[var(--color-foreground)] ${
          isActive
            ? "text-[var(--color-foreground)]"
            : "text-[var(--color-muted)]"
        } ${className}`}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive && (
            <span className="text-[var(--color-blue)]">
              {sortDirection === "asc" ? (
                <HiChevronUp className="w-3.5 h-3.5" />
              ) : (
                <HiChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  }

  // Custom donut center label
  function DonutCenterLabel({
    viewBox,
  }: {
    viewBox?: { cx: number; cy: number };
  }) {
    if (!viewBox) return null;
    const { cx, cy } = viewBox;
    return (
      <g>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[var(--color-foreground)]"
          style={{ fontSize: 20, fontWeight: 700 }}
        >
          ${totalOpportunity.toFixed(1)}M
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[var(--color-muted)]"
          style={{ fontSize: 11 }}
        >
          Total Opportunity
        </text>
      </g>
    );
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="space-y-8">
      {/* ================================================================== */}
      {/* Section 1: Header                                                  */}
      {/* ================================================================== */}
      <section>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          Value Drivers
        </h1>
        <p className="mt-2 text-[var(--color-muted)] text-base max-w-2xl">
          Three themes. Every AI initiative maps to one. Know where the money
          flows.
        </p>
      </section>

      {/* ================================================================== */}
      {/* Section 2: Theme Definition Cards                                  */}
      {/* ================================================================== */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeData.map((t) => {
            const config = THEME_CONFIG[t.theme];
            return (
              <Card key={t.theme} padding="lg">
                <div className="space-y-4">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <span style={{ color: config.color }}>{config.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                      {t.theme}
                    </h3>
                  </div>

                  {/* Definition */}
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {config.definition}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
                    <Badge
                      label={`${t.count} companies`}
                      variant={config.badgeVariant}
                      size="sm"
                    />
                    <Badge
                      label={`$${t.opportunity.toFixed(1)}M opportunity`}
                      variant={config.badgeVariant}
                      size="sm"
                    />
                  </div>

                  {/* Accent bar */}
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================================================================== */}
      {/* Section 3 + 4: Charts (side-by-side desktop, stacked mobile)       */}
      {/* ================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart: Theme Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
            Theme Distribution
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "var(--color-muted)", strokeWidth: 1 }}
                >
                  {donutData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={THEME_CONFIG[entry.name as ValueTheme].color}
                    />
                  ))}
                  {/* Center label rendered via Label component */}
                  <DonutCenterLabel />
                </Pie>
                <RechartsTooltip
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

          {/* Legend */}
          <div className="mt-3 space-y-2">
            {donutData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        THEME_CONFIG[item.name as ValueTheme].color,
                    }}
                  />
                  <span className="text-[var(--color-foreground)]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-muted)]">
                    {item.value} companies
                  </span>
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {totalCompanies > 0
                      ? ((item.value / totalCompanies) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stacked Bar Chart: Theme by Cohort */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">
              Theme by Cohort
            </h3>
            {/* Toggle */}
            <div className="flex rounded-full border border-[var(--color-border)] overflow-hidden">
              <button
                onClick={() => setBarViewMode("count")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  barViewMode === "count"
                    ? "bg-[var(--color-navy)] text-white"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-subtle)]"
                }`}
              >
                Company Count
              </button>
              <button
                onClick={() => setBarViewMode("ebitda")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  barViewMode === "ebitda"
                    ? "bg-[var(--color-navy)] text-white"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-subtle)]"
                }`}
              >
                EBITDA Opportunity
              </button>
            </div>
          </div>

          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stackedBarData}
                margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
              >
                <XAxis
                  dataKey="cohort"
                  tick={{
                    fontSize: 12,
                    fill: "var(--color-muted)",
                  }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "var(--color-muted)",
                  }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                  label={{
                    value:
                      barViewMode === "count"
                        ? "Companies"
                        : "EBITDA Opp. ($M)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 0,
                    style: {
                      fill: "var(--color-muted)",
                      fontSize: 12,
                      fontWeight: 600,
                      textAnchor: "middle",
                    },
                  }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number, name: string) => [
                    barViewMode === "count"
                      ? `${value} companies`
                      : `$${value.toFixed(1)}M`,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={10}
                />
                {THEMES.map((theme) => (
                  <Bar
                    key={theme}
                    dataKey={theme}
                    stackId="themes"
                    fill={THEME_CONFIG[theme].color}
                    radius={
                      theme === "Cost Cutting" ? [4, 4, 0, 0] : [0, 0, 0, 0]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* ================================================================== */}
      {/* Section 5: Theme Detail Tables (Tab-switchable)                     */}
      {/* ================================================================== */}
      <section>
        <Card padding="sm" className="!p-0 overflow-hidden">
          {/* Tab Header */}
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-3">
              Theme Detail
            </h2>
            <div className="flex rounded-full border border-[var(--color-border)] overflow-hidden w-fit">
              {THEMES.map((theme) => {
                const config = THEME_CONFIG[theme];
                const isActive = activeTab === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => {
                      setActiveTab(theme);
                      setSortField("rank");
                      setSortDirection("asc");
                    }}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-subtle)]"
                    }`}
                    style={
                      isActive ? { backgroundColor: config.color } : undefined
                    }
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-[var(--color-muted)] mt-2">
              {activeTabCompanies.length} companies. Click any column header to
              sort.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[var(--color-subtle)] sticky top-0 z-10">
                <tr>
                  <SortHeader field="rank" className="w-16">
                    Rank
                  </SortHeader>
                  <SortHeader field="name">Company</SortHeader>
                  <SortHeader field="cohort">Cohort</SortHeader>
                  <SortHeader field="quadrant">Quadrant</SortHeader>
                  <SortHeader field="ebitda">EBITDA ($M)</SortHeader>
                  <SortHeader field="adjustedEbitda">
                    Adj. EBITDA ($M)
                  </SortHeader>
                  <SortHeader field="track">Track</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {activeTabCompanies.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`
                      transition-colors duration-100
                      hover:bg-[var(--color-blue)]/5
                      ${
                        i % 2 === 0
                          ? "bg-transparent"
                          : "bg-[var(--color-subtle)]/40"
                      }
                    `}
                  >
                    <td className="px-4 py-3 text-sm text-[var(--color-muted)] font-mono">
                      {c.rank}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-foreground)]">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={c.cohort}
                        variant={
                          ({
                            Industrial: "navy",
                            Services: "blue",
                            Consumer: "green",
                            Healthcare: "red",
                            Logistics: "gray",
                          } as Record<
                            Cohort,
                            "navy" | "blue" | "green" | "red" | "gray"
                          >)[c.cohort]
                        }
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={c.quadrant}
                        variant={QUADRANT_BADGE_VARIANT[c.quadrant]}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-foreground)] font-mono">
                      {c.ebitda.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-green)] font-semibold font-mono">
                      {c.adjustedEbitda.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={c.track}
                        variant={
                          c.track === "T1"
                            ? "green"
                            : c.track === "T2"
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

          {activeTabCompanies.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-[var(--color-muted)]">
                No companies in this theme.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
