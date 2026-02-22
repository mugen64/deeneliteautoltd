import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/inventory/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const cars = await carStore.getAllCars()
          return Response.json({ cars })
        } catch (error) {
          console.error('Error fetching cars:', error)
          return Response.json({ error: 'Failed to fetch cars' }, { status: 500 })
        }
      },
    },
  },
})
