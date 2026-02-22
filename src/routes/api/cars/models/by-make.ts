import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/models/by-make')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const modelsByMake = await carStore.getModelsByMake()
          return Response.json(modelsByMake)
        } catch (error) {
          console.error('Error fetching models by make:', error)
          return Response.json({ error: 'Failed to fetch models by make' }, { status: 500 })
        }
      },
    },
  },
})
