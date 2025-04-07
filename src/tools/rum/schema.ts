import { z } from 'zod'

// Schema for listing RUM events
export const ListRumEventsZodSchema = z.object({
  from: z.number().describe('Start time in epoch seconds'),
  to: z.number().describe('End time in epoch seconds'),
  limit: z
    .number()
    .optional()
    .default(100)
    .describe('Maximum number of events to return. Default is 100.'),
})

// Schema for searching RUM events
export const SearchRumEventsZodSchema = z.object({
  query: z.string().describe('RUM events query string'),
  from: z.number().describe('Start time in epoch seconds'),
  to: z.number().describe('End time in epoch seconds'),
  limit: z
    .number()
    .optional()
    .default(100)
    .describe('Maximum number of events to return. Default is 100.'),
})

// Schema for getting RUM event details
export const GetRumEventZodSchema = z.object({
  eventId: z.string().nonempty().describe('The RUM event ID'),
})
