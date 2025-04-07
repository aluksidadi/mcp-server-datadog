import { v2 } from '@datadog/datadog-api-client'
import { describe, it, expect } from 'vitest'
import { createDatadogConfig } from '../../src/utils/datadog'
import { createRumToolHandlers } from '../../src/tools/rum/tool'
import { createMockToolRequest } from '../helpers/mock'
import { http, HttpResponse } from 'msw'
import { setupServer } from '../helpers/msw'
import { baseUrl, DatadogToolResponse } from '../helpers/datadog'

const rumEventsEndpoint = `${baseUrl}/v2/rum/events`

describe('RUM Tool', () => {
  if (!process.env.DATADOG_API_KEY || !process.env.DATADOG_APP_KEY) {
    throw new Error('DATADOG_API_KEY and DATADOG_APP_KEY must be set')
  }

  const datadogConfig = createDatadogConfig({
    apiKeyAuth: process.env.DATADOG_API_KEY,
    appKeyAuth: process.env.DATADOG_APP_KEY,
    site: process.env.DATADOG_SITE,
  })

  const apiInstance = new v2.RUMApi(datadogConfig)
  const toolHandlers = createRumToolHandlers(apiInstance)

  // https://docs.datadoghq.com/api/latest/rum/
  describe.concurrent('list_rum_events', async () => {
    it('should retrieve RUM events', async () => {
      // Mock API response based on Datadog API documentation
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: [
            {
              id: 'rum-event-1',
              attributes: {
                timestamp: 1640995199999,
                type: 'view',
                service: 'test-service',
                application: {
                  id: 'app123',
                },
              },
              type: 'rum',
            },
          ],
          meta: {
            page: {
              after:
                'eyJzdGFydEF0IjoiQVFBQUFYR0xkRDBBQUFCUFYtNXdocWdCIiwiaW5kZXgiOiJtYWluIn0=',
            },
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('list_rum_events', {
          from: 1640995100, // epoch seconds
          to: 1640995200, // epoch seconds
          limit: 10,
        })
        const response = (await toolHandlers.list_rum_events(
          request,
        )) as unknown as DatadogToolResponse
        expect(response.content[0].text).toContain('RUM events')
        expect(response.content[0].text).toContain('rum-event-1')
      })()

      server.close()
    })

    it('should handle empty response', async () => {
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: [],
          meta: {
            page: {},
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('list_rum_events', {
          from: 1640995100,
          to: 1640995200,
        })
        const response = (await toolHandlers.list_rum_events(
          request,
        )) as unknown as DatadogToolResponse
        expect(response.content[0].text).toContain('RUM events')
        expect(response.content[0].text).toContain('[]')
      })()

      server.close()
    })

    it('should handle null response data', async () => {
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: null,
          meta: {
            page: {},
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('list_rum_events', {
          from: 1640995100,
          to: 1640995200,
        })
        await expect(toolHandlers.list_rum_events(request)).rejects.toThrow(
          'No RUM events data returned',
        )
      })()

      server.close()
    })
  })

  describe.concurrent('search_rum_events', async () => {
    it('should search RUM events', async () => {
      // Mock API response based on Datadog API documentation
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: [
            {
              id: 'rum-event-1',
              attributes: {
                timestamp: 1640995199999,
                type: 'error',
                service: 'test-service',
                application: {
                  id: 'app123',
                },
              },
              type: 'rum',
            },
          ],
          meta: {
            page: {
              after:
                'eyJzdGFydEF0IjoiQVFBQUFYR0xkRDBBQUFCUFYtNXdocWdCIiwiaW5kZXgiOiJtYWluIn0=',
            },
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('search_rum_events', {
          query: 'error',
          from: 1640995100, // epoch seconds
          to: 1640995200, // epoch seconds
          limit: 10,
        })
        const response = (await toolHandlers.search_rum_events(
          request,
        )) as unknown as DatadogToolResponse
        expect(response.content[0].text).toContain('RUM events')
        expect(response.content[0].text).toContain('rum-event-1')
      })()

      server.close()
    })
  })

  describe.concurrent('get_rum_event', async () => {
    it('should get a RUM event', async () => {
      // Mock API response based on Datadog API documentation
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: [
            {
              id: 'rum-event-123',
              attributes: {
                timestamp: 1640995199999,
                type: 'view',
                service: 'test-service',
                application: {
                  id: 'app123',
                },
              },
              type: 'rum',
            },
          ],
          meta: {
            page: {},
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('get_rum_event', {
          eventId: 'rum-event-123',
        })
        const response = (await toolHandlers.get_rum_event(
          request,
        )) as unknown as DatadogToolResponse
        expect(response.content[0].text).toContain('RUM event')
        expect(response.content[0].text).toContain('rum-event-123')
      })()

      server.close()
    })

    it('should handle empty response', async () => {
      const mockHandler = http.get(rumEventsEndpoint, async () => {
        return HttpResponse.json({
          data: [],
          meta: {
            page: {},
          },
        })
      })

      const server = setupServer(mockHandler)

      await server.boundary(async () => {
        const request = createMockToolRequest('get_rum_event', {
          eventId: 'non-existent',
        })
        await expect(toolHandlers.get_rum_event(request)).rejects.toThrow(
          'No RUM event data returned',
        )
      })()

      server.close()
    })
  })
})
