import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

export const Route = createFileRoute('/api/cars/statistics')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const statistics = await carStore.getCarStatistics()
          return Response.json(statistics)
        } catch (error) {
          console.error('Error fetching car statistics:', error)
          return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 })
        }
      },
    },
  },
})
