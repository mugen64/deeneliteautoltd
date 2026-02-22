import { carStore } from "@/server/storage/db/queries/cars"
import { fileStore } from "@/server/storage/db/queries/files"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/cars/inventory/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()

          if (!data.year || !data.makeId || !data.modelId || !data.price || !data.bodyType || data.mileage === undefined || !data.condition) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
          }

          let photoId = undefined
          if (data.photo?.public_id && data.photo?.secure_url) {
            const photoFile = await fileStore.saveFile({
              userId: session.data.userId,
              public_id: data.photo.public_id,
              media_url: data.photo.secure_url,
              resource_type: data.photo.resource_type,
              description: `Car photo: ${data.year} ${data.makeId}`,
            })
            photoId = photoFile.id
          }

          const car = await carStore.createCar({
            year: data.year,
            makeId: data.makeId,
            modelId: data.modelId,
            price: data.price,
            bodyType: data.bodyType,
            mileage: data.mileage,
            condition: data.condition,
            isFeatured: data.isFeatured || false,
            rating: data.rating,
            photoId,
          })

          return Response.json({ car }, { status: 201 })
        } catch (error) {
          console.error('Error creating car:', error)
          return Response.json({ error: 'Failed to create car' }, { status: 500 })
        }
      },
    },
  },
})
