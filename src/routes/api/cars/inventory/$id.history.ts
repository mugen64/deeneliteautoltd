import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/$id/history')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const { historyChecklistIds } = data

          if (!Array.isArray(historyChecklistIds)) {
            return Response.json({ error: 'historyChecklistIds must be an array' }, { status: 400 })
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

          // Update car history checklist
          await carStore.setCarHistoryChecklist(params.id, historyChecklistIds)

          // Fetch updated car with history
          const car = await carStore.getCarById(params.id)
          const updatedHistoryIds = await carStore.getCarHistoryIdsByCar(params.id)
          
          return Response.json({ ...car, historyChecklistIds: updatedHistoryIds })
        } catch (error) {
          console.error('Error updating car history checklist:', error)
          return Response.json({ error: 'Failed to update car history checklist' }, { status: 500 })
        }
      },
    },
  },
})
