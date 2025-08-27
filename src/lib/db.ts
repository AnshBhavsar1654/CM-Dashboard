import { Pool } from 'pg'

// Reads connection details from environment variables
// Required envs: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
// Optional: PGSSL ("true" | "false")

let pool: Pool | null = null

export function getDb() {
  if (!pool) {
    const sslEnabled = (process.env.PGSSL || 'true').toLowerCase() === 'true'
    pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30_000,
    })
  }
  return pool
}

export type UserRow = {
  id: number
  email: string
  password: string // hashed or plain (see login route)
  name: string | null
  designation: string | null
  filter: '1m' | '3m' | '6m' | '1y'
}

// Helper to fetch a user by email
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = getDb()
  const { rows } = await db.query(
    `SELECT id, email, password, name, designation, filter
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  )
  return rows[0] || null
}

export async function updateUserFilter(userId: number, filter: '1m'|'3m'|'6m'|'1y'): Promise<void> {
  const db = getDb()
  await db.query(
    `UPDATE users SET filter = $1, updated_at = NOW() WHERE id = $2`,
    [filter, userId]
  )
}
