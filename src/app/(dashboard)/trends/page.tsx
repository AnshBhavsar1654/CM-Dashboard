import { getEventsData } from "@/lib/events-data"
import { TrendsWrapper } from "@/components/trends/trends-wrapper"

export default async function TrendsPage() {
  const events = await getEventsData()

  return <TrendsWrapper events={events} />
}
