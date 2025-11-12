/**
 * entry point for the dashboard route.
 * fetches events on the server and renders the dashboard UI with preloaded data.
 * ensures the dashboard has all event data ready at render time
 */

import { getFilteredEventsData } from "@/lib/events-data";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function DashboardPage() {
  // Default filter - dashboard opens directly without authentication
  const filter = '2y';
  console.log('Fetching initial events with filter:', filter);
  const events = await getFilteredEventsData(filter);
  console.log(`Fetched ${events.length} events for initial render with filter ${filter}`);

  return <DashboardWrapper initialEvents={events} />;
}
