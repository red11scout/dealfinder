# BlueAlly M&A Intelligence & Portfolio Analytics Platform

## Project Overview
BlueAlly-branded AI-powered platform combining:
1. **AEA Portfolio Intelligence** — Three Framework analysis for 54 PE portfolio companies
2. **VAR Directory** — Comprehensive US Value Added Reseller database (51 companies)
3. **M&A Acquisition Engine** — AI-scored acquisition target rankings for BlueAlly

## Tech Stack
- React 19, Vite 6, TypeScript, Tailwind CSS 3.4
- Express 4 backend, PostgreSQL (Neon) via Drizzle ORM
- Recharts + D3.js visualizations, TanStack Table
- HyperFormula deterministic calculation engine
- Zustand state management
- LangChain + Anthropic Claude SDK (AI features)

## Brand
- Navy: #001278, Blue: #02a2fd, Green: #36bf78
- Font: DM Sans (Google Fonts)
- Voice: Ernest Hemingway — short, direct, professional warmth

## Key Patterns
- `apiRequest(method, url, data?)` — method is FIRST parameter
- CSS variables for light/dark mode: `var(--color-navy)`, `var(--color-blue)`, etc.
- Shared components in `client/src/components/shared/`
- All calculations in `client/src/lib/calculations.ts` (ported from blueally-aea-dashboard)
- Portfolio data hardcoded in store (DB seed available for production)

## Commands
- `npm run dev` — Start dev server (Vite + Express)
- `npm run build` — Production build
- `npm run db:push` — Push Drizzle schema to DB
- `npm run db:seed` — Seed portfolio data from CSV

## Structure
```
client/src/
  components/layout/    — AppShell, Header, Sidebar, ThemeToggle
  components/shared/    — Card, MetricCard, Badge, Button, FilterPills, SearchBar, Tooltip
  pages/portfolio/      — 7 tabs: ExecutiveSummary, ValueReadiness, PortfolioAmplification, HoldPeriod, ValueDrivers, Dashboard, ScenarioPlanner
  pages/                — VarDirectory, MaEngine
  stores/               — portfolio, vars, ma, theme, app
  lib/                  — calculations (HyperFormula), types
server/
  routes/               — portfolio, vars, ma API routes
  db/                   — Drizzle schema + seed script
  agents/               — LangChain agent definitions (placeholder)
shared/                 — TypeScript types shared between client/server
data/                   — CSV seed data
```
