import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const car = await carStore.getCarById(params.id)
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }
          const featureIds = await carStore.getCarFeatureIdsByCar(params.id)
          const historyChecklistIds = await carStore.getCarHistoryIdsByCar(params.id)
          return Response.json({ ...car, featureIds, historyChecklistIds })
        } catch (error) {
          console.error('Error fetching car:', error)
          return Response.json({ error: 'Failed to fetch car' }, { status: 500 })
        }
      },
      PATCH: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()

          // Remove flag fields - these are managed via dedicated toggle endpoints
          // Remove features and history - these are managed via dedicated endpoints
          const { sold: _, isFeatured: __, listed: ___, featureIds: ____, historyChecklistIds: _____, ...updateData } = data

          // Fetch existing car
          const existingCar = await carStore.getCarById(params.id)
          if (!existingCar) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          // Prevent editing if car is sold
          if (existingCar.cars.sold) {
            return Response.json({ error: 'Cannot edit a sold car' }, { status: 400 })
          }

          // If color is being updated, fetch make, model, and body type for SKU regeneration
          if (updateData.color) {
            const model = await carStore.getCarModelById(existingCar.cars.modelId)
            const bodyType = await carStore.getCarBodyTypeById(existingCar.cars.bodyTypeId)

            if (model && bodyType) {
              const make = await carStore.getCarMakeById(model.car_models.makeId)
              if (make) {
                updateData.makeName = make.car_makes.name
                updateData.modelName = model.car_models.name
                updateData.bodyTypeName = bodyType.car_body_types.name
              }
            }
          }

          const car = await carStore.updateCar(params.id, updateData)
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }
          return Response.json(car)
        } catch (error) {
          console.error('Error updating car:', error)
          return Response.json({ error: 'Failed to update car' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const car = await carStore.deleteCar(params.id)
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }
          return Response.json({ success: true, car })
        } catch (error) {
          console.error('Error deleting car:', error)
          return Response.json({ error: 'Failed to delete car' }, { status: 500 })
        }
      },
    },
  },
})
