import { carStore } from "@/server/storage/db/queries/cars"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/toggle-sold')({
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
          const soldAmount = typeof data.soldAmount === 'string' ? data.soldAmount : undefined
          const soldCustomerDetails = data.soldCustomerDetails && typeof data.soldCustomerDetails === 'object'
            ? {
                name: typeof data.soldCustomerDetails.name === 'string' ? data.soldCustomerDetails.name : undefined,
                email: typeof data.soldCustomerDetails.email === 'string' ? data.soldCustomerDetails.email : undefined,
                phone: typeof data.soldCustomerDetails.phone === 'string' ? data.soldCustomerDetails.phone : undefined,
              }
            : undefined

          if (!carId) {
            return Response.json({ error: 'Car ID is required' }, { status: 400 })
          }

          if (soldAmount && Number.isNaN(Number(soldAmount))) {
            return Response.json({ error: 'Sold amount must be a valid number' }, { status: 400 })
          }

          if (soldCustomerDetails?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(soldCustomerDetails.email.trim())) {
            return Response.json({ error: 'Customer email is invalid' }, { status: 400 })
          }

          const car = await carStore.toggleCarSold(carId, {
            soldAmount,
            soldCustomerDetails,
          })
          if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
          }

          return Response.json(car)
        } catch (error) {
          console.error('Error toggling car sold status:', error)
          return Response.json({ error: 'Failed to toggle sold status' }, { status: 500 })
        }
      },
    },
  },
})
