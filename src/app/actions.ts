// Fetches a fresh copy of events from Google Sheets and returns the number of events fetched

'use server'

import { getEventsData, revalidateEvents } from '@/lib/events-data'

export async function revalidateAndFetchEvents() {
  console.log('Revalidating events data cache...');
  revalidateEvents(); // This triggers revalidation of the cache
  
  // Wait a bit for revalidation to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Fetching fresh data from Google Sheets...');
  const events = await getEventsData()
  console.log(`Fetched ${events.length} events`);
  return events.length
}

const TOTAL_DISTRICTS = 33

export async function getSidebarStats() {
  const events = await getEventsData()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const thisMonth = events.filter(e => {
    const d = new Date(e.date)
    return d >= monthStart && d <= monthEnd
  })

  const eventsThisMonth = thisMonth.length
  const districtsCovered = new Set(thisMonth.map(e => e.district).filter(Boolean)).size
  const districtsRemaining = Math.max(0, TOTAL_DISTRICTS - districtsCovered)

  return { eventsThisMonth, districtsCovered, districtsRemaining, totalDistricts: TOTAL_DISTRICTS }
}
