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

          // Validate required fields and collect missing ones
          const missingFields: string[] = []
          if (!data.year) missingFields.push('year')
          if (!data.modelId) missingFields.push('modelId')
          if (!data.price) missingFields.push('price')
          if (!data.bodyTypeId) missingFields.push('bodyTypeId')
          if (data.mileage === undefined) missingFields.push('mileage')
          if (!data.condition) missingFields.push('condition')
          if (!data.color) missingFields.push('color')
          if (!data.transmission) missingFields.push('transmission')
          if (!data.fuelType) missingFields.push('fuelType')

          if (missingFields.length > 0) {
            return Response.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 })
          }

          // Car cannot be featured if sold
          if (data.isFeatured) {
            return Response.json({ error: 'Use the feature toggle endpoint to feature cars after creation' }, { status: 400 })
          }

          // Fetch model and body type data for SKU generation
          const model = await carStore.getCarModelById(data.modelId)
          const bodyType = await carStore.getCarBodyTypeById(data.bodyTypeId)

          if (!model || !bodyType) {
            return Response.json({ error: 'Invalid model or body type' }, { status: 400 })
          }

          // Get make name from model's make
          const make = await carStore.getCarMakeById(model.car_models.makeId)

          const photos = []
          if (data.photos && Array.isArray(data.photos)) {
            for (const photo of data.photos) {
              if (photo.public_id && photo.secure_url) {
                const photoFile = await fileStore.saveFile({
                  userId: session.data.userId,
                  public_id: photo.public_id,
                  media_url: photo.secure_url,
                  resource_type: photo.resource_type,
                  description: photo.description || `Car photo: ${data.year} ${data.makeId}`,
                })
                photos.push({
                  photoId: photoFile.id,
                  description: photo.description,
                  isPrimary: photos.length === 0, // First photo is primary
                })
              }
            }
          }

          const car = await carStore.createCar({
            year: data.year,
            modelId: data.modelId,
            makeName: make.car_makes.name,
            modelName: model.car_models.name,
            bodyTypeId: data.bodyTypeId,
            bodyTypeName: bodyType.car_body_types.name,
            price: data.price,
            color: data.color,
            transmission: data.transmission,
            fuelType: data.fuelType,
            mileage: data.mileage,
            condition: data.condition,
            photos,
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
