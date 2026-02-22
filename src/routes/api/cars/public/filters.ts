import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

export const Route = createFileRoute('/api/cars/public/filters')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const filters = await carStore.getCarFilterOptions()
          return Response.json(filters)
        } catch (error) {
          console.error('Error fetching filter options:', error)
          return Response.json({ error: 'Failed to fetch filter options' }, { status: 500 })
        }
      },
    },
  },
})
