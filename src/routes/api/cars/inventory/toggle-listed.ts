import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/toggle-listed')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const carId = data.carId

          if (!carId) {
            return Response.json({ error: 'Car ID is required' }, { status: 400 })
          }

          const car = await carStore.toggleCarListed(carId)
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          return Response.json(car)
        } catch (error) {
          console.error('Error toggling car listed status:', error)
          return Response.json({ error: 'Failed to toggle listed status' }, { status: 500 })
        }
      },
    },
  },
})
