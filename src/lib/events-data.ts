// Server-only data access. Intentionally NOT a 'use server' module: that would
// expose every export below as a publicly callable server action endpoint.

import path from 'path';
import ExcelJS from 'exceljs';
import type { EventData } from "./types";
import { getHomeCoordinates } from './admin-config';
import { normalizeDistrict } from './districts';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

// Single source of truth for dashboard data (committed to the repo).
const DATA_FILE = path.join(process.cwd(), 'data', 'cm_visits.xlsx');
const DATA_SHEET = 'Data';

/**
 * Parse various date formats into a Date.
 * Supported examples:
 * - dd/mm/yyyy (e.g., 12/06/2025)
 * - dd-mmm-yyyy (e.g., 31-May-2025)
 * - Fallback to Date(dateStr) for ISO-like formats (e.g., 2025-05-31)
 * Returns null if parsing fails.
 */
function parseDateString(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;

    // Method 1: Try parsing dd/mm/yyyy format FIRST (e.g., "12/06/2025" = June 12, 2025)
    const slashParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashParts) {
        const day = parseInt(slashParts[1], 10);
        const month = parseInt(slashParts[2], 10) - 1; // JavaScript months are 0-indexed
        const year = parseInt(slashParts[3], 10);
        
        // Create date using constructor to avoid string parsing issues
        const date = new Date(year, month, day);
        // Reject overflowed dates like 31/02/2025 instead of silently rolling over
        if (date.getMonth() === month && date.getDate() === day) {
            return date;
        }
    }
    
    // Method 2: Try parsing dd-mmm-yyyy format (e.g., "31-May-2025" = May 31, 2025)
    const monthMap: { [key: string]: number } = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    const dashParts = dateStr.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{4})$/);
    if (dashParts) {
        const day = parseInt(dashParts[1], 10);
        const month = monthMap[dashParts[2].substring(0, 3).toLowerCase()];
        const year = parseInt(dashParts[3], 10);

        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            const date = new Date(year, month, day);
            if (date.getMonth() === month && date.getDate() === day) {
                return date;
            }
        }
    }

    // Method 3: Try direct parsing as fallback (handles YYYY-MM-DD, MMM DD, YYYY etc.)
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null; // Return null if no format matches
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}


export const getCachedEventsData = cache(
  async (): Promise<EventData[]> => readSheet(),
  ['events-data'],
  { revalidate: 21600, tags: ['events-data'] } // 6 Hrs = 6*60*60
);

/**
 * Public accessor for events data.
 * Development reads the file on every call so edits show up immediately;
 * production uses the cached copy.
 */
export async function getEventsData(): Promise<EventData[]> {
    if (process.env.NODE_ENV !== 'production') {
        return readSheet();
    }
    return getCachedEventsData();
}

export function revalidateEvents() {
  revalidateTag('events-data');
}

/**
 * Returns events filtered to the last N months based on a range key.
 * rangeKey: '1m' | '3m' | '6m' | '1y' | '2y'
 */
export async function getFilteredEventsData(rangeKey: '1m' | '3m' | '6m' | '1y' | '2y'): Promise<EventData[]> {
  const all = await getEventsData();
  const months =
    rangeKey === '1m'
      ? 1
      : rangeKey === '3m'
      ? 3
      : rangeKey === '6m'
      ? 6
      : rangeKey === '2y'
      ? 24
      : 12;
  const now = Date.now();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffMs = cutoff.getTime();
  return all.filter(e => e.eventDateMs >= cutoffMs && e.eventDateMs <= now);
}

/** Convert an Excel cell value (string, number, Date, rich text, formula result) to a plain value. */
function cellToValue(v: ExcelJS.CellValue): string | number | Date | undefined {
  if (v === null || v === undefined) return undefined;
  if (v instanceof Date || typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'object') {
    if ('result' in v) return cellToValue(v.result as ExcelJS.CellValue);
    if ('richText' in v) return v.richText.map(t => t.text).join('');
    if ('text' in v) return String(v.text);
  }
  return String(v);
}

/**
 * Read data/cm_visits.xlsx ("Data" sheet) and transform rows into EventData objects.
 * Headers are normalized (lowercase, no spaces) and mapped via `columnMapping`.
 */
async function readSheet(): Promise<EventData[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);
  const sheet = workbook.worksheets.find(w => w.name.toLowerCase() === DATA_SHEET.toLowerCase());
  if (!sheet) {
    throw new Error(`${DATA_FILE} does not contain a sheet named "${DATA_SHEET}".`);
  }

  const values: any[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: any[] = [];
    for (let c = 1; c <= sheet.columnCount; c++) {
      cells.push(cellToValue(row.getCell(c).value));
    }
    values.push(cells);
  });
  if (values.length < 2) return [];

  const [header, ...rows] = values;

  const headerMap: { [key: string]: number } = {};
  header.forEach((h: string, i: number) => {
    headerMap[String(h ?? '').trim().toLowerCase().replace(/\s+/g, '')] = i;
  });
  
  const columnMapping = {
    // Maps our EventData fields (left) to normalized header keys (right)
    eventName: 'eventtitle',
    date: 'date',
    type: 'eventtype',
    district: 'district',
    location: 'venue',
    latitude: 'latitude',
    longitude: 'longitude',
    tags: 'geotag',
    department: 'sector',
    imgLink: 'imagelink'
  };

  // Only validate required columns (date and event name)
  const requiredColumns = ['eventName', 'date'];
  for (const key of requiredColumns) {
      if (headerMap[columnMapping[key as keyof typeof columnMapping]] === undefined) {
          throw new Error(`Missing required column in data/cm_visits.xlsx: The application expects a column that maps to '${key}'. Please check your sheet for a column named like '${key.replace(/([A-Z])/g, ' $1')}' or adjust the mapping.`);
      }
  }

  // Fixed hardcoded home coordinates
  const homeCoordinates = getHomeCoordinates();
  
  const parsedEvents = rows.map((r: any[], index: number) => {
    const rowData: any = {};
    Object.keys(headerMap).forEach(key => {
        rowData[key] = r[headerMap[key]];
    });

    // Check if required fields (date and event name) are present
    const eventName = String(rowData[columnMapping.eventName] || '').trim();
    const dateValue = rowData[columnMapping.date];
    
    // Log rows that don't have both event name and date
    if (!eventName || !dateValue) {
      if (!eventName && !dateValue) {
        console.log(`Skipping row ${index + 2}: Both event name and date are missing`);
      } else if (!eventName) {
        console.log(`Skipping row ${index + 2}: Event name is missing (date: ${dateValue})`);
      } else if (!dateValue) {
        console.log(`Skipping row ${index + 2}: Date is missing (event name: ${eventName})`);
      }
      return null;
    }

    try {
      const parsedDate = dateValue instanceof Date ? dateValue : parseDateString(String(dateValue));

      if (!parsedDate) {
        console.log(`Skipping row ${index + 2}: Invalid date format (${dateValue})`);
        return null;
      }
      const eventDate = parsedDate.toISOString();
      const eventDateMs = parsedDate.getTime();

      // Get coordinates, but make them optional
      const eventLat = Number(rowData[columnMapping.latitude] || 0);
      const eventLng = Number(rowData[columnMapping.longitude] || 0);
      
      // Only calculate distance if we have valid coordinates
      let distance = 0;
      if (eventLat !== 0 || eventLng !== 0) {
        distance = getDistanceFromLatLonInKm(
          homeCoordinates.latitude,
          homeCoordinates.longitude,
          eventLat,
          eventLng
        );
      }

      return {
        id: index + 1,
        eventName: eventName,
        date: eventDate,
        type: String(rowData[columnMapping.type] || '').trim(),
        district: normalizeDistrict(rowData[columnMapping.district]),
        location: String(rowData[columnMapping.location] || '').trim(),
        latitude: eventLat,
        longitude: eventLng,
        tags: String(rowData[columnMapping.tags] || '').split(',').map(tag => tag.trim()).filter(Boolean),
        distanceTravelled: distance,
        department: String(rowData[columnMapping.department] || '').trim(),
        imgLink: String(rowData[columnMapping.imgLink] || '').trim() || undefined,
        eventDateMs,
      };
    } catch (e) {
      console.error(`Error parsing row ${index + 2} from data/cm_visits.xlsx`, r, e);
      return null;
    }
  }).filter((event): event is NonNullable<typeof event> => event !== null);

  const skippedRows = rows.length - parsedEvents.length;
  console.log(`Parsed ${parsedEvents.length} valid events out of ${rows.length} rows (${skippedRows} rows skipped)`);
  return parsedEvents.sort((a, b) => a.eventDateMs - b.eventDateMs);
}