import { useState, useMemo } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { usePortfolioStore } from "../../stores/portfolio";
import { Card, Badge, Tooltip } from "../../components/shared";
import { formatCurrency, formatNumber } from "../../lib/calculations";
import type { Company, Track } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const TRACK_CONFIG: Record<
  Track,
  {
    label: string;
    fullLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    variant: "green" | "blue" | "navy";
    timeline: string;
    investment: string;
  }
> = {
  T1: {
    label: "T1",
    fullLabel: "EBITDA Accelerators",
    color: "#36bf78",
    bgColor: "bg-[#36bf78]",
    borderColor: "border-l-[#36bf78]",
    variant: "green",
    timeline: "0-12 months",
    investment: "40-50%",
  },
  T2: {
    label: "T2",
    fullLabel: "Growth Enablers",
    color: "#02a2fd",
    bgColor: "bg-[#02a2fd]",
    borderColor: "border-l-[#02a2fd]",
    variant: "blue",
    timeline: "6-24 months",
    investment: "30-40%",
  },
  T3: {
    label: "T3",
    fullLabel: "Exit Multiplier Plays",
    color: "#001278",
    bgColor: "bg-[#001278]",
    borderColor: "border-l-[#001278]",
    variant: "navy",
    timeline: "12-36 months",
    investment: "15-25%",
  },
};

const TRACK_DETAILS: Record<
  Track,
  {
    target: string;
    useCases: string[];
    successMetric: string;
    exitRelevance: string;
  }
> = {
  T1: {
    target: "Measurable EBITDA contribution within 6 months",
    useCases: [
      "Customer support automation",
      "Procurement optimization",
      "Back-office automation",
    ],
    successMetric: "Annualized run-rate savings",
    exitRelevance: "Proven, recurring EBITDA improvement",
  },
  T2: {
    target: "Revenue or margin trajectory inflection",
    useCases: [
      "Sales forecasting",
      "Pricing optimization",
      "Churn prediction",
    ],
    successMetric: "YoY improvement in KPIs",
    exitRelevance: '"AI-enhanced growth story"',
  },
  T3: {
    target: "AI capabilities for premium valuation",
    useCases: [
      "AI-enhanced products",
      "Proprietary data assets",
    ],
    successMetric: "Competitive differentiation",
    exitRelevance: '"AI company" narrative (2-4x multiple premium)',
  },
};

const PHASE_GATES = [
  {
    year: "Year 1",
    title: "Foundation",
    description: "100% T1 launched, 25% showing impact",
  },
  {
    year: "Year 2",
    title: "Acceleration",
    description: "T1 at run-rate, T2 showing trajectory change",
  },
  {
    year: "Year 3",
    title: "Proof",
    description:
      "T1 in quality of earnings, T2 in management presentation, T3 visible",
  },
  {
    year: "Year 4+",
    title: "Exit Prep",
    description: "AI narrative documented, buyer diligence-ready",
  },
];

type SortField =
  | "rank"
  | "name"
  | "cohort"
  | "peNativeScore"
  | "portfolioAdjustedPriority"
  | "track"
  | "implementationYear"
  | "implementationQuarter";

type SortDirection = "asc" | "desc";

// ============================================================================
// HoldPeriod Page Component
// ============================================================================

export default function HoldPeriod() {
  const { companies, stats, getCompaniesByTrack } = usePortfolioStore();

  // Local state
  const [expandedTracks, setExpandedTracks] = useState<Record<Track, boolean>>({
    T1: false,
    T2: false,
    T3: false,
  });
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Track data
  const t1Companies = getCompaniesByTrack("T1");
  const t2Companies = getCompaniesByTrack("T2");
  const t3Companies = getCompaniesByTrack("T3");

  const trackSummaries = useMemo(() => {
    const tracks: Track[] = ["T1", "T2", "T3"];
    return tracks.map((track) => {
      const trackCompanies =
        track === "T1"
          ? t1Companies
          : track === "T2"
            ? t2Companies
            : t3Companies;
      const totalOpportunity = trackCompanies.reduce(
        (sum, c) => sum + c.portfolioAdjustedPriority,
        0,
      );
      return {
        track,
        count: trackCompanies.length,
        totalOpportunity,
        companies: trackCompanies,
      };
    });
  }, [t1Companies, t2Companies, t3Companies]);

  // Max EBITDA for scaling blocks
  const maxEbitda = useMemo(
    () => Math.max(...companies.map((c) => c.ebitda)),
    [companies],
  );

  // Sorted table data
  const sortedCompanies = useMemo(() => {
    const sorted = [...companies].sort((a, b) => {
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
          aVal = a.peNativeScore;
          bVal = b.peNativeScore;
          break;
        case "portfolioAdjustedPriority":
          aVal = a.portfolioAdjustedPriority;
          bVal = b.portfolioAdjustedPriority;
          break;
        case "track":
          aVal = a.track;
          bVal = b.track;
          break;
        case "implementationYear":
          aVal = a.implementationYear;
          bVal = b.implementationYear;
          break;
        case "implementationQuarter":
          aVal = a.implementationQuarter;
          bVal = b.implementationQuarter;
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
  }, [companies, sortField, sortDirection]);

  // Toggle track expansion
  function toggleTrack(track: Track) {
    setExpandedTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  }

  // Sort handler
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(
        field === "name" || field === "cohort" ? "asc" : "desc",
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

  function getTrackBadge(track: Track) {
    const config = TRACK_CONFIG[track];
    return <Badge label={`${config.label}: ${config.fullLabel}`} variant={config.variant} size="sm" />;
  }

  // Build tooltip content for a company block
  function companyTooltipContent(c: Company): string {
    return `${c.name} | ${c.cohort} | EBITDA: $${c.ebitda.toFixed(1)}M | Value: ${c.scores.valueScore.toFixed(1)} | Readiness: ${c.scores.readinessScore.toFixed(1)} | ${c.implementationYear} ${c.implementationQuarter}`;
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
          Hold Period Value Capture
        </h1>
        <p className="mt-2 text-[var(--color-muted)] text-base max-w-3xl">
          PE hold periods run 3-5 years. AI transformation takes 2-4 years. The
          overlap is thin. Sequence carefully.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: The Critical Tension Visual                             */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="lg">
        <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-6">
          The Critical Tension
        </h2>

        <div className="space-y-6">
          {/* Timeline header */}
          <div className="flex items-end text-xs text-[var(--color-muted)] font-mono">
            {[0, 1, 2, 3, 4, 5].map((year) => (
              <div key={year} className="flex-1 text-center">
                Year {year}
              </div>
            ))}
          </div>

          {/* PE Hold Period bar */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              PE Hold Period
            </p>
            <div className="relative h-10 bg-[var(--color-subtle)] rounded-lg overflow-hidden">
              {/* Full bar background */}
              <div className="absolute inset-0" />
              {/* PE hold: years 0-5 but typically 3-5 active */}
              <div
                className="absolute top-0 bottom-0 rounded-lg bg-[#001278] flex items-center justify-center"
                style={{ left: "0%", width: "100%" }}
              >
                <span className="text-white text-sm font-semibold">
                  3-5 Years
                </span>
              </div>
            </div>
          </div>

          {/* AI Transformation bar */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              AI Transformation
            </p>
            <div className="relative h-10 bg-[var(--color-subtle)] rounded-lg overflow-hidden">
              <div
                className="absolute top-0 bottom-0 rounded-lg bg-[#02a2fd] flex items-center justify-center"
                style={{ left: "0%", width: "80%" }}
              >
                <span className="text-white text-sm font-semibold">
                  2-4 Years
                </span>
              </div>
            </div>
          </div>

          {/* Overlap zone */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              Value Capture Window
            </p>
            <div className="relative h-10 bg-[var(--color-subtle)] rounded-lg overflow-hidden">
              <div
                className="absolute top-0 bottom-0 rounded-lg bg-[#36bf78] flex items-center justify-center"
                style={{ left: "20%", width: "40%" }}
              >
                <span className="text-white text-sm font-semibold">
                  Overlap Zone
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key message */}
        <div className="mt-6 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-sm font-semibold text-[var(--color-foreground)] leading-relaxed">
            No more than 25% of AI investment should go to initiatives without
            12-month value visibility.
          </p>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Three Track Swim Lane Timeline (PRIMARY VISUAL)         */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Track Swim Lane Timeline
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Companies mapped to implementation tracks. Block width reflects
            EBITDA scale.
          </p>
        </div>

        <div className="space-y-8">
          {(["T1", "T2", "T3"] as Track[]).map((track) => {
            const config = TRACK_CONFIG[track];
            const trackCompanies =
              track === "T1"
                ? t1Companies
                : track === "T2"
                  ? t2Companies
                  : t3Companies;
            // Sort by EBITDA descending within each track
            const sorted = [...trackCompanies].sort(
              (a, b) => b.ebitda - a.ebitda,
            );

            return (
              <div key={track}>
                {/* Track header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                        {config.label}: {config.fullLabel}
                      </h3>
                      <span className="text-xs text-[var(--color-muted)]">
                        ({config.timeline}, {config.investment} investment)
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-muted)]">
                    {trackCompanies.length} companies
                  </span>
                </div>

                {/* Swim lane */}
                <div className="flex flex-wrap gap-2">
                  {sorted.map((c) => {
                    // Block width proportional to EBITDA, min-width for small companies
                    const widthPercent = Math.max(
                      (c.ebitda / maxEbitda) * 100,
                      8,
                    );
                    return (
                      <Tooltip
                        key={c.name}
                        content={companyTooltipContent(c)}
                        position="top"
                      >
                        <div
                          className="rounded-lg px-3 py-2 text-white text-xs font-medium cursor-default transition-all duration-200 hover:opacity-90 hover:shadow-md flex-shrink-0"
                          style={{
                            backgroundColor: config.color,
                            minWidth: `${Math.max(widthPercent * 1.8, 100)}px`,
                            maxWidth: `${Math.max(widthPercent * 3, 160)}px`,
                          }}
                        >
                          <p className="font-semibold truncate">{c.name}</p>
                          <p className="opacity-80 mt-0.5">
                            ${c.ebitda.toFixed(0)}M
                          </p>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Track Definition Cards                                  */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
          Track Definitions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {(["T1", "T2", "T3"] as Track[]).map((track) => {
            const config = TRACK_CONFIG[track];
            const details = TRACK_DETAILS[track];
            const summary = trackSummaries.find((s) => s.track === track)!;
            const isExpanded = expandedTracks[track];

            return (
              <Card
                key={track}
                className={`border-l-4 ${config.borderColor}`}
              >
                <button
                  onClick={() => toggleTrack(track)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      label={config.label}
                      variant={config.variant}
                      size="md"
                    />
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-foreground)]">
                        {config.fullLabel}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        {config.timeline} | {config.investment} investment |{" "}
                        {summary.count} companies | $
                        {(summary.totalOpportunity / 1000).toFixed(1)}K total
                        opportunity
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <HiChevronUp className="w-5 h-5 text-[var(--color-muted)] flex-shrink-0" />
                  ) : (
                    <HiChevronDown className="w-5 h-5 text-[var(--color-muted)] flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                          Target
                        </p>
                        <p className="text-sm text-[var(--color-foreground)]">
                          {details.target}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                          Typical Use Cases
                        </p>
                        <ul className="text-sm text-[var(--color-foreground)] space-y-1">
                          {details.useCases.map((uc) => (
                            <li key={uc} className="flex items-center gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: config.color }}
                              />
                              {uc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                          Success Metric
                        </p>
                        <p className="text-sm text-[var(--color-foreground)]">
                          {details.successMetric}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                          Exit Relevance
                        </p>
                        <p className="text-sm text-[var(--color-foreground)] font-medium">
                          {details.exitRelevance}
                        </p>
                      </div>

                      <div className="bg-[var(--color-subtle)] rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-muted)]">
                            Companies
                          </span>
                          <span className="font-semibold text-[var(--color-foreground)]">
                            {summary.count}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-[var(--color-muted)]">
                            Total Opportunity
                          </span>
                          <span className="font-semibold text-[var(--color-foreground)]">
                            ${(summary.totalOpportunity / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5: Phase-Gate Model Timeline                               */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Phase-Gate Model
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Clear milestones. Each gate must be passed before the next phase
            begins.
          </p>
        </div>

        {/* Horizontal timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-[var(--color-border)]" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PHASE_GATES.map((phase, index) => {
              const colors = [
                "bg-[#36bf78] border-[#36bf78]",
                "bg-[#02a2fd] border-[#02a2fd]",
                "bg-[#001278] border-[#001278]",
                "bg-[var(--color-muted)] border-[var(--color-muted)]",
              ];

              return (
                <div key={phase.year} className="flex flex-col items-center">
                  {/* Circle node */}
                  <div
                    className={`w-10 h-10 rounded-full ${colors[index]} border-2 flex items-center justify-center text-white text-sm font-bold z-10 relative`}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-[var(--color-foreground)]">
                      {phase.year}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mt-0.5">
                      {phase.title}
                    </p>
                    <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 6: Track Assignment Table                                  */}
      {/* ------------------------------------------------------------------ */}
      <Card padding="sm" className="!p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Track Assignments
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {companies.length} companies. Click any column header to sort.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-[var(--color-subtle)] sticky top-0 z-10">
              <tr>
                <SortHeader field="rank" className="w-16">
                  Rank
                </SortHeader>
                <SortHeader field="name">Company</SortHeader>
                <SortHeader field="cohort">Cohort</SortHeader>
                <SortHeader field="peNativeScore">PE-Native Score</SortHeader>
                <SortHeader field="portfolioAdjustedPriority">
                  Portfolio-Adj Priority ($M)
                </SortHeader>
                <SortHeader field="track">Track</SortHeader>
                <SortHeader field="implementationYear">Year</SortHeader>
                <SortHeader field="implementationQuarter">Quarter</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sortedCompanies.map((c, i) => {
                const trackConfig = TRACK_CONFIG[c.track];

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
                        variant={
                          c.cohort === "Industrial"
                            ? "navy"
                            : c.cohort === "Services"
                              ? "blue"
                              : c.cohort === "Consumer"
                                ? "green"
                                : c.cohort === "Healthcare"
                                  ? "red"
                                  : "gray"
                        }
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] font-mono">
                      {c.peNativeScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] font-mono">
                      {(c.portfolioAdjustedPriority / 1000).toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={`${trackConfig.label}: ${trackConfig.fullLabel}`}
                        variant={trackConfig.variant}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                      {c.implementationYear}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                      {c.implementationQuarter}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {companies.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[var(--color-muted)]">No companies available.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
