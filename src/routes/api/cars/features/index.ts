import { carStore } from '@/server/storage/db/queries/cars'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/features/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const features = await carStore.getCarFeatureTypes()
          return Response.json({ features })
        } catch (error) {
          console.error('Error fetching car features:', error)
          return Response.json({ error: 'Failed to fetch car features' }, { status: 500 })
        }
      },
    },
  },
})
