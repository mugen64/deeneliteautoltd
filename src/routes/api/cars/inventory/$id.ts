import { carStore } from "@/server/storage/db/cars"
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const car = await carStore.getCarById(params.id)
          if (!car) {
            return json({ error: 'Car not found' }, { status: 404 })
          }
          return json(car)
        } catch (error) {
          console.error('Error fetching car:', error)
          return json({ error: 'Failed to fetch car' }, { status: 500 })
        }
      },
      PATCH: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const car = await carStore.updateCar(params.id, data)
          if (!car) {
            return json({ error: 'Car not found' }, { status: 404 })
          }
          return json(car)
        } catch (error) {
          console.error('Error updating car:', error)
          return json({ error: 'Failed to update car' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return json({ error: 'Not authenticated' }, { status: 401 })
          }

          const car = await carStore.deleteCar(params.id)
          if (!car) {
            return json({ error: 'Car not found' }, { status: 404 })
          }
          return json({ success: true, car })
        } catch (error) {
          console.error('Error deleting car:', error)
          return json({ error: 'Failed to delete car' }, { status: 500 })
        }
      },
    },
  },
})
