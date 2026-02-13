import { useState, useMemo, useEffect } from "react";
import {
  HiMagnifyingGlass,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiUserGroup,
  HiChartBarSquare,
  HiTableCells,
  HiSquares2X2,
  HiChevronUp,
  HiChevronDown,
  HiXMark,
  HiGlobeAlt,
  HiMapPin,
  HiArrowsUpDown,
  HiAcademicCap,
  HiShieldCheck,
  HiBeaker,
} from "react-icons/hi2";

import {
  Card,
  MetricCard,
  Badge,
  Button,
  FilterPills,
  SearchBar,
} from "../components/shared";
import { useNavigate } from "react-router-dom";
import { useVarStore } from "../stores/vars";
import { useDiscoveryStore } from "../stores/discovery";
import { DiscoveryPanel } from "../components/discovery/DiscoveryPanel";
import type { UnifiedVar } from "@shared/types";

// ============================================================================
// Constants
// ============================================================================

const OWNERSHIP_OPTIONS = [
  { label: "All", value: "" },
  { label: "Public", value: "Public" },
  { label: "Private", value: "Private" },
  { label: "PE-Backed", value: "PE" },
  { label: "VC-Backed", value: "VC" },
];

const REVENUE_OPTIONS = [
  { label: "All", value: "" },
  { label: "$0 - $100M", value: "0-100" },
  { label: "$100M - $1B", value: "100-1000" },
  { label: "$1B - $5B", value: "1000-5000" },
  { label: "$5B+", value: "5000+" },
];

const OWNERSHIP_BADGE: Record<string, "green" | "navy" | "blue" | "gray" | "red"> = {
  Public: "green",
  Private: "navy",
  PE: "blue",
  VC: "red",
};

// ============================================================================
// Revenue Formatter
// ============================================================================

function formatRevenue(millions: number): string {
  if (millions >= 1000) {
    return `$${(millions / 1000).toFixed(1)}B`;
  }
  return `$${millions}M`;
}

function formatEmployees(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

// ============================================================================
// Confidence Indicator
// ============================================================================

function ConfidenceIndicator({ score }: { score: number }) {
  const dots = 5;
  const filled = Math.round(score * dots);
  return (
    <div className="flex items-center gap-0.5" title={`Confidence: ${Math.round(score * 100)}%`}>
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled
              ? "bg-[var(--color-green)]"
              : "bg-[var(--color-border)]"
          }`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// VAR Card
// ============================================================================

function VarCard({
  company,
  onClick,
}: {
  company: UnifiedVar;
  onClick: () => void;
}) {
  return (
    <Card hover onClick={onClick} padding="md">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--color-foreground)] truncate">
              {company.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--color-muted)]">
              <HiMapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{company.hqCity}, {company.hqState}</span>
            </div>
          </div>
          <Badge
            label={company.ownershipType}
            variant={OWNERSHIP_BADGE[company.ownershipType] || "gray"}
            size="sm"
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Revenue</p>
            <p className="text-lg font-bold text-[var(--color-navy)]">
              {formatRevenue(company.annualRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Employees</p>
            <p className="text-lg font-bold text-[var(--color-foreground)]">
              {formatEmployees(company.employeeCount)}
            </p>
          </div>
        </div>

        {/* Specialty Badge */}
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-foreground)]">
            {company.strategicSpecialty}
          </span>
        </div>

        {/* Top Vendors */}
        <div className="flex flex-wrap gap-1">
          {company.topVendors.slice(0, 3).map((vendor) => (
            <span
              key={vendor}
              className="rounded-full bg-[var(--color-blue)]/8 px-2 py-0.5 text-xs text-[var(--color-blue)] font-medium"
            >
              {vendor}
            </span>
          ))}
          {company.topVendors.length > 3 && (
            <span className="rounded-full bg-[var(--color-muted)]/10 px-2 py-0.5 text-xs text-[var(--color-muted)]">
              +{company.topVendors.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-muted)]">
            Est. {company.yearFounded}
          </span>
          <ConfidenceIndicator score={company.confidenceScore} />
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// VAR Detail Panel (Modal/Sidebar)
// ============================================================================

function VarDetailPanel({
  company,
  onClose,
}: {
  company: UnifiedVar;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg h-full bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                {company.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  label={company.ownershipType}
                  variant={OWNERSHIP_BADGE[company.ownershipType] || "gray"}
                />
                <span className="text-sm text-[var(--color-muted)]">
                  {company.hqCity}, {company.hqState}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-subtle)] transition-all"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-subtle)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Annual Revenue</p>
              <p className="text-2xl font-bold text-[var(--color-navy)]">
                {formatRevenue(company.annualRevenue)}
              </p>
            </div>
            <div className="bg-[var(--color-subtle)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Employees</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">
                {company.employeeCount.toLocaleString()}
              </p>
            </div>
            {company.profit !== null && (
              <div className="bg-[var(--color-subtle)] rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Profit</p>
                <p className="text-2xl font-bold text-[var(--color-green)]">
                  {formatRevenue(company.profit)}
                </p>
              </div>
            )}
            <div className="bg-[var(--color-subtle)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Founded</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">
                {company.yearFounded}
              </p>
            </div>
          </div>

          {/* Website */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Website
            </h3>
            <a
              href={`https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-blue)] hover:underline"
            >
              <HiGlobeAlt className="w-4 h-4" />
              {company.website}
            </a>
          </div>

          {/* Strategic Focus */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Strategic Focus
            </h3>
            <span className="inline-flex items-center rounded-full bg-[var(--color-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-foreground)] mb-2">
              {company.strategicSpecialty}
            </span>
            <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
              {company.strategicFocus}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Top Vendors */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Key Vendor Partnerships
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.topVendors.map((vendor) => (
                <Badge key={vendor} label={vendor} variant="blue" size="sm" />
              ))}
            </div>
          </div>

          {/* Top Customers */}
          {company.topCustomers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Key Customer Segments
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.topCustomers.map((customer) => (
                  <Badge key={customer} label={customer} variant="navy" size="sm" />
                ))}
              </div>
            </div>
          )}

          {/* Confidence */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Data Confidence
            </h3>
            <div className="flex items-center gap-3">
              <ConfidenceIndicator score={company.confidenceScore} />
              <span className="text-sm text-[var(--color-muted)]">
                {Math.round(company.confidenceScore * 100)}% confidence
              </span>
            </div>
          </div>

          {/* Research Placeholder */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <Button
              variant="primary"
              size="lg"
              icon={<HiBeaker className="w-5 h-5" />}
              className="w-full"
              onClick={() => {
                // Placeholder for AI research agent
              }}
            >
              Research with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table View
// ============================================================================

function VarTable({
  vars,
  onSelect,
  sortField,
  sortDirection,
  onSort,
}: {
  vars: UnifiedVar[];
  onSelect: (v: UnifiedVar) => void;
  sortField: keyof UnifiedVar;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof UnifiedVar) => void;
}) {
  const SortIcon = ({ field }: { field: keyof UnifiedVar }) => {
    if (sortField !== field) {
      return <HiArrowsUpDown className="w-3.5 h-3.5 text-[var(--color-muted)]" />;
    }
    return sortDirection === "asc" ? (
      <HiChevronUp className="w-3.5 h-3.5 text-[var(--color-blue)]" />
    ) : (
      <HiChevronDown className="w-3.5 h-3.5 text-[var(--color-blue)]" />
    );
  };

  const headerClass =
    "px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--color-foreground)] transition-colors select-none";

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[var(--color-subtle)]">
            <th className={headerClass} onClick={() => onSort("name")}>
              <span className="flex items-center gap-1">
                Name <SortIcon field="name" />
              </span>
            </th>
            <th className={headerClass} onClick={() => onSort("hqState")}>
              <span className="flex items-center gap-1">
                HQ <SortIcon field="hqState" />
              </span>
            </th>
            <th className={headerClass} onClick={() => onSort("annualRevenue")}>
              <span className="flex items-center gap-1">
                Revenue ($M) <SortIcon field="annualRevenue" />
              </span>
            </th>
            <th className={headerClass} onClick={() => onSort("employeeCount")}>
              <span className="flex items-center gap-1">
                Employees <SortIcon field="employeeCount" />
              </span>
            </th>
            <th className={headerClass} onClick={() => onSort("ownershipType")}>
              <span className="flex items-center gap-1">
                Ownership <SortIcon field="ownershipType" />
              </span>
            </th>
            <th className={headerClass}>
              Specialty
            </th>
            <th className={headerClass}>
              Top Vendors
            </th>
            <th className={headerClass} onClick={() => onSort("yearFounded")}>
              <span className="flex items-center gap-1">
                Founded <SortIcon field="yearFounded" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {vars.map((v) => (
            <tr
              key={v.id}
              className="bg-[var(--color-card)] hover:bg-[var(--color-subtle)] cursor-pointer transition-colors"
              onClick={() => onSelect(v)}
            >
              <td className="px-4 py-3">
                <span className="font-semibold text-[var(--color-foreground)]">
                  {v.name}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                {v.hqCity}, {v.hqState}
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-[var(--color-navy)]">
                  {formatRevenue(v.annualRevenue)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                {v.employeeCount.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Badge
                  label={v.ownershipType}
                  variant={OWNERSHIP_BADGE[v.ownershipType] || "gray"}
                  size="sm"
                />
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-[var(--color-foreground)]">
                  {v.strategicSpecialty}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {v.topVendors.slice(0, 3).map((vendor) => (
                    <span
                      key={vendor}
                      className="rounded-full bg-[var(--color-blue)]/8 px-1.5 py-0.5 text-[10px] text-[var(--color-blue)] font-medium"
                    >
                      {vendor}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                {v.yearFounded}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Main VarDirectory Page
// ============================================================================

export default function VarDirectory() {
  const {
    filters,
    setFilter,
    clearFilters,
    getFilteredVars,
    getStats,
    selectedVar,
    setSelectedVar,
    viewMode,
    setViewMode,
    sortField,
    sortDirection,
    setSortField,
  } = useVarStore();
  const fetchVars = useVarStore((s) => s.fetchVars);
  const loading = useVarStore((s) => s.loading);

  const openDiscovery = useDiscoveryStore((s) => s.openDiscovery);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVars();
  }, [fetchVars]);

  const filteredVars = getFilteredVars();
  const stats = getStats();

  const hasActiveFilters =
    filters.searchQuery ||
    filters.ownershipType ||
    filters.revenueRange ||
    filters.stateFilter ||
    filters.specialtyFilter;

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Section 1: Header */}
      {/* ================================================================ */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
            VAR Directory
          </h1>
          <p className="text-[var(--color-muted)] text-lg max-w-2xl mx-auto">
            Every Value Added Reseller in America. The data, organized.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <button
              onClick={openDiscovery}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-medium
                hover:bg-navy/90 transition-all"
            >
              <HiBeaker className="w-4 h-4" />
              Discover New VARs
            </button>
            <a
              href="/api/export/vars"
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)]
                text-[var(--color-muted)] text-sm font-medium hover:text-[var(--color-foreground)]
                hover:bg-[var(--color-subtle)] transition-all"
            >
              <HiArrowsUpDown className="w-4 h-4" />
              Export CSV
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar
            value={filters.searchQuery}
            onChange={(v) => setFilter("searchQuery", v)}
            placeholder="Search VARs by name, location, vendor, specialty..."
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <FilterPills
            options={OWNERSHIP_OPTIONS}
            selected={filters.ownershipType}
            onChange={(v) => setFilter("ownershipType", v === filters.ownershipType ? "" : v)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <FilterPills
            options={REVENUE_OPTIONS}
            selected={filters.revenueRange}
            onChange={(v) => setFilter("revenueRange", v === filters.revenueRange ? "" : v)}
          />
        </div>

        {/* Clear Filters + View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <HiXMark className="w-4 h-4" />
                Clear filters
              </button>
            )}
            <span className="text-sm text-[var(--color-muted)]">
              {filteredVars.length} VAR{filteredVars.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[var(--color-subtle)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
              title="Grid view"
            >
              <HiSquares2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
              title="Table view"
            >
              <HiTableCells className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Section 2: Summary Stats */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total VARs"
          value={stats.totalVars}
          icon={<HiBuildingOffice2 className="w-8 h-8" />}
          color="navy"
        />
        <MetricCard
          label="Total Revenue"
          value={formatRevenue(stats.totalRevenue)}
          icon={<HiCurrencyDollar className="w-8 h-8" />}
          color="blue"
        />
        <MetricCard
          label="Avg Revenue"
          value={formatRevenue(stats.avgRevenue)}
          icon={<HiChartBarSquare className="w-8 h-8" />}
          color="green"
        />
        <MetricCard
          label="Total Employees"
          value={formatEmployees(stats.totalEmployees)}
          icon={<HiUserGroup className="w-8 h-8" />}
          color="navy"
        />
      </div>

      {/* ================================================================ */}
      {/* Section 3 / 4: Card Grid or Table View */}
      {/* ================================================================ */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVars.map((v) => (
            <VarCard
              key={v.id}
              company={v}
              onClick={() => navigate(`/vars/${v.id}`)}
            />
          ))}
          {filteredVars.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <HiMagnifyingGlass className="w-12 h-12 text-[var(--color-muted)] mb-4" />
              <p className="text-lg font-medium text-[var(--color-foreground)] mb-1">
                No VARs found
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      ) : (
        <VarTable
          vars={filteredVars}
          onSelect={setSelectedVar}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={setSortField}
        />
      )}

      {/* ================================================================ */}
      {/* Section 5: Detail Panel */}
      {/* ================================================================ */}
      {selectedVar && (
        <VarDetailPanel
          company={selectedVar}
          onClose={() => setSelectedVar(null)}
        />
      )}

      <DiscoveryPanel />
    </div>
  );
}
