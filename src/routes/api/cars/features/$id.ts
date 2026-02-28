import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/features/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const feature = await carStore.getCarFeatureTypeById(params.id)
          if (!feature) {
            return Response.json({ error: 'Feature not found' }, { status: 404 })
          }
          return Response.json({ feature })
        } catch (error) {
          console.error('Error fetching car feature:', error)
          return Response.json({ error: 'Failed to fetch car feature' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const feature = await carStore.deleteCarFeatureType(params.id)
          if (!feature) {
            return Response.json({ error: 'Feature not found' }, { status: 404 })
          }
          return Response.json({ success: true })
        } catch (error) {
          console.error('Error deleting car feature:', error)
          return Response.json({ error: 'Failed to delete car feature' }, { status: 500 })
        }
      },
    },
  },
})
