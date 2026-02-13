import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiUserGroup,
  HiGlobeAlt,
  HiShieldCheck,
  HiSparkles,
  HiCalendar,
  HiMapPin,
  HiChartBar,
} from "react-icons/hi2";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, Badge, Button, MetricCard } from "../components/shared";
import type { UnifiedVar } from "@shared/types";

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

const PIE_COLORS = ["#001278", "#02a2fd", "#36bf78", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"];

function formatRevenue(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m}M`;
}

export default function VarDossier() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [varData, setVarData] = useState<UnifiedVar | null>(null);
  const [scores, setScores] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/vars/${id}`).then((r) => r.json()),
      fetch(`/api/ma/rankings/${id}/explanation`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([v, exp]) => {
      setVarData(v);
      setScores(exp);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const triggerResearch = async () => {
    if (!id) return;
    setResearchLoading(true);
    try {
      const res = await fetch(`/api/vars/${id}/research`, { method: "POST" });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis("Research request failed.");
    }
    setResearchLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!varData) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-muted)]">VAR not found.</p>
        <Button variant="ghost" onClick={() => navigate("/vars")} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  const v = varData;
  const servicesMix = v.servicesMix
    ? Object.entries(v.servicesMix).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]
          hover:text-[var(--color-foreground)] transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ================================================================ */}
      {/* Header */}
      {/* ================================================================ */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{v.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-[var(--color-muted)] flex items-center gap-1">
              <HiMapPin className="w-4 h-4" />
              {v.hqCity}, {v.hqState}
            </span>
            <Badge
              label={v.ownershipType}
              variant={v.ownershipType === "PE-Backed" ? "blue" : v.ownershipType === "Public" ? "green" : "navy"}
              size="sm"
            />
            {v.yearFounded && (
              <span className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                <HiCalendar className="w-3 h-3" /> Est. {v.yearFounded}
              </span>
            )}
            {v.confidenceScore != null && (
              <span className="text-xs text-[var(--color-muted)]">
                Data confidence: {Math.round(v.confidenceScore * 100)}%
              </span>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={triggerResearch}
          disabled={researchLoading}
          icon={<HiSparkles className="w-4 h-4" />}
        >
          {researchLoading ? "Researching..." : "AI Research"}
        </Button>
      </section>

      {/* Description */}
      {v.description && (
        <p className="text-[var(--color-muted)] text-base leading-relaxed max-w-3xl">{v.description}</p>
      )}

      {/* ================================================================ */}
      {/* Key Metrics */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Annual Revenue"
          value={formatRevenue(v.annualRevenue)}
          icon={<HiCurrencyDollar className="w-7 h-7" />}
          color="navy"
        />
        <MetricCard
          label="Employees"
          value={v.employeeCount.toLocaleString()}
          icon={<HiUserGroup className="w-7 h-7" />}
          color="blue"
        />
        <MetricCard
          label="Growth Rate"
          value={v.growthRate != null ? `${v.growthRate}%` : "N/A"}
          subtitle="Year-over-year"
          icon={<HiChartBar className="w-7 h-7" />}
          color="green"
        />
        <MetricCard
          label="EBITDA Margin"
          value={v.ebitdaMargin != null ? `${v.ebitdaMargin}%` : "N/A"}
          icon={<HiCurrencyDollar className="w-7 h-7" />}
          color="green"
        />
      </section>

      {/* ================================================================ */}
      {/* Strategic Profile + Radar */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Profile */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
            Strategic Profile
          </h3>
          <div className="space-y-4">
            {/* Specialties */}
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1.5">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {(v.specialties ?? []).map((s) => (
                  <Badge key={s} label={s} variant="navy" size="sm" />
                ))}
                {(v.specialties ?? []).length === 0 && (
                  <span className="text-xs text-[var(--color-muted)]">Not available</span>
                )}
              </div>
            </div>

            {/* Vendors */}
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1.5">Vendor Partnerships</p>
              <div className="flex flex-wrap gap-1.5">
                {v.topVendors.map((vendor) => (
                  <Badge key={vendor} label={vendor} variant="blue" size="sm" />
                ))}
              </div>
            </div>

            {/* Customer Segment */}
            {v.customerSegment && (
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1.5">Customer Segment</p>
                <Badge label={v.customerSegment} variant="green" size="sm" />
              </div>
            )}

            {/* Certifications */}
            {v.certifications && v.certifications.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1.5">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {v.certifications.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-subtle)] text-[var(--color-muted)] border border-[var(--color-border)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {v.website && (
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Website</p>
                <a
                  href={v.website.startsWith("http") ? v.website : `https://${v.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-blue)] hover:underline"
                >
                  {v.website}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* M&A Score Radar */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
            M&A Fit Profile
          </h3>
          {scores?.breakdown ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={RADAR_DIMENSIONS.map((dim) => {
                      const bd = scores.breakdown.find((b: any) => b.dimension === dim.label);
                      return { dimension: dim.label, score: bd?.score ?? 0 };
                    })}
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                  >
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "var(--color-muted)" }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--color-muted)" }} axisLine={false} />
                    <Radar dataKey="score" stroke="#001278" fill="#001278" fillOpacity={0.15} strokeWidth={2} />
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
              </div>
              <p className="text-center text-sm font-medium text-[var(--color-muted)] mt-2">
                {scores.summary}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center h-56 text-sm text-[var(--color-muted)]">
              Score data not available for this VAR
            </div>
          )}
        </Card>
      </section>

      {/* ================================================================ */}
      {/* Services Mix (Pie) + Geographic */}
      {/* ================================================================ */}
      {(servicesMix.length > 0 || (v.branchLocations && v.branchLocations.length > 0)) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {servicesMix.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
                Service Mix
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicesMix}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {servicesMix.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {v.branchLocations && v.branchLocations.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
                Locations
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <HiBuildingOffice2 className="w-4 h-4 text-navy" />
                  <span className="font-medium text-[var(--color-foreground)]">HQ: {v.hqCity}, {v.hqState}</span>
                </div>
                {v.branchLocations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <HiMapPin className="w-4 h-4" />
                    {loc.city}, {loc.state}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/* Score Breakdown */}
      {/* ================================================================ */}
      {scores?.breakdown && (
        <section>
          <Card>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
              Score Breakdown
            </h3>
            <div className="space-y-3">
              {scores.breakdown.map((b: any) => (
                <div key={b.dimension} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-foreground)]">{b.dimension}</span>
                    <span
                      className={`text-sm font-bold ${
                        b.score >= 8 ? "text-[var(--color-green)]" : b.score >= 5 ? "text-[var(--color-blue)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      {b.score}/10
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-subtle)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.score >= 8 ? "bg-[var(--color-green)]" : b.score >= 5 ? "bg-[var(--color-blue)]" : "bg-[var(--color-muted)]"
                      }`}
                      style={{ width: `${b.score * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">{b.reasoning}</p>
                </div>
              ))}
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {scores.strengths?.length > 0 && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {scores.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-green-800 dark:text-green-300">+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {scores.concerns?.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase mb-2">Concerns</h4>
                  <ul className="space-y-1">
                    {scores.concerns.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-red-800 dark:text-red-300">! {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* ================================================================ */}
      {/* AI Research Results */}
      {/* ================================================================ */}
      {analysis && (
        <section>
          <Card>
            <h3 className="text-sm font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <HiSparkles className="w-4 h-4" />
              AI Analysis
            </h3>
            <div className="text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
