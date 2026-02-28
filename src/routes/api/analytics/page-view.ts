import { createFileRoute } from '@tanstack/react-router'
import { analyticsStore } from '@/server/storage/db/queries/analytics'

export const Route = createFileRoute('/api/analytics/page-view')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const pagePath = body?.pagePath?.trim()

          if (!pagePath) {
            return Response.json({ error: 'Missing pagePath' }, { status: 400 })
          }

          await analyticsStore.trackPageView(pagePath)
          return Response.json({ success: true })
        } catch (error) {
          console.error('Error tracking page view:', error)
          return Response.json({ error: 'Failed to track page view' }, { status: 500 })
        }
      },
    },
  },
})
