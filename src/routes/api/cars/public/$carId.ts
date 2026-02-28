import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

export const Route = createFileRoute('/api/cars/public/$carId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { carId } = params
          const car = await carStore.getPublicCarDetails(carId)
          
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          return Response.json(car)
        } catch (error) {
          console.error('Error fetching car details:', error)
          return Response.json({ error: 'Failed to fetch car details' }, { status: 500 })
        }
      },
    },
  },
})
