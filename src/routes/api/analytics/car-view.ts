import { createFileRoute } from '@tanstack/react-router'
import { analyticsStore } from '@/server/storage/db/queries/analytics'

export const Route = createFileRoute('/api/analytics/car-view')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const carId = body?.carId?.trim()

          if (!carId) {
            return Response.json({ error: 'Missing carId' }, { status: 400 })
          }

          await analyticsStore.trackCarView(carId)
          return Response.json({ success: true })
        } catch (error) {
          console.error('Error tracking car view:', error)
          return Response.json({ error: 'Failed to track car view' }, { status: 500 })
        }
      },
    },
  },
})
