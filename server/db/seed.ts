import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { portfolioCompanies, type InsertPortfolioCompany } from './schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// CSV Parser
// ============================================================================

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim()
    }
    rows.push(row)
  }

  return rows
}

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set.')
    process.exit(1)
  }

  console.log('Connecting to database...')
  const sql = neon(databaseUrl)
  const db = drizzle(sql)

  // Read CSV file
  const csvPath = resolve(__dirname, '../../data/aea_comprehensive_data.csv')
  console.log(`Reading CSV from: ${csvPath}`)
  const csvText = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvText)
  console.log(`Parsed ${rows.length} rows from CSV.`)

  // Map CSV rows to portfolio_companies insert records
  const companies: InsertPortfolioCompany[] = rows.map((row) => ({
    rank: parseInt(row['Rank'], 10) || null,
    name: row['Company'],
    cohort: row['Cohort'],
    investmentGroup: row['Inv_Group'],
    revenue: parseFloat(row['Revenue_M']) || null,
    ebitda: parseFloat(row['Est_EBITDA_M']) || null,
    scores: {
      ebitda_impact: parseFloat(row['EBITDA_Impact']) || 0,
      rev_enable: parseFloat(row['Rev_Enable']) || 0,
      risk_reduce: parseFloat(row['Risk_Reduce']) || 0,
      org_cap: parseFloat(row['Org_Cap']) || 0,
      data_ready: parseFloat(row['Data_Ready']) || 0,
      tech_infra: parseFloat(row['Tech_Infra']) || 0,
      timeline_fit: parseFloat(row['Timeline_Fit']) || 0,
    },
    valueScore: parseFloat(row['VALUE_SCORE']) || null,
    readinessScore: parseFloat(row['READINESS_SCORE']) || null,
    priorityScore: parseFloat(row['Priority_Score']) || null,
    quadrant: row['Quadrant'],
    track: row['Track'],
    trackDescription: row['Track_Description'],
    implementationYear: row['Implementation_Year'],
    implementationQuarter: row['Implementation_Quarter'],
    valueTheme: row['Value_Theme'],
    platformClassification: row['Platform_Classification'],
    replicationPotential: parseInt(row['Replication_Potential'], 10) || null,
    replicationCount: parseInt(row['Portfolio_Replication_Count'], 10) || null,
    adjustedEbitda: parseFloat(row['Adjusted_EBITDA_M']) || null,
    adjustedPriority: parseFloat(row['Adjusted_Priority_M']) || null,
    portfolioAdjustedPriority: parseFloat(row['Portfolio_Adjusted_Priority']) || null,
  }))

  // Insert in batches of 10
  const batchSize = 10
  let inserted = 0

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize)
    await db.insert(portfolioCompanies).values(batch)
    inserted += batch.length
    console.log(`Inserted ${inserted}/${companies.length} companies...`)
  }

  console.log(`\nSeed complete! Inserted ${inserted} portfolio companies.`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
