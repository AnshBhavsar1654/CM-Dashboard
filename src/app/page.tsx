/**
 * entry point for the dashboard route.
 * fetches events on the server and renders the dashboard UI with preloaded data.
 * ensures the dashboard has all event data ready at render time
 */

import { getEventsData } from "@/lib/events-data";

import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function DashboardPage() {
  console.log('Fetching initial events data for dashboard...');
  const events = await getEventsData();
  console.log(`Fetched ${events.length} events for initial dashboard render`);

  return <DashboardWrapper initialEvents={events} />;
}
