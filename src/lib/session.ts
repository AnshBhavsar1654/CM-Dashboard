import { cookies } from 'next/headers'
import crypto from 'crypto'

export type UserSession = {
  id: number
  email: string
  name: string | null
  designation: string | null
  filter: '1m' | '3m' | '6m' | '1y'
}

const COOKIE_NAME = 'gov_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('Missing AUTH_SECRET env var')
  return secret
}

function sign(value: string) {
  const h = crypto.createHmac('sha256', getSecret()).update(value).digest('base64url')
  return `${value}.${h}`
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf('.')
  if (idx === -1) return null
  const value = signed.slice(0, idx)
  const sig = signed.slice(idx + 1)
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('base64url')
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null
}

export async function getSession(): Promise<UserSession | null> {
  const c = await cookies()
  const raw = c.get(COOKIE_NAME)?.value
  if (!raw) return null
  const payloadStr = verify(raw)
  if (!payloadStr) return null
  try {
    return JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8')) as UserSession
  } catch {
    return null
  }
}

export async function setSession(session: UserSession) {
  const c = await cookies()
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  const signed = sign(payload)
  c.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearSession() {
  const c = await cookies()
  c.set(COOKIE_NAME, '', { path: '/', maxAge: 0 })
}
