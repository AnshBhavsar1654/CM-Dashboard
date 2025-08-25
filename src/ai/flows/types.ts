
import { z } from 'zod';

export const eventDataSchema = z.object({
  id: z.number(),
  eventName: z.string(),
  date: z.string(),
  type: z.string(),
  district: z.string(),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  tags: z.array(z.string()),
  distanceTravelled: z.number(),
  department: z.string(),
});
