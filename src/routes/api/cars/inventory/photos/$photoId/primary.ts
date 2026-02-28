import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@/server/session'
import { carPhotoStore } from '@/server/storage/db/queries/carPhotos'

export const Route = createFileRoute('/api/cars/inventory/photos/$photoId/primary')({
  server: {
    handlers: {
      PATCH: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const carPhoto = await carPhotoStore.getCarPhotoById(params.photoId)
          if (!carPhoto) {
            return Response.json({ error: 'Photo not found' }, { status: 404 })
          }

          await carPhotoStore.setPrimaryPhoto(carPhoto.carId, params.photoId)
          return Response.json({ success: true })
        } catch (error: any) {
          console.error('Error setting primary photo:', error)
          return Response.json(
            { error: error?.message || 'Failed to set primary photo' },
            { status: 500 }
          )
        }
      },
    },
  },
})
