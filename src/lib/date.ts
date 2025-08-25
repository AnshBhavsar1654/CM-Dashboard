// Takes an ISO date string and converts into a JavaScript Date object
// Returns an empty string if the date is invalid

import { format } from "date-fns";

export function formatDisplayDate(dateIso: string, pattern: string = 'dd-MMM-yyyy') {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '';
  return format(d, pattern);
}