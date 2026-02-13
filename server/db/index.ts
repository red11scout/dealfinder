import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn('DATABASE_URL not set — database features will be unavailable. Using in-memory fallback.')
}

const sql = databaseUrl ? neon(databaseUrl) : null
export const db = sql ? drizzle(sql, { schema }) : null
