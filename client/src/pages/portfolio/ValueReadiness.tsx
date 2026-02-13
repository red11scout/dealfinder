import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  Legend,
} from "recharts";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { usePortfolioStore } from "../../stores/portfolio";
import { Card, Badge, FilterPills, SearchBar } from "../../components/shared";
import { formatCurrency } from "../../lib/calculations";
import type { Company, Cohort, Quadrant } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const COHORT_COLORS: Record<Cohort, string> = {
  Industrial: "#001278",
  Services: "#02a2fd",
  Consumer: "#36bf78",
  Healthcare: "#f59e0b",
  Logistics: "#8b5cf6",
};

const QUADRANT_CONFIG: Record<
  Quadrant,
  { label: string; variant: "green" | "blue" | "navy" | "gray"; action: string }
> = {
  Champion: {
    label: "Champions",
    variant: "green",
    action: "Fund aggressively. These companies are ready and the value is real.",
  },
  "Quick Win": {
    label: "Quick Wins",
    variant: "blue",
    action: "Deploy fast. High readiness means low friction. Capture value now.",
  },
  Strategic: {
    label: "Strategic",
    variant: "navy",
    action: "Invest in readiness. The value is there but the org needs work first.",
  },
  Foundation: {
    label: "Foundations",
    variant: "gray",
    action: "Build the base. These need time, structure, and patience.",
  },
};

const COHORT_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Industrial", value: "Industrial" },
  { label: "Services", value: "Services" },
  { label: "Consumer", value: "Consumer" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Logistics", value: "Logistics" },
];

const INVESTMENT_GROUP_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Small Business", value: "Small Business" },
  { label: "Middle Market", value: "Middle Market" },
  { label: "Elevate", value: "Elevate" },
];

type SortField =
  | "rank"
  | "name"
  | "cohort"
  | "valueScore"
  | "readinessScore"
  | "quadrant"
  | "ebitda"
  | "adjustedEbitda"
  | "track";

type SortDirection = "asc" | "desc";

// ============================================================================
// BubbleTooltip - Custom tooltip for the scatter chart
// ============================================================================

interface BubbleTooltipPayload {
  name: string;
  valueScore: number;
  readinessScore: number;
  cohort: Cohort;
  ebitda: number;
  adjustedEbitda: number;
  quadrant: Quadrant;
}

function BubbleTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BubbleTooltipPayload }>;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const config = QUADRANT_CONFIG[data.quadrant];

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 min-w-[220px]">
      <p className="text-base font-bold text-[var(--color-foreground)] mb-2">
        {data.name}
      </p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Value Score</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            {data.valueScore.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Readiness Score</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            {data.readinessScore.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Cohort</span>
          <span
            className="font-semibold"
            style={{ color: COHORT_COLORS[data.cohort] }}
          >
            {data.cohort}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">EBITDA</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            ${data.ebitda.toFixed(1)}M
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Adj. EBITDA</span>
          <span className="font-semibold text-[var(--color-green)]">
            ${data.adjustedEbitda.toFixed(1)}M
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--color-muted)]">Quadrant</span>
          <Badge label={config.label} variant={config.variant} size="sm" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Legend
// ============================================================================

function CohortLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {(Object.entries(COHORT_COLORS) as [Cohort, string][]).map(
        ([cohort, color]) => (
          <div key={cohort} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-[var(--color-muted)]">{cohort}</span>
          </div>
        ),
      )}
    </div>
  );
}

// ============================================================================
// ValueReadiness Page Component
// ============================================================================

export default function ValueReadiness() {
  const navigate = useNavigate();
  const {
    companies,
    stats,
    filters,
    setFilter,
    getFilteredCompanies,
  } = usePortfolioStore();
  const fetchCompanies = usePortfolioStore((s) => s.fetchCompanies);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Bridge single-value FilterPills to array-based filter state
  const toggleCohort = (value: string) => {
    const current = filters.selectedCohorts;
    const next = current.includes(value as any)
      ? current.filter((v) => v !== value)
      : [...current, value as any];
    setFilter("selectedCohorts", next);
  };

  const toggleInvestmentGroup = (value: string) => {
    const current = filters.selectedInvestmentGroups;
    const next = current.includes(value as any)
      ? current.filter((v) => v !== value)
      : [...current, value as any];
    setFilter("selectedInvestmentGroups", next);
  };

  const setSearchQuery = (value: string) => {
    setFilter("searchQuery", value);
  };

  // Local state
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [calcEbitda, setCalcEbitda] = useState(50);
  const [calcValueScore, setCalcValueScore] = useState(7);

  // Filtered companies
  const filteredCompanies = getFilteredCompanies();

  // Scatter chart data
  const scatterData = useMemo(
    () =>
      filteredCompanies.map((c) => ({
        name: c.name,
        readinessScore: c.scores.readinessScore,
        valueScore: c.scores.valueScore,
        ebitda: c.ebitda,
        adjustedEbitda: c.adjustedEbitda,
        cohort: c.cohort,
        quadrant: c.quadrant,
        // Use log scale for bubble size to prevent enormous bubbles
        bubbleSize: Math.max(Math.log(c.ebitda + 1) * 120, 80),
      })),
    [filteredCompanies],
  );

  // Quadrant summary data
  const quadrantSummaries = useMemo(() => {
    const quadrants: Quadrant[] = ["Champion", "Quick Win", "Strategic", "Foundation"];
    return quadrants.map((q) => {
      const qCompanies = filteredCompanies.filter((c) => c.quadrant === q);
      const totalAdjustedEbitda = qCompanies.reduce(
        (sum, c) => sum + c.adjustedEbitda,
        0,
      );
      const topThree = [...qCompanies]
        .sort((a, b) => b.adjustedEbitda - a.adjustedEbitda)
        .slice(0, 3);
      return {
        quadrant: q,
        count: qCompanies.length,
        totalAdjustedEbitda,
        topThree,
        ...QUADRANT_CONFIG[q],
      };
    });
  }, [filteredCompanies]);

  // Sorted table data
  const sortedCompanies = useMemo(() => {
    const sorted = [...filteredCompanies].sort((a, b) => {
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
        case "valueScore":
          aVal = a.scores.valueScore;
          bVal = b.scores.valueScore;
          break;
        case "readinessScore":
          aVal = a.scores.readinessScore;
          bVal = b.scores.readinessScore;
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

    return sorted;
  }, [filteredCompanies, sortField, sortDirection]);

  // Calculator output
  const calcAdjustedEbitda = calcEbitda * 0.15 * (calcValueScore / 7);

  // Sort handler
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" || field === "cohort" ? "asc" : "desc");
    }
  }

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
          isActive ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)]"
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

  function getQuadrantBadge(quadrant: Quadrant) {
    const config = QUADRANT_CONFIG[quadrant];
    return <Badge label={config.label} variant={config.variant} size="sm" />;
  }

  function getCohortBadge(cohort: Cohort) {
    const variantMap: Record<Cohort, "navy" | "blue" | "green" | "gray" | "red"> = {
      Industrial: "navy",
      Services: "blue",
      Consumer: "green",
      Healthcare: "red",
      Logistics: "gray",
    };
    return <Badge label={cohort} variant={variantMap[cohort]} size="sm" />;
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Header + Filters                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
            Value-Readiness Matrix
          </h1>
          <p className="mt-2 text-[var(--color-muted)] text-base max-w-2xl">
            Score each initiative. Plot it. The picture tells the truth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Cohort
            </p>
            <FilterPills
              options={COHORT_OPTIONS}
              selected={filters.selectedCohorts}
              onChange={toggleCohort}
              multiSelect
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Investment Group
            </p>
            <FilterPills
              options={INVESTMENT_GROUP_OPTIONS}
              selected={filters.selectedInvestmentGroups}
              onChange={toggleInvestmentGroup}
              multiSelect
            />
          </div>
        </div>

        <SearchBar
          value={filters.searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies..."
          className="max-w-md"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Interactive Bubble Chart                                 */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="lg" className="!p-4 sm:!p-6 lg:!p-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Portfolio Landscape
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Bubble size reflects EBITDA. Color by cohort. Lines at 7 divide the quadrants.
          </p>
        </div>

        <div className="h-[350px] sm:h-[420px] lg:h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 30, right: 30, bottom: 30, left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                opacity={0.5}
              />
              <XAxis
                type="number"
                dataKey="readinessScore"
                name="Readiness"
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
              >
                <Label
                  value="Readiness Score"
                  position="bottom"
                  offset={10}
                  style={{ fill: "var(--color-muted)", fontSize: 13, fontWeight: 600 }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="valueScore"
                name="Value"
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
              >
                <Label
                  value="Value Score"
                  angle={-90}
                  position="insideLeft"
                  offset={0}
                  style={{ fill: "var(--color-muted)", fontSize: 13, fontWeight: 600, textAnchor: "middle" }}
                />
              </YAxis>
              <ZAxis
                type="number"
                dataKey="bubbleSize"
                range={[60, 600]}
                name="EBITDA"
              />

              {/* Quadrant reference lines */}
              <ReferenceLine
                x={7}
                stroke="var(--color-muted)"
                strokeDasharray="6 4"
                strokeOpacity={0.4}
              />
              <ReferenceLine
                y={7}
                stroke="var(--color-muted)"
                strokeDasharray="6 4"
                strokeOpacity={0.4}
              />

              {/* Quadrant labels */}
              <ReferenceLine x={3.5} y={8.5} ifOverflow="extendDomain">
                <Label
                  value="Strategic"
                  position="center"
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.35,
                    textTransform: "uppercase",
                  }}
                />
              </ReferenceLine>
              <ReferenceLine x={8.5} y={8.5} ifOverflow="extendDomain">
                <Label
                  value="Champions"
                  position="center"
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.35,
                    textTransform: "uppercase",
                  }}
                />
              </ReferenceLine>
              <ReferenceLine x={8.5} y={1.5} ifOverflow="extendDomain">
                <Label
                  value="Quick Wins"
                  position="center"
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.35,
                    textTransform: "uppercase",
                  }}
                />
              </ReferenceLine>
              <ReferenceLine x={3.5} y={1.5} ifOverflow="extendDomain">
                <Label
                  value="Foundations"
                  position="center"
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.35,
                    textTransform: "uppercase",
                  }}
                />
              </ReferenceLine>

              <RechartsTooltip
                content={<BubbleTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />

              <Scatter data={scatterData} fillOpacity={0.75} strokeWidth={1}>
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COHORT_COLORS[entry.cohort]}
                    stroke={COHORT_COLORS[entry.cohort]}
                    strokeOpacity={0.9}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <CohortLegend />
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Methodology (Collapsible)                               */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              Methodology
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              How we score. No black boxes.
            </p>
          </div>
          {methodologyOpen ? (
            <HiChevronUp className="w-5 h-5 text-[var(--color-muted)]" />
          ) : (
            <HiChevronDown className="w-5 h-5 text-[var(--color-muted)]" />
          )}
        </button>

        {methodologyOpen && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-navy)]">
                Value Score
              </h3>
              <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
                <p>Value =</p>
                <p className="pl-4">(EBITDA_Impact x 0.50)</p>
                <p className="pl-4">+ (Rev_Enable x 0.25)</p>
                <p className="pl-4">+ (Risk_Reduce x 0.25)</p>
              </div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                Weights reflect PE focus: EBITDA impact carries half the weight.
                Revenue and risk share the remainder equally.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-blue)]">
                Readiness Score
              </h3>
              <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
                <p>Readiness =</p>
                <p className="pl-4">(Org_Cap x 0.35)</p>
                <p className="pl-4">+ (Data_Ready x 0.35)</p>
                <p className="pl-4">+ (Tech_Infra x 0.20)</p>
                <p className="pl-4">+ (Timeline x 0.10)</p>
              </div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                People and data together make 70% of readiness. Hardware and
                timing are necessary but not sufficient.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-green)]">
                Adjusted EBITDA
              </h3>
              <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
                <p>Adj_EBITDA =</p>
                <p className="pl-4">EBITDA x 0.15</p>
                <p className="pl-4">x (Value_Score / 7)</p>
              </div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                Bain research shows 5-25% EBITDA improvement from AI. We use 15%
                as a conservative midpoint, scaled by value score normalized to 7.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Quadrant Summary Cards                                  */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
          Quadrant Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quadrantSummaries.map((q) => {
            const borderColorMap: Record<Quadrant, string> = {
              Champion: "border-l-[var(--color-green)]",
              "Quick Win": "border-l-[var(--color-blue)]",
              Strategic: "border-l-[var(--color-navy)]",
              Foundation: "border-l-[var(--color-muted)]",
            };

            return (
              <Card key={q.quadrant} className={`border-l-4 ${borderColorMap[q.quadrant]}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge label={q.label} variant={q.variant} />
                    <span className="text-2xl font-bold text-[var(--color-foreground)]">
                      {q.count}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                      EBITDA Opportunity
                    </p>
                    <p className="text-lg font-bold text-[var(--color-foreground)]">
                      ${q.totalAdjustedEbitda.toFixed(1)}M
                    </p>
                  </div>

                  {q.topThree.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                        Top Companies
                      </p>
                      <div className="space-y-1">
                        {q.topThree.map((c) => (
                          <div
                            key={c.name}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[var(--color-foreground)] truncate mr-2">
                              {c.name}
                            </span>
                            <span className="text-[var(--color-muted)] whitespace-nowrap">
                              ${c.adjustedEbitda.toFixed(1)}M
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[var(--color-muted)] italic leading-relaxed pt-1 border-t border-[var(--color-border)]">
                    {q.action}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5: Company Scoring Table                                   */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="sm" className="!p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Company Scores
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {filteredCompanies.length} companies. Click any column header to sort.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[var(--color-subtle)] sticky top-0 z-10">
              <tr>
                <SortHeader field="rank" className="w-16">
                  #
                </SortHeader>
                <SortHeader field="name">Company</SortHeader>
                <SortHeader field="cohort">Cohort</SortHeader>
                <SortHeader field="valueScore">Value</SortHeader>
                <SortHeader field="readinessScore">Readiness</SortHeader>
                <SortHeader field="quadrant">Quadrant</SortHeader>
                <SortHeader field="ebitda">EBITDA ($M)</SortHeader>
                <SortHeader field="adjustedEbitda">Adj. EBITDA ($M)</SortHeader>
                <SortHeader field="track">Track</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sortedCompanies.map((c, i) => (
                <tr
                  key={c.name}
                  className={`
                    transition-colors duration-100
                    hover:bg-[var(--color-blue)]/5
                    ${i % 2 === 0 ? "bg-transparent" : "bg-[var(--color-subtle)]/40"}
                  `}
                >
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)] font-mono">
                    {c.rank}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-foreground)]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3">{getCohortBadge(c.cohort)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]">
                    {c.scores.valueScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]">
                    {c.scores.readinessScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">{getQuadrantBadge(c.quadrant)}</td>
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
                            : "gray"
                      }
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCompanies.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[var(--color-muted)]">
              No companies match the current filters.
            </p>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 6: EBITDA Translation Calculator                           */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              Try It
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Plug in a number. See what AI-adjusted EBITDA looks like.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* EBITDA Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                EBITDA ($M)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={calcEbitda}
                onChange={(e) =>
                  setCalcEbitda(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-full h-12 px-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-[var(--color-blue)] transition-all"
              />
            </div>

            {/* Value Score Slider */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                Value Score:{" "}
                <span className="text-[var(--color-blue)]">{calcValueScore}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={calcValueScore}
                onChange={(e) => setCalcValueScore(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--color-blue)]"
                style={{
                  background: `linear-gradient(to right, var(--color-blue) 0%, var(--color-blue) ${((calcValueScore - 1) / 9) * 100}%, var(--color-border) ${((calcValueScore - 1) / 9) * 100}%, var(--color-border) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[var(--color-muted)]">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                Adjusted EBITDA
              </label>
              <div className="h-12 flex items-center px-4 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                <span className="text-2xl font-bold text-[var(--color-green)] font-mono">
                  ${calcAdjustedEbitda.toFixed(2)}M
                </span>
              </div>
            </div>
          </div>

          {/* Formula with values */}
          <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
            <span className="text-[var(--color-muted)]">Adjusted EBITDA = </span>
            <span className="text-[var(--color-foreground)] font-semibold">
              ${calcEbitda}M
            </span>
            <span className="text-[var(--color-muted)]"> x </span>
            <span className="text-[var(--color-foreground)] font-semibold">
              0.15
            </span>
            <span className="text-[var(--color-muted)]"> x (</span>
            <span className="text-[var(--color-blue)] font-semibold">
              {calcValueScore}
            </span>
            <span className="text-[var(--color-muted)]"> / 7) = </span>
            <span className="text-[var(--color-green)] font-bold">
              ${calcAdjustedEbitda.toFixed(2)}M
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
