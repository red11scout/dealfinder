import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  jsonb,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core'
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'

// ============================================================================
// Portfolio Companies Table
// ============================================================================

export const portfolioCompanies = pgTable('portfolio_companies', {
  id: serial('id').primaryKey(),
  rank: integer('rank'),
  name: varchar('name', { length: 255 }).notNull().unique(),
  cohort: varchar('cohort', { length: 50 }),
  investmentGroup: varchar('investment_group', { length: 50 }),
  revenue: real('revenue'),
  ebitda: real('ebitda'),
  scores: jsonb('scores').$type<{
    ebitda_impact: number
    rev_enable: number
    risk_reduce: number
    org_cap: number
    data_ready: number
    tech_infra: number
    timeline_fit: number
  }>(),
  valueScore: real('value_score'),
  readinessScore: real('readiness_score'),
  priorityScore: real('priority_score'),
  quadrant: varchar('quadrant', { length: 20 }),
  track: varchar('track', { length: 5 }),
  trackDescription: varchar('track_description', { length: 100 }),
  implementationYear: varchar('implementation_year', { length: 20 }),
  implementationQuarter: varchar('implementation_quarter', { length: 10 }),
  valueTheme: varchar('value_theme', { length: 50 }),
  platformClassification: varchar('platform_classification', { length: 20 }),
  replicationPotential: integer('replication_potential'),
  replicationCount: integer('replication_count'),
  adjustedEbitda: real('adjusted_ebitda'),
  adjustedPriority: real('adjusted_priority'),
  portfolioAdjustedPriority: real('portfolio_adjusted_priority'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type PortfolioCompany = InferSelectModel<typeof portfolioCompanies>
export type InsertPortfolioCompany = InferInsertModel<typeof portfolioCompanies>

// ============================================================================
// VARs (Value-Added Resellers) Table — Unified Schema
// ============================================================================

export const vars = pgTable('vars', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  website: varchar('website', { length: 500 }),
  hqCity: varchar('hq_city', { length: 100 }),
  hqState: varchar('hq_state', { length: 50 }),
  annualRevenue: real('annual_revenue'),
  profit: real('profit'),
  employeeCount: integer('employee_count'),
  ownershipType: varchar('ownership_type', { length: 20 }),
  strategicSpecialty: text('strategic_specialty'),
  strategicFocus: text('strategic_focus'),
  topVendors: jsonb('top_vendors').$type<string[]>(),
  topCustomers: jsonb('top_customers').$type<string[]>(),
  yearFounded: integer('year_founded'),
  description: text('description'),
  dataSources: jsonb('data_sources').$type<string[]>(),
  confidenceScore: real('confidence_score'),
  // M&A-specific fields (merged from M&A store)
  growthRate: real('growth_rate'),
  ebitdaMargin: real('ebitda_margin'),
  customerSegment: varchar('customer_segment', { length: 50 }),
  specialties: jsonb('specialties').$type<string[]>(),
  // Enhanced data fields
  branchLocations: jsonb('branch_locations').$type<{ city: string; state: string }[]>(),
  certifications: jsonb('certifications').$type<string[]>(),
  servicesMix: jsonb('services_mix').$type<Record<string, number>>(),
  glassdoorRating: real('glassdoor_rating'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  discoveredBy: varchar('discovered_by', { length: 20 }).default('seed'),
  lastResearchedAt: timestamp('last_researched_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Var = InferSelectModel<typeof vars>
export type InsertVar = InferInsertModel<typeof vars>

// ============================================================================
// VAR M&A Scores Table
// ============================================================================

export const varMaScores = pgTable('var_ma_scores', {
  id: serial('id').primaryKey(),
  varId: integer('var_id').references(() => vars.id),
  revenueFit: real('revenue_fit'),
  geographicFit: real('geographic_fit'),
  specialtyFit: real('specialty_fit'),
  cultureFit: real('culture_fit'),
  customerOverlap: real('customer_overlap'),
  vendorSynergy: real('vendor_synergy'),
  growthTrajectory: real('growth_trajectory'),
  marginProfile: real('margin_profile'),
  compositeScore: real('composite_score'),
  rank: integer('rank'),
  aiReasoning: text('ai_reasoning'),
  scoringModelVersion: varchar('scoring_model_version', { length: 20 }),
  cultureIndex: real('culture_index'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type VarMaScore = InferSelectModel<typeof varMaScores>
export type InsertVarMaScore = InferInsertModel<typeof varMaScores>

// ============================================================================
// VAR Financial History (multi-year)
// ============================================================================

export const varFinancials = pgTable('var_financials', {
  id: serial('id').primaryKey(),
  varId: integer('var_id').references(() => vars.id),
  year: integer('year').notNull(),
  revenue: real('revenue'),
  ebitda: real('ebitda'),
  employeeCount: integer('employee_count'),
  growthRate: real('growth_rate'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type VarFinancial = InferSelectModel<typeof varFinancials>
export type InsertVarFinancial = InferInsertModel<typeof varFinancials>

// ============================================================================
// VAR News/Events Tracking
// ============================================================================

export const varNews = pgTable('var_news', {
  id: serial('id').primaryKey(),
  varId: integer('var_id').references(() => vars.id),
  headline: text('headline').notNull(),
  source: varchar('source', { length: 255 }),
  url: varchar('url', { length: 500 }),
  publishedAt: timestamp('published_at'),
  sentiment: varchar('sentiment', { length: 20 }),
  isHighlight: boolean('is_highlight').default(false),
  isRedFlag: boolean('is_red_flag').default(false),
  aiSummary: text('ai_summary'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type VarNewsEntry = InferSelectModel<typeof varNews>
export type InsertVarNewsEntry = InferInsertModel<typeof varNews>

// ============================================================================
// AI Discovery Jobs
// ============================================================================

export const discoveryJobs = pgTable('discovery_jobs', {
  id: serial('id').primaryKey(),
  query: text('query').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  results: jsonb('results'),
  varsDiscovered: integer('vars_discovered').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

export type DiscoveryJob = InferSelectModel<typeof discoveryJobs>
export type InsertDiscoveryJob = InferInsertModel<typeof discoveryJobs>

// ============================================================================
// M&A Scenarios
// ============================================================================

export const maScenarios = pgTable('ma_scenarios', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  targetVarIds: jsonb('target_var_ids').$type<number[]>(),
  assumptions: jsonb('assumptions').$type<{
    ebitdaMultiple: number
    synergyCrossSell: number
    synergyMarginImprovement: number
    integrationCostPercent: number
  }>(),
  results: jsonb('results').$type<{
    combinedRevenue: number
    combinedEbitda: number
    estimatedValuation: number
    estimatedPriceRange: { low: number; high: number }
    projectedRoi: number
    capabilityOverlaps: string[]
    capabilityGains: string[]
    vendorOverlaps: string[]
    geographicOverlaps: string[]
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type MaScenario = InferSelectModel<typeof maScenarios>
export type InsertMaScenario = InferInsertModel<typeof maScenarios>

// ============================================================================
// User Sessions Table
// ============================================================================

export const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  scenarios: jsonb('scenarios'),
  filters: jsonb('filters'),
  preferences: jsonb('preferences'),
  shareToken: varchar('share_token', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type UserSession = InferSelectModel<typeof userSessions>
export type InsertUserSession = InferInsertModel<typeof userSessions>

// ============================================================================
// Chat History Table
// ============================================================================

export const chatHistory = pgTable('chat_history', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 36 }).references(() => userSessions.id),
  role: varchar('role', { length: 20 }),
  content: text('content'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type ChatHistoryEntry = InferSelectModel<typeof chatHistory>
export type InsertChatHistoryEntry = InferInsertModel<typeof chatHistory>
