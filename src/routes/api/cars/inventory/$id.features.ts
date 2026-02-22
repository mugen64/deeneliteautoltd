import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/$id/features')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const { featureIds } = data

          if (!Array.isArray(featureIds)) {
            return Response.json({ error: 'featureIds must be an array' }, { status: 400 })
          }

          // Fetch existing car
          const existingCar = await carStore.getCarById(params.id)
          if (!existingCar) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          // Prevent editing if car is sold
          if (existingCar.cars.sold) {
            return Response.json({ error: 'Cannot edit a sold car' }, { status: 400 })
          }

          // Update car features
          await carStore.setCarFeatures(params.id, featureIds)

          // Fetch updated car with features
          const car = await carStore.getCarById(params.id)
          const updatedFeatureIds = await carStore.getCarFeatureIdsByCar(params.id)
          
          return Response.json({ ...car, featureIds: updatedFeatureIds })
        } catch (error) {
          console.error('Error updating car features:', error)
          return Response.json({ error: 'Failed to update car features' }, { status: 500 })
        }
      },
    },
  },
})
