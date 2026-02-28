import { carStore } from '@/server/storage/db/queries/cars'
import { carPhotoStore } from '@/server/storage/db/queries/carPhotos'
import { fileStore } from '@/server/storage/db/queries/files'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/inventory/$id/photos')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const photos = await carStore.getCarPhotos(params.id)
          return Response.json({ photos })
        } catch (error) {
          console.error('Error fetching car photos:', error)
          return Response.json({ error: 'Failed to fetch car photos' }, { status: 500 })
        }
      },
      POST: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const { public_id, secure_url, resource_type, description } = data || {}
          const normalizedDescription = typeof description === 'string'
            ? description.trim()
            : ''

          if (!public_id || !secure_url || !resource_type) {
            return Response.json({ error: 'Missing image data' }, { status: 400 })
          }

          if (!normalizedDescription) {
            return Response.json({ error: 'Description is required' }, { status: 400 })
          }

          const photoFile = await fileStore.saveFile({
            userId: session.data.userId,
            public_id,
            media_url: secure_url,
            resource_type,
            description: normalizedDescription,
          })

          const carPhoto = await carPhotoStore.createCarPhoto({
            carId: params.id,
            photoId: photoFile.id,
            description: normalizedDescription,
            isPrimary: false,
          })

          return Response.json({ carPhoto })
        } catch (error: any) {
          console.error('Error saving car photo:', error)
          return Response.json(
            { error: error?.message || 'Failed to save car photo' },
            { status: 500 }
          )
        }
      },
    },
  },
})
