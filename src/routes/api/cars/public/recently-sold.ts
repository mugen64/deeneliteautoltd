import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

export const Route = createFileRoute('/api/cars/public/recently-sold')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const recentlySoldCars = await carStore.getRecentlySoldCars(5)
          return Response.json(recentlySoldCars)
        } catch (error) {
          console.error('Error fetching recently sold cars:', error)
          return Response.json({ error: 'Failed to fetch recently sold cars' }, { status: 500 })
        }
      },
    },
  },
})
