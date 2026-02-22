import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@/server/session'
import { deleteCarPhoto } from '@/server/actions/carPhotos'

export const Route = createFileRoute('/api/cars/inventory/photos/$photoId')({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          await deleteCarPhoto(params.photoId)
          return Response.json({ success: true })
        } catch (error: any) {
          console.error('Error deleting car photo:', error)
          return Response.json(
            { error: error?.message || 'Failed to delete car photo' },
            { status: 500 }
          )
        }
      },
    },
  },
})
