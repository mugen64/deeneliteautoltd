import { carStore } from "@/server/storage/db/cars"
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/cars/models/by-make')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const modelsByMake = await carStore.getModelsByMake()
          return json(modelsByMake)
        } catch (error) {
          console.error('Error fetching models by make:', error)
          return json({ error: 'Failed to fetch models by make' }, { status: 500 })
        }
      },
    },
  },
})
