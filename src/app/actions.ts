// Fetches a fresh copy of events from Google Sheets and returns the number of events fetched

'use server'

import { getEventsData, revalidateEvents } from '@/lib/events-data'
import { TOTAL_DISTRICTS, isGujaratDistrict } from '@/lib/districts'

export async function revalidateAndFetchEvents() {
  console.log('Revalidating events data cache...');
  // Invalidate the cache tag; the next read below goes straight to the sheet.
  revalidateEvents();

  console.log('Fetching fresh data from Google Sheets...');
  const events = await getEventsData()
  console.log(`Fetched ${events.length} events`);
  return events.length
}

export async function getSidebarStats() {
  const events = await getEventsData()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const startMs = monthStart.getTime()
  const endMs = monthEnd.getTime()
  const thisMonth = events.filter(e => e.eventDateMs >= startMs && e.eventDateMs <= endMs)

  const eventsThisMonth = thisMonth.length
  const districtsCovered = new Set(thisMonth.map(e => e.district).filter(isGujaratDistrict)).size
  const districtsRemaining = Math.max(0, TOTAL_DISTRICTS - districtsCovered)

  return { eventsThisMonth, districtsCovered, districtsRemaining, totalDistricts: TOTAL_DISTRICTS }
}
