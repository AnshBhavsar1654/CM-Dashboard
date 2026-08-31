import { getEventsData } from "@/lib/events-data"
import { TrendsWrapper } from "@/components/dashboard/trends-wrapper"

export default async function TrendsPage() {
  const events = await getEventsData()

  return <TrendsWrapper events={events} />
}
