import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, updateUserFilter } from '@/lib/db'
import { getFilteredEventsData } from '@/lib/events-data'
import { setSession, UserSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, filter } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    // Support both hashed and plain stored passwords
    const ok = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : password === user.password
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const chosenFilter: '1m' | '3m' | '6m' | '1y' = (filter === '1m' || filter === '3m' || filter === '6m' || filter === '1y')
      ? filter
      : (user.filter || '6m')

    // Before persisting or creating a session, ensure there is data for the selected filter
    const testEvents = await getFilteredEventsData(chosenFilter)
    if (!testEvents || testEvents.length === 0) {
      return NextResponse.json({ error: 'No relevant records found for the selected filter.' }, { status: 404 })
    }

    // Persist filter selection if changed (only after validation above)
    if (chosenFilter !== user.filter) {
      try {
        await updateUserFilter(user.id, chosenFilter)
      } catch (err) {
        console.warn('Failed to update user filter', err)
      }
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      designation: user.designation,
      filter: chosenFilter,
    }
    await setSession(session)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Login error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}