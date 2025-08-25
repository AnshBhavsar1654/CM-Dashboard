
'use server';

import { google } from 'googleapis';
import type { EventData } from "./types";
import 'dotenv/config';
import { getHomeCoordinates } from './admin-config';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

function getJwt() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SHEETS_CLIENT_EMAIL or GOOGLE_SHEETS_PRIVATE_KEY in your environment variables.');
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
}

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
        if (!isNaN(date.getTime())) {
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
            if (!isNaN(date.getTime())) {
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
  async (): Promise<EventData[]> => {
    console.log('Fetching fresh data from Google Sheets...');
    try {
      const data = await readSheet();
      if (data.length > 0) {
        return data;
      }
      console.log('No data from Google Sheets, returning test events with images');
    } catch (error) {
      console.error("Failed to fetch data from Google Sheets:", error);
      console.log('Returning test events with images for development');
    }
    
    // Return test events with images for development
    const testEvents: EventData[] = [
      {
        id: 1,
        eventName: 'Test Event with Image 1',
        date: '2024-01-15',
        eventDateMs: new Date('2024-01-15').getTime(),
        district: 'Test District A',
        location: 'Test Location A',
        type: 'public event',
        latitude: 17.3850,
        longitude: 78.4867,
        tags: ['test', 'public'],
        distanceTravelled: 0,
        department: 'Test Department',
        imgLink: 'https://placehold.co/640x360/4f46e5/white?text=Test+Event+1',
      },
      {
        id: 2,
        eventName: 'Test Event with Image 2',
        date: '2024-01-16',
        eventDateMs: new Date('2024-01-16').getTime(),
        district: 'Test District B',
        location: 'Test Location B',
        type: 'government event',
        latitude: 17.4000,
        longitude: 78.5000,
        tags: ['test', 'government'],
        distanceTravelled: 10,
        department: 'Test Department 2',
        imgLink: 'https://placehold.co/640x360/e11d48/white?text=Test+Event+2',
      },
      {
        id: 3,
        eventName: 'Test Event with Image 3',
        date: '2024-01-17',
        eventDateMs: new Date('2024-01-17').getTime(),
        district: 'Test District C',
        location: 'Test Location C',
        type: 'social event',
        latitude: 17.4200,
        longitude: 78.4500,
        tags: ['test', 'social'],
        distanceTravelled: 5,
        department: 'Test Department 3',
        imgLink: 'https://placehold.co/640x360/10b981/white?text=Test+Event+3',
      },
      {
        id: 4,
        eventName: 'Test Event Without Image',
        date: '2024-01-18',
        eventDateMs: new Date('2024-01-18').getTime(),
        district: 'Test District D',
        location: 'Test Location D',
        type: 'political event',
        latitude: 17.3600,
        longitude: 78.4700,
        tags: ['test', 'political'],
        distanceTravelled: 15,
        department: 'Test Department 4',
      },
    ];
    return testEvents;
  },
  ['events-data'],
  { revalidate: 21600, tags: ['events-data'] } // 6 Hrs = 6*60*60 
);

export async function getEventsData(): Promise<EventData[]> {
    return getCachedEventsData();
}

export async function revalidateEvents() {
  revalidateTag('events-data');
}

async function readSheet(): Promise<EventData[]> {
  console.log('Reading data from Google Sheets...');
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEET_ID in your environment variables.');
  }
  const auth = getJwt();
  const sheets = google.sheets({ version: 'v4', auth });

  // Ensure we always read from the sheet named "Data"
  // We first resolve the exact sheet title from metadata to avoid case/locale issues
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title'
  });
  const titles = (meta.data.sheets || []).map(s => s.properties?.title || '');
  const dataTitle = titles.find(t => t.toLowerCase() === 'data');
  if (!dataTitle) {
    throw new Error('The spreadsheet does not contain a sheet named "Data". Please add/rename the sheet to "Data".');
  }
  // Read entire sheet (no explicit column range)
  const range = `${dataTitle}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const values = res.data.values || [];
  console.log(`Found ${values.length} rows in the spreadsheet`);
  if (values.length < 2) return [];

  const [header, ...rows] = values;
  console.log(`Processing ${rows.length} data rows`);

  const headerMap: { [key: string]: number } = {};
  header.forEach((h: string, i: number) => {
    headerMap[h.trim().toLowerCase().replace(/\s+/g, '')] = i;
  });
  
  const columnMapping = {
    eventName: 'eventname',
    date: 'date',
    type: 'typeofevents',
    district: 'district',
    location: 'location',
    latitude: 'latitude',
    longitude: 'longitude',
    tags: 'tags',
    department: 'department',
    imgLink: 'img_link',
  };

  // Only validate required columns (date and event name)
  const requiredColumns = ['eventName', 'date'];
  for (const key of requiredColumns) {
      if (headerMap[columnMapping[key as keyof typeof columnMapping]] === undefined) {
          throw new Error(`Missing required column in Google Sheet: The application expects a column that maps to '${key}'. Please check your sheet for a column named like '${key.replace(/([A-Z])/g, ' $1')}' or adjust the mapping.`);
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
      const parsedDate = parseDateString(dateValue);

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
        district: String(rowData[columnMapping.district] || '').trim(),
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
      console.error(`Error parsing row ${index + 2} from Google Sheet`, r, e);
      return null;
    }
  }).filter((event): event is NonNullable<typeof event> => event !== null);

  const skippedRows = rows.length - parsedEvents.length;
  console.log(`Parsed ${parsedEvents.length} valid events out of ${rows.length} rows (${skippedRows} rows skipped)`);
  return parsedEvents.sort((a, b) => a.eventDateMs - b.eventDateMs);
}
