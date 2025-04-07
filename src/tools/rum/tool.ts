import { ExtendedTool, ToolHandlers } from '../../utils/types'
import { v2 } from '@datadog/datadog-api-client'
import { createToolSchema } from '../../utils/tool'
import {
  ListRumEventsZodSchema,
  SearchRumEventsZodSchema,
  GetRumEventZodSchema,
} from './schema'

type RumToolName = 'list_rum_events' | 'search_rum_events' | 'get_rum_event'
type RumTool = ExtendedTool<RumToolName>

export const RUM_TOOLS: RumTool[] = [
  createToolSchema(
    ListRumEventsZodSchema,
    'list_rum_events',
    'List RUM events from Datadog',
  ),
  createToolSchema(
    SearchRumEventsZodSchema,
    'search_rum_events',
    'Search RUM events from Datadog',
  ),
  createToolSchema(
    GetRumEventZodSchema,
    'get_rum_event',
    'Get a RUM event from Datadog',
  ),
] as const

type RumToolHandlers = ToolHandlers<RumToolName>

export const createRumToolHandlers = (
  apiInstance: v2.RUMApi,
): RumToolHandlers => ({
  list_rum_events: async (request) => {
    const { from, to, limit } = ListRumEventsZodSchema.parse(
      request.params.arguments,
    )

    // Convert epoch seconds to ISO string for the API
    const fromDate = new Date(from * 1000)
    const toDate = new Date(to * 1000)

    const response = await apiInstance.listRUMEvents({
      filterQuery: '',
      filterFrom: fromDate,
      filterTo: toDate,
      pageLimit: limit,
    })

    if (response.data == null) {
      throw new Error('No RUM events data returned')
    }

    return {
      content: [
        {
          type: 'text',
          text: `RUM events: ${JSON.stringify(response.data)}`,
        },
      ],
    }
  },
  search_rum_events: async (request) => {
    const { query, from, to, limit } = SearchRumEventsZodSchema.parse(
      request.params.arguments,
    )

    // Convert epoch seconds to ISO string for the API
    const fromDate = new Date(from * 1000)
    const toDate = new Date(to * 1000)

    const response = await apiInstance.listRUMEvents({
      filterQuery: query,
      filterFrom: fromDate,
      filterTo: toDate,
      pageLimit: limit,
    })

    if (response.data == null) {
      throw new Error('No RUM events data returned')
    }

    return {
      content: [
        {
          type: 'text',
          text: `RUM events: ${JSON.stringify(response.data)}`,
        },
      ],
    }
  },
  get_rum_event: async (request) => {
    const { eventId } = GetRumEventZodSchema.parse(request.params.arguments)

    // Since there's no direct getRUMEvent method, we'll use listRUMEvents with a filter
    const response = await apiInstance.listRUMEvents({
      filterQuery: `@id:${eventId}`,
      pageLimit: 1,
    })

    if (response.data == null || response.data.length === 0) {
      throw new Error('No RUM event data returned')
    }

    // Return the first (and should be only) event that matches the ID
    return {
      content: [
        {
          type: 'text',
          text: `RUM event: ${JSON.stringify(response.data[0])}`,
        },
      ],
    }
  },
})
