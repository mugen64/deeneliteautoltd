import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/toggle-featured')({
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

          const car = await carStore.getCarById(carId)
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          // Can't feature a sold car
          if (!car.cars.isFeatured && car.cars.sold) {
            return Response.json({ error: 'Cannot feature a sold car' }, { status: 400 })
          }

          const updatedCar = await carStore.toggleCarFeatured(carId)
          return Response.json(updatedCar)
        } catch (error) {
          console.error('Error toggling car featured status:', error)
          return Response.json({ error: 'Failed to toggle featured status' }, { status: 500 })
        }
      },
    },
  },
})
