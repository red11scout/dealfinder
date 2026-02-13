import { useState, useMemo, useEffect } from "react";
import {
  HiArrowRight,
  HiArrowsUpDown,
  HiChevronUp,
  HiChevronDown,
  HiLightBulb,
  HiCurrencyDollar,
  HiBuildingOffice2,
  HiTrophy,
  HiArrowTrendingUp,
  HiSquare3Stack3D,
  HiTableCells,
  HiArrowDownTray,
  HiXMark,
} from "react-icons/hi2";

import {
  Card,
  MetricCard,
  Badge,
  Button,
  FilterPills,
  SearchBar,
} from "../../components/shared";
import { usePortfolioStore, computeStats } from "../../stores/portfolio";
import { formatCurrency, formatNumber } from "../../lib/calculations";
import type {
  Company,
  Cohort,
  Quadrant,
  Track,
  InvestmentGroup,
} from "../../../../shared/types";

// ============================================================================
// Constants
// ============================================================================

const QUADRANT_BADGE_VARIANT: Record<Quadrant, "green" | "blue" | "navy" | "gray"> = {
  Champion: "green",
  "Quick Win": "blue",
  Strategic: "navy",
  Foundation: "gray",
};

const TRACK_BADGE_VARIANT: Record<Track, "green" | "blue" | "navy"> = {
  T1: "green",
  T2: "blue",
  T3: "navy",
};

const COHORT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Industrial", value: "Industrial" },
  { label: "Services", value: "Services" },
  { label: "Consumer", value: "Consumer" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Logistics", value: "Logistics" },
];

const QUADRANT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Champion", value: "Champion" },
  { label: "Quick Win", value: "Quick Win" },
  { label: "Strategic", value: "Strategic" },
  { label: "Foundation", value: "Foundation" },
];

const TRACK_OPTIONS = [
  { label: "All", value: "all" },
  { label: "T1", value: "T1" },
  { label: "T2", value: "T2" },
  { label: "T3", value: "T3" },
];

const INVESTMENT_GROUP_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Small Business", value: "Small Business" },
  { label: "Middle Market", value: "Middle Market" },
  { label: "Elevate", value: "Elevate" },
];

type SortKey =
  | "rank"
  | "name"
  | "cohort"
  | "investmentGroup"
  | "revenue"
  | "ebitda"
  | "valueScore"
  | "readinessScore"
  | "quadrant"
  | "replicationPotential"
  | "platformClassification"
  | "track"
  | "valueTheme"
  | "adjustedEbitda"
  | "portfolioAdjustedPriority";

type SortDirection = "asc" | "desc";

// ============================================================================
// Helper: sort companies
// ============================================================================

function sortCompanies(
  companies: Company[],
  key: SortKey,
  direction: SortDirection
): Company[] {
  return [...companies].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (key) {
      case "valueScore":
        aVal = a.scores.valueScore;
        bVal = b.scores.valueScore;
        break;
      case "readinessScore":
        aVal = a.scores.readinessScore;
        bVal = b.scores.readinessScore;
        break;
      default:
        aVal = a[key as keyof Company] as string | number;
        bVal = b[key as keyof Company] as string | number;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    const numA = Number(aVal);
    const numB = Number(bVal);
    return direction === "asc" ? numA - numB : numB - numA;
  });
}

// ============================================================================
// Section 1: Header + Filters Bar
// ============================================================================

function HeaderFilters({
  searchQuery,
  onSearchChange,
  selectedCohorts,
  selectedQuadrants,
  selectedTracks,
  selectedInvestmentGroups,
  onCohortChange,
  onQuadrantChange,
  onTrackChange,
  onInvestmentGroupChange,
  onClearFilters,
  hasActiveFilters,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedCohorts: Cohort[];
  selectedQuadrants: Quadrant[];
  selectedTracks: Track[];
  selectedInvestmentGroups: InvestmentGroup[];
  onCohortChange: (v: string) => void;
  onQuadrantChange: (v: string) => void;
  onTrackChange: (v: string) => void;
  onInvestmentGroupChange: (v: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          Integrated Dashboard
        </h1>
        <p className="text-[var(--color-muted)] mt-1">
          All three frameworks. One view. The complete picture.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by company name, cohort, or theme..."
        />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] w-28 shrink-0">
              Cohort
            </span>
            <FilterPills
              options={COHORT_OPTIONS}
              selected={selectedCohorts.length === 0 ? "all" : selectedCohorts}
              onChange={onCohortChange}
              multiSelect
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] w-28 shrink-0">
              Quadrant
            </span>
            <FilterPills
              options={QUADRANT_OPTIONS}
              selected={selectedQuadrants.length === 0 ? "all" : selectedQuadrants}
              onChange={onQuadrantChange}
              multiSelect
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] w-28 shrink-0">
              Track
            </span>
            <FilterPills
              options={TRACK_OPTIONS}
              selected={selectedTracks.length === 0 ? "all" : selectedTracks}
              onChange={onTrackChange}
              multiSelect
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] w-28 shrink-0">
              Inv. Group
            </span>
            <FilterPills
              options={INVESTMENT_GROUP_OPTIONS}
              selected={
                selectedInvestmentGroups.length === 0
                  ? "all"
                  : selectedInvestmentGroups
              }
              onChange={onInvestmentGroupChange}
              multiSelect
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon={<HiXMark className="w-4 h-4" />}
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Section 2: Cascading Decision Flow Diagram
// ============================================================================

function DecisionFlowDiagram() {
  return (
    <Card className="overflow-hidden">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Three-Framework Decision Pipeline
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
        {/* Framework 1 */}
        <div className="rounded-xl border border-[var(--color-green)]/30 bg-[var(--color-green)]/5 p-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-green)] mb-2">
            Framework 1
          </div>
          <div className="text-base font-bold text-[var(--color-foreground)] mb-1">
            Score
          </div>
          <div className="text-sm text-[var(--color-muted)] mb-3">
            Value + Readiness
          </div>
          <div className="text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] pt-2">
            PE-Native Priority
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex items-center justify-center">
          <HiArrowRight className="w-6 h-6 text-[var(--color-muted)]" />
        </div>

        {/* Framework 2 */}
        <div className="rounded-xl border border-[var(--color-blue)]/30 bg-[var(--color-blue)]/5 p-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue)] mb-2">
            Framework 2
          </div>
          <div className="text-base font-bold text-[var(--color-foreground)] mb-1">
            Amplify
          </div>
          <div className="text-sm text-[var(--color-muted)] mb-3">
            x Portfolio Leverage
          </div>
          <div className="text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] pt-2">
            Portfolio-Adjusted Priority
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex items-center justify-center">
          <HiArrowRight className="w-6 h-6 text-[var(--color-muted)]" />
        </div>

        {/* Framework 3 */}
        <div className="rounded-xl border border-[var(--color-navy)]/30 bg-[var(--color-navy)]/5 p-5 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] mb-2">
            Framework 3
          </div>
          <div className="text-base font-bold text-[var(--color-foreground)] mb-1">
            Sequence
          </div>
          <div className="text-sm text-[var(--color-muted)] mb-3">
            Mapped to Hold Period
          </div>
          <div className="text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] pt-2">
            Implementation Roadmap
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Section 3: Summary Metric Cards
// ============================================================================

function SummaryMetrics({
  filteredCompanies,
  totalCompanies,
}: {
  filteredCompanies: Company[];
  totalCompanies: number;
}) {
  const stats = useMemo(() => computeStats(filteredCompanies), [filteredCompanies]);

  const champions = filteredCompanies.filter((c) => c.quadrant === "Champion").length;
  const platformPlays = filteredCompanies.filter(
    (c) => c.platformClassification === "Platform"
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        label="Companies Shown"
        value={`${filteredCompanies.length} of ${totalCompanies}`}
        icon={<HiBuildingOffice2 className="w-6 h-6" />}
        color="navy"
      />
      <MetricCard
        label="Total Revenue"
        value={formatCurrency(stats.totalRevenue, true)}
        subtitle="$M across portfolio"
        icon={<HiCurrencyDollar className="w-6 h-6" />}
        color="blue"
      />
      <MetricCard
        label="Total EBITDA"
        value={formatCurrency(stats.totalEbitda, true)}
        subtitle="$M combined"
        icon={<HiCurrencyDollar className="w-6 h-6" />}
        color="green"
      />
      <MetricCard
        label="EBITDA Opportunity"
        value={formatCurrency(stats.totalEbitdaOpportunity, true)}
        subtitle="$M adjusted"
        icon={<HiArrowTrendingUp className="w-6 h-6" />}
        color="green"
      />
      <MetricCard
        label="Champions"
        value={champions}
        icon={<HiTrophy className="w-6 h-6" />}
        color="green"
      />
      <MetricCard
        label="Platform Plays"
        value={platformPlays}
        icon={<HiSquare3Stack3D className="w-6 h-6" />}
        color="blue"
      />
    </div>
  );
}

// ============================================================================
// Section 4: Master Company Table
// ============================================================================

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] cursor-pointer select-none hover:text-[var(--color-foreground)] transition-colors whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDirection === "asc" ? (
            <HiChevronUp className="w-3.5 h-3.5 text-[var(--color-blue)]" />
          ) : (
            <HiChevronDown className="w-3.5 h-3.5 text-[var(--color-blue)]" />
          )
        ) : (
          <HiArrowsUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

function MasterTable({
  filteredCompanies,
  totalCompanies,
}: {
  filteredCompanies: Company[];
  totalCompanies: number;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" || key === "cohort" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(
    () => sortCompanies(filteredCompanies, sortKey, sortDirection),
    [filteredCompanies, sortKey, sortDirection]
  );

  const sharedHeaderProps = {
    currentSort: sortKey,
    currentDirection: sortDirection,
    onSort: handleSort,
  };

  return (
    <Card padding="sm" className="overflow-hidden">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <HiTableCells className="w-5 h-5 text-[var(--color-navy)]" />
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Master Company Table
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-muted)]">
            Showing {sorted.length} of {totalCompanies} companies
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={<HiArrowDownTray className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead className="sticky top-0 z-10 bg-[var(--color-card)] border-b border-[var(--color-border)]">
            <tr>
              <SortHeader label="#" sortKey="rank" {...sharedHeaderProps} className="w-12" />
              <SortHeader label="Company" sortKey="name" {...sharedHeaderProps} className="sticky left-0 z-20 bg-[var(--color-card)] min-w-[180px]" />
              <SortHeader label="Cohort" sortKey="cohort" {...sharedHeaderProps} />
              <SortHeader label="Inv. Group" sortKey="investmentGroup" {...sharedHeaderProps} />
              <SortHeader label="Revenue ($M)" sortKey="revenue" {...sharedHeaderProps} />
              <SortHeader label="EBITDA ($M)" sortKey="ebitda" {...sharedHeaderProps} />
              <SortHeader label="Value" sortKey="valueScore" {...sharedHeaderProps} />
              <SortHeader label="Readiness" sortKey="readinessScore" {...sharedHeaderProps} />
              <SortHeader label="Quadrant" sortKey="quadrant" {...sharedHeaderProps} />
              <SortHeader label="Repl. Potential" sortKey="replicationPotential" {...sharedHeaderProps} />
              <SortHeader label="Platform" sortKey="platformClassification" {...sharedHeaderProps} />
              <SortHeader label="Track" sortKey="track" {...sharedHeaderProps} />
              <SortHeader label="Value Theme" sortKey="valueTheme" {...sharedHeaderProps} />
              <SortHeader label="Adj. EBITDA ($M)" sortKey="adjustedEbitda" {...sharedHeaderProps} />
              <SortHeader label="Port-Adj Priority ($M)" sortKey="portfolioAdjustedPriority" {...sharedHeaderProps} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr
                key={c.rank}
                className={`
                  border-b border-[var(--color-border)]/50
                  hover:bg-[var(--color-blue)]/5
                  transition-colors duration-100
                  ${i % 2 === 0 ? "bg-[var(--color-card)]" : "bg-[var(--color-subtle)]/30"}
                `}
              >
                <td className="px-3 py-2.5 text-sm text-[var(--color-muted)] font-mono">
                  {c.rank}
                </td>
                <td className="px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)] sticky left-0 z-10 bg-inherit whitespace-nowrap">
                  {c.name}
                </td>
                <td className="px-3 py-2.5">
                  <Badge label={c.cohort} variant="gray" size="sm" />
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-muted)] whitespace-nowrap">
                  {c.investmentGroup}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {formatCurrency(c.revenue, false)}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {formatCurrency(c.ebitda, false)}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {c.scores.valueScore.toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {c.scores.readinessScore.toFixed(2)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    label={c.quadrant}
                    variant={QUADRANT_BADGE_VARIANT[c.quadrant]}
                    size="sm"
                  />
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-center">
                  {c.replicationPotential}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    label={c.platformClassification}
                    variant={
                      c.platformClassification === "Platform"
                        ? "blue"
                        : c.platformClassification === "Hybrid"
                        ? "gray"
                        : "red"
                    }
                    size="sm"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    label={c.track}
                    variant={TRACK_BADGE_VARIANT[c.track]}
                    size="sm"
                  />
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-muted)] whitespace-nowrap">
                  {c.valueTheme}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {formatCurrency(c.adjustedEbitda, false)}
                </td>
                <td className="px-3 py-2.5 text-sm text-[var(--color-foreground)] font-mono text-right">
                  {formatCurrency(c.portfolioAdjustedPriority, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ============================================================================
// Section 5: Key Insights Panel
// ============================================================================

function KeyInsights({ filteredCompanies }: { filteredCompanies: Company[] }) {
  const insights = useMemo(() => {
    const result: { text: string }[] = [];

    if (filteredCompanies.length === 0) return result;

    // Insight 1: Top 5 Champions as % of total opportunity
    const champions = filteredCompanies.filter((c) => c.quadrant === "Champion");
    const top5Champions = [...champions]
      .sort((a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority)
      .slice(0, 5);
    const top5Total = top5Champions.reduce(
      (sum, c) => sum + c.portfolioAdjustedPriority,
      0
    );
    const totalOpp = filteredCompanies.reduce(
      (sum, c) => sum + c.portfolioAdjustedPriority,
      0
    );
    if (totalOpp > 0) {
      const pct = ((top5Total / totalOpp) * 100).toFixed(1);
      result.push({
        text: `Your top ${Math.min(5, top5Champions.length)} Champions represent ${pct}% of total portfolio opportunity.`,
      });
    }

    // Insight 2: Platform replication value
    const platformCompanies = filteredCompanies.filter(
      (c) => c.platformClassification === "Platform"
    );
    const platformReplicationValue = platformCompanies.reduce(
      (sum, c) =>
        sum + (c.portfolioAdjustedPriority - c.adjustedPriority),
      0
    );
    if (totalOpp > 0 && platformReplicationValue > 0) {
      const pct = ((platformReplicationValue / totalOpp) * 100).toFixed(1);
      result.push({
        text: `Platform plays could generate ${pct}% additional value through replication across the portfolio.`,
      });
    }

    // Insight 3: T1 count
    const t1Count = filteredCompanies.filter((c) => c.track === "T1").length;
    result.push({
      text: `${t1Count} companies are assigned to Track 1 for immediate EBITDA impact within Year 1.`,
    });

    // Insight 4: Cohort with highest Champions concentration
    const cohortChampions: Record<string, number> = {};
    for (const c of filteredCompanies) {
      if (c.quadrant === "Champion") {
        cohortChampions[c.cohort] = (cohortChampions[c.cohort] || 0) + 1;
      }
    }
    const topCohort = Object.entries(cohortChampions).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (topCohort) {
      result.push({
        text: `The ${topCohort[0]} cohort has the highest concentration of Champions (${topCohort[1]}).`,
      });
    }

    // Insight 5: Total adjusted EBITDA opportunity
    const totalAdjEbitda = filteredCompanies.reduce(
      (sum, c) => sum + c.adjustedEbitda,
      0
    );
    result.push({
      text: `Total AI-adjusted EBITDA opportunity across the filtered view is ${formatCurrency(totalAdjEbitda, false)}.`,
    });

    return result;
  }, [filteredCompanies]);

  if (insights.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
        Key Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <Card key={i} padding="sm">
            <div className="flex items-start gap-3 p-2">
              <div className="shrink-0 mt-0.5">
                <HiLightBulb className="w-5 h-5 text-[var(--color-blue)]" />
              </div>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                {insight.text}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard Page (Default Export)
// ============================================================================

export default function Dashboard() {
  const {
    companies,
    filters,
    setFilter,
    clearFilters,
    getFilteredCompanies,
  } = usePortfolioStore();
  const fetchCompanies = usePortfolioStore((s) => s.fetchCompanies);
  const loading = usePortfolioStore((s) => s.loading);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = getFilteredCompanies();

  const hasActiveFilters =
    filters.selectedCohorts.length > 0 ||
    filters.selectedQuadrants.length > 0 ||
    filters.selectedTracks.length > 0 ||
    filters.selectedInvestmentGroups.length > 0 ||
    filters.searchQuery.length > 0;

  // ---- Filter toggle handlers ----

  const handleCohortChange = (value: string) => {
    if (value === "all") {
      setFilter("selectedCohorts", []);
      return;
    }
    const cohort = value as Cohort;
    const current = filters.selectedCohorts;
    setFilter(
      "selectedCohorts",
      current.includes(cohort)
        ? current.filter((c) => c !== cohort)
        : [...current, cohort]
    );
  };

  const handleQuadrantChange = (value: string) => {
    if (value === "all") {
      setFilter("selectedQuadrants", []);
      return;
    }
    const quad = value as Quadrant;
    const current = filters.selectedQuadrants;
    setFilter(
      "selectedQuadrants",
      current.includes(quad)
        ? current.filter((q) => q !== quad)
        : [...current, quad]
    );
  };

  const handleTrackChange = (value: string) => {
    if (value === "all") {
      setFilter("selectedTracks", []);
      return;
    }
    const track = value as Track;
    const current = filters.selectedTracks;
    setFilter(
      "selectedTracks",
      current.includes(track)
        ? current.filter((t) => t !== track)
        : [...current, track]
    );
  };

  const handleInvestmentGroupChange = (value: string) => {
    if (value === "all") {
      setFilter("selectedInvestmentGroups", []);
      return;
    }
    const group = value as InvestmentGroup;
    const current = filters.selectedInvestmentGroups;
    setFilter(
      "selectedInvestmentGroups",
      current.includes(group)
        ? current.filter((g) => g !== group)
        : [...current, group]
    );
  };

  const handleSearchChange = (value: string) => {
    setFilter("searchQuery", value);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Section 1: Header + Filters */}
      <HeaderFilters
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        selectedCohorts={filters.selectedCohorts}
        selectedQuadrants={filters.selectedQuadrants}
        selectedTracks={filters.selectedTracks}
        selectedInvestmentGroups={filters.selectedInvestmentGroups}
        onCohortChange={handleCohortChange}
        onQuadrantChange={handleQuadrantChange}
        onTrackChange={handleTrackChange}
        onInvestmentGroupChange={handleInvestmentGroupChange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Section 2: Decision Flow Diagram */}
      <DecisionFlowDiagram />

      {/* Section 3: Summary Metric Cards */}
      <SummaryMetrics
        filteredCompanies={filteredCompanies}
        totalCompanies={companies.length}
      />

      {/* Section 4: Master Company Table */}
      <MasterTable
        filteredCompanies={filteredCompanies}
        totalCompanies={companies.length}
      />

      {/* Section 5: Key Insights */}
      <KeyInsights filteredCompanies={filteredCompanies} />
    </div>
  );
}
