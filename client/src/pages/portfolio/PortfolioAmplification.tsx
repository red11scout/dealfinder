import { useState, useMemo } from "react";
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
import {
  HiSquaresPlus,
  HiCpuChip,
  HiWrenchScrewdriver,
  HiArrowsPointingOut,
} from "react-icons/hi2";
import { usePortfolioStore } from "../../stores/portfolio";
import { Card, MetricCard, Badge, FilterPills, Button, Tooltip } from "../../components/shared";
import { calculatePortfolioAdjustedPriority, formatCurrency, formatNumber } from "../../lib/calculations";
import type { Company, Cohort, PlatformClassification } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const PLATFORM_COLORS: Record<PlatformClassification, string> = {
  Platform: "#001278",
  Hybrid: "#02a2fd",
  Point: "#9ca3af",
};

const PLATFORM_CONFIG: Record<
  PlatformClassification,
  { label: string; variant: "navy" | "blue" | "gray" }
> = {
  Platform: { label: "Platform", variant: "navy" },
  Hybrid: { label: "Hybrid", variant: "blue" },
  Point: { label: "Point", variant: "gray" },
};

const COHORT_BADGE_VARIANTS: Record<Cohort, "navy" | "blue" | "green" | "red" | "gray"> = {
  Industrial: "navy",
  Services: "blue",
  Consumer: "green",
  Healthcare: "red",
  Logistics: "gray",
};

type SortField =
  | "rank"
  | "name"
  | "cohort"
  | "peNativeScore"
  | "replicationPotential"
  | "replicationCount"
  | "platformClassification"
  | "portfolioAdjustedPriority";

type SortDirection = "asc" | "desc";

// ============================================================================
// Helper: compute PE-Native Score inline
// ============================================================================

function getPeNativeScore(company: Company): number {
  return company.scores.valueScore * 0.5 + company.scores.readinessScore * 0.5;
}

// ============================================================================
// BubbleTooltip - Custom tooltip for the scatter chart
// ============================================================================

interface BubbleTooltipPayload {
  name: string;
  replicationPotential: number;
  peNativeScore: number;
  cohort: Cohort;
  platformClassification: PlatformClassification;
  ebitda: number;
  portfolioAdjustedPriority: number;
  valueScore: number;
  readinessScore: number;
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
  const platformConfig = PLATFORM_CONFIG[data.platformClassification];

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 min-w-[240px]">
      <p className="text-base font-bold text-[var(--color-foreground)] mb-2">
        {data.name}
      </p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">PE-Native Score</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            {data.peNativeScore.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Replication Potential</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            {data.replicationPotential}
          </span>
        </div>
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
          <span className="font-semibold text-[var(--color-foreground)]">
            {data.cohort}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">EBITDA</span>
          <span className="font-semibold text-[var(--color-foreground)]">
            ${data.ebitda.toFixed(1)}M
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--color-muted)]">Classification</span>
          <Badge label={platformConfig.label} variant={platformConfig.variant} size="sm" />
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Portfolio-Adj. Priority</span>
          <span className="font-semibold text-[var(--color-green)]">
            {formatCurrency(data.portfolioAdjustedPriority)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Legend for Platform Classification
// ============================================================================

function PlatformLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {(Object.entries(PLATFORM_COLORS) as [PlatformClassification, string][]).map(
        ([classification, color]) => (
          <div key={classification} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-[var(--color-muted)]">{classification}</span>
          </div>
        ),
      )}
    </div>
  );
}

// ============================================================================
// PortfolioAmplification Page Component
// ============================================================================

export default function PortfolioAmplification() {
  const {
    companies,
    stats,
    filters,
    setFilter,
    getFilteredCompanies,
    getPlatformCount,
    getReplicationOpportunities,
  } = usePortfolioStore();

  // Local state
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Calculator state
  const [calcPeNativeScore, setCalcPeNativeScore] = useState(7);
  const [calcEbitdaImpact, setCalcEbitdaImpact] = useState(50);
  const [calcReplicationCount, setCalcReplicationCount] = useState(10);

  // Filtered companies
  const filteredCompanies = getFilteredCompanies();

  // Scatter chart data
  const scatterData = useMemo(
    () =>
      filteredCompanies.map((c) => {
        const peNative = getPeNativeScore(c);
        return {
          name: c.name,
          replicationPotential: c.replicationPotential,
          peNativeScore: peNative,
          platformClassification: c.platformClassification,
          cohort: c.cohort,
          ebitda: c.ebitda,
          portfolioAdjustedPriority: c.portfolioAdjustedPriority,
          valueScore: c.scores.valueScore,
          readinessScore: c.scores.readinessScore,
          // Logarithmic bubble size
          bubbleSize: Math.max(Math.log(c.portfolioAdjustedPriority + 1) * 80, 60),
        };
      }),
    [filteredCompanies],
  );

  // Platform vs Point analysis
  const platformAnalysis = useMemo(() => {
    const platform = filteredCompanies.filter(
      (c) => c.platformClassification === "Platform",
    );
    const hybrid = filteredCompanies.filter(
      (c) => c.platformClassification === "Hybrid",
    );
    const point = filteredCompanies.filter(
      (c) => c.platformClassification === "Point",
    );

    const platformEbitda = platform.reduce((sum, c) => sum + c.adjustedEbitda, 0);
    const pointEbitda = point.reduce((sum, c) => sum + c.adjustedEbitda, 0);
    const hybridEbitda = hybrid.reduce((sum, c) => sum + c.adjustedEbitda, 0);

    const topPlatform = [...platform]
      .sort((a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority)
      .slice(0, 5);
    const topPoint = [...point]
      .sort((a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority)
      .slice(0, 5);
    const topHybrid = [...hybrid]
      .sort((a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority)
      .slice(0, 5);

    return {
      platform: { count: platform.length, ebitda: platformEbitda, top: topPlatform },
      hybrid: { count: hybrid.length, ebitda: hybridEbitda, top: topHybrid },
      point: { count: point.length, ebitda: pointEbitda, top: topPoint },
    };
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
        case "peNativeScore":
          aVal = getPeNativeScore(a);
          bVal = getPeNativeScore(b);
          break;
        case "replicationPotential":
          aVal = a.replicationPotential;
          bVal = b.replicationPotential;
          break;
        case "replicationCount":
          aVal = a.replicationCount;
          bVal = b.replicationCount;
          break;
        case "platformClassification":
          aVal = a.platformClassification;
          bVal = b.platformClassification;
          break;
        case "portfolioAdjustedPriority":
          aVal = a.portfolioAdjustedPriority;
          bVal = b.portfolioAdjustedPriority;
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
  const calcResult =
    calcPeNativeScore * calcEbitdaImpact * (1 + calcReplicationCount * 0.1);

  // Sort handler
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(
        field === "name" || field === "cohort" || field === "platformClassification"
          ? "asc"
          : "desc",
      );
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Header                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          Portfolio Amplification Model
        </h1>
        <p className="mt-2 text-[var(--color-muted)] text-base max-w-3xl">
          When Apollo built an AI system for software contracts, they analyzed
          15,000 contracts across 40+ companies. That is PE's advantage. Use it.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Core Insight Card                                       */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-l-4 border-l-[var(--color-navy)]">
        <div className="space-y-5">
          <p className="text-base text-[var(--color-foreground)] leading-relaxed italic">
            "The right question isn't 'What's the best AI initiative for Company X?'
            It's 'What's the best AI initiative we can deploy across Companies X, Y,
            Z, and W?'"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--color-subtle)] rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Total Platform Plays
              </p>
              <p className="text-3xl font-bold text-[var(--color-navy)]">
                {getPlatformCount()}
              </p>
            </div>
            <div className="bg-[var(--color-subtle)] rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Total Replication Opportunities
              </p>
              <p className="text-3xl font-bold text-[var(--color-blue)]">
                {getReplicationOpportunities()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Portfolio Priority Bubble Chart                         */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="lg" className="!p-4 sm:!p-6 lg:!p-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Portfolio Priority Landscape
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Bubble size reflects Portfolio-Adjusted Priority (log scale). Color by
            Platform Classification. Lines divide the amplification quadrants.
          </p>
        </div>

        <div className="h-[350px] sm:h-[420px] lg:h-[450px] w-full">
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
                dataKey="replicationPotential"
                name="Replication Potential"
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
              >
                <Label
                  value="Replication Potential"
                  position="bottom"
                  offset={10}
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="peNativeScore"
                name="PE-Native Score"
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
              >
                <Label
                  value="PE-Native Score"
                  angle={-90}
                  position="insideLeft"
                  offset={0}
                  style={{
                    fill: "var(--color-muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    textAnchor: "middle",
                  }}
                />
              </YAxis>
              <ZAxis
                type="number"
                dataKey="bubbleSize"
                range={[60, 600]}
                name="Portfolio-Adjusted Priority"
              />

              {/* Quadrant reference lines */}
              <ReferenceLine
                x={5}
                stroke="var(--color-muted)"
                strokeDasharray="6 4"
                strokeOpacity={0.4}
              />
              <ReferenceLine
                y={6}
                stroke="var(--color-muted)"
                strokeDasharray="6 4"
                strokeOpacity={0.4}
              />

              {/* Quadrant labels */}
              <ReferenceLine x={2.5} y={8} ifOverflow="extendDomain">
                <Label
                  value="Standard Plays"
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
              <ReferenceLine x={7.5} y={8} ifOverflow="extendDomain">
                <Label
                  value="Portfolio Multipliers"
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
              <ReferenceLine x={7.5} y={2} ifOverflow="extendDomain">
                <Label
                  value="Hidden Gems"
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
              <ReferenceLine x={2.5} y={2} ifOverflow="extendDomain">
                <Label
                  value="Limited Leverage"
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
                    fill={PLATFORM_COLORS[entry.platformClassification]}
                    stroke={PLATFORM_COLORS[entry.platformClassification]}
                    strokeOpacity={0.9}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <PlatformLegend />
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Platform vs Point Analysis                              */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
          Platform vs Point Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform Plays Card */}
          <Card className="border-l-4 border-l-[var(--color-navy)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiCpuChip className="w-6 h-6 text-[var(--color-navy)]" />
                <div>
                  <h3 className="text-base font-bold text-[var(--color-foreground)]">
                    Platform Plays
                  </h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    Replication Potential 7+
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                    Companies
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-navy)]">
                    {platformAnalysis.platform.count}
                  </p>
                </div>
                <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                    EBITDA Opportunity
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-navy)]">
                    ${platformAnalysis.platform.ebitda.toFixed(1)}M
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                Creates shared infrastructure. Build centrally, deploy to portfolio.
                Higher upfront investment, portfolio-wide ROI.
              </p>

              {platformAnalysis.platform.top.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Top 5 Platform Companies
                  </p>
                  <div className="space-y-1.5">
                    {platformAnalysis.platform.top.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-[var(--color-foreground)] truncate mr-2">
                          {c.name}
                        </span>
                        <span className="text-[var(--color-muted)] whitespace-nowrap font-mono">
                          {formatCurrency(c.portfolioAdjustedPriority)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Point Solutions Card */}
          <Card className="border-l-4 border-l-[var(--color-muted)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiWrenchScrewdriver className="w-6 h-6 text-[var(--color-muted)]" />
                <div>
                  <h3 className="text-base font-bold text-[var(--color-foreground)]">
                    Point Solutions
                  </h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    Replication Potential &lt; 5
                  </p>
                </div>
              </div>

              <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                  Companies
                </p>
                <p className="text-2xl font-bold text-[var(--color-muted)]">
                  {platformAnalysis.point.count}
                </p>
              </div>

              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                Solves specific problem. Build locally, share learnings. Lower
                investment, single-company ROI.
              </p>

              {platformAnalysis.point.top.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                    Top 5 Point Companies
                  </p>
                  <div className="space-y-1.5">
                    {platformAnalysis.point.top.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-[var(--color-foreground)] truncate mr-2">
                          {c.name}
                        </span>
                        <span className="text-[var(--color-muted)] whitespace-nowrap font-mono">
                          {formatCurrency(c.portfolioAdjustedPriority)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Hybrid Card (full width) */}
        <Card className="border-l-4 border-l-[var(--color-blue)] mt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <HiArrowsPointingOut className="w-6 h-6 text-[var(--color-blue)]" />
              <div>
                <h3 className="text-base font-bold text-[var(--color-foreground)]">
                  Hybrid Solutions
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Replication Potential 5-6
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                  Companies
                </p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">
                  {platformAnalysis.hybrid.count}
                </p>
              </div>
              <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
                  EBITDA Opportunity
                </p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">
                  ${platformAnalysis.hybrid.ebitda.toFixed(1)}M
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Combines platform infrastructure with company-specific customization.
              Moderate replication potential with localized value delivery.
            </p>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5: Amplification Scoring Table                             */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="sm" className="!p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Amplification Scoring
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {filteredCompanies.length} companies. Click any column header to sort.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-[var(--color-subtle)] sticky top-0 z-10">
              <tr>
                <SortHeader field="rank" className="w-16">
                  #
                </SortHeader>
                <SortHeader field="name">Company</SortHeader>
                <SortHeader field="cohort">Cohort</SortHeader>
                <SortHeader field="peNativeScore">PE-Native</SortHeader>
                <SortHeader field="replicationPotential">Repl. Potential</SortHeader>
                <SortHeader field="replicationCount">Repl. Count</SortHeader>
                <SortHeader field="platformClassification">Classification</SortHeader>
                <SortHeader field="portfolioAdjustedPriority">
                  Portfolio Adj. Priority
                </SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sortedCompanies.map((c, i) => {
                const peNative = getPeNativeScore(c);
                const platformConfig = PLATFORM_CONFIG[c.platformClassification];
                return (
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
                    <td className="px-4 py-3">
                      <Badge
                        label={c.cohort}
                        variant={COHORT_BADGE_VARIANTS[c.cohort]}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]">
                      {peNative.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] font-mono">
                      {c.replicationPotential}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] font-mono">
                      {c.replicationCount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={platformConfig.label}
                        variant={platformConfig.variant}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-green)] font-semibold font-mono">
                      {formatCurrency(c.portfolioAdjustedPriority)}
                    </td>
                  </tr>
                );
              })}
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
      {/* Section 6: Portfolio Multiplier Calculator                         */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              Portfolio Multiplier Calculator
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              See how replication across the portfolio amplifies value.
            </p>
          </div>

          {/* Formula display */}
          <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
            <p className="text-[var(--color-muted)] mb-1">Formula:</p>
            <p>
              <span className="text-[var(--color-foreground)] font-semibold">
                Portfolio-Adjusted Priority
              </span>
              <span className="text-[var(--color-muted)]"> = </span>
              <span className="text-[var(--color-foreground)]">
                (PE-Native Score x EBITDA Impact)
              </span>
              <span className="text-[var(--color-muted)]"> x </span>
              <span className="text-[var(--color-foreground)]">
                (1 + (Replication Count x 0.1))
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* PE-Native Score Slider */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                PE-Native Score:{" "}
                <span className="text-[var(--color-navy)]">{calcPeNativeScore}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={calcPeNativeScore}
                onChange={(e) => setCalcPeNativeScore(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--color-navy)]"
                style={{
                  background: `linear-gradient(to right, var(--color-navy) 0%, var(--color-navy) ${((calcPeNativeScore - 1) / 9) * 100}%, var(--color-border) ${((calcPeNativeScore - 1) / 9) * 100}%, var(--color-border) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[var(--color-muted)]">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* EBITDA Impact Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                EBITDA Impact ($M)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={calcEbitdaImpact}
                onChange={(e) =>
                  setCalcEbitdaImpact(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-full h-12 px-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-[var(--color-blue)] transition-all"
              />
            </div>

            {/* Replication Count Slider */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                Replication Count:{" "}
                <span className="text-[var(--color-blue)]">{calcReplicationCount}</span>
              </label>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={calcReplicationCount}
                onChange={(e) => setCalcReplicationCount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--color-blue)]"
                style={{
                  background: `linear-gradient(to right, var(--color-blue) 0%, var(--color-blue) ${(calcReplicationCount / 20) * 100}%, var(--color-border) ${(calcReplicationCount / 20) * 100}%, var(--color-border) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[var(--color-muted)]">
                <span>0</span>
                <span>20</span>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">
                Portfolio-Adjusted Priority
              </label>
              <div className="h-12 flex items-center px-4 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                <span className="text-2xl font-bold text-[var(--color-green)] font-mono">
                  ${calcResult.toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          {/* Formula with live values */}
          <div className="bg-[var(--color-subtle)] rounded-lg p-4 font-mono text-sm text-[var(--color-foreground)]">
            <span className="text-[var(--color-muted)]">Result = </span>
            <span className="text-[var(--color-muted)]">(</span>
            <span className="text-[var(--color-navy)] font-semibold">
              {calcPeNativeScore}
            </span>
            <span className="text-[var(--color-muted)]"> x </span>
            <span className="text-[var(--color-foreground)] font-semibold">
              ${calcEbitdaImpact}M
            </span>
            <span className="text-[var(--color-muted)]">) x (1 + (</span>
            <span className="text-[var(--color-blue)] font-semibold">
              {calcReplicationCount}
            </span>
            <span className="text-[var(--color-muted)]"> x 0.1)) = </span>
            <span className="text-[var(--color-green)] font-bold">
              ${calcResult.toFixed(1)}M
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
