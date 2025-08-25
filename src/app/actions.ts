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
