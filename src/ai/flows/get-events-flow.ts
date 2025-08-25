
'use server';

import { ai } from '@/ai/genkit';
import { getEventsData } from '@/lib/events-data';
import { z } from 'zod';
import { eventDataSchema } from './types';

export const getEventsFlow = ai.defineFlow(
  {
    name: 'getEventsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(eventDataSchema),
  },
  async () => {
    return await getEventsData();
  },
);
