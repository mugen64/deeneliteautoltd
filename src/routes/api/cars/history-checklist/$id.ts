import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/history-checklist/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const item = await carStore.getCarHistoryChecklistById(params.id)
          if (!item) {
            return Response.json({ error: 'Checklist item not found' }, { status: 404 })
          }
          return Response.json({ item })
        } catch (error) {
          console.error('Error fetching history checklist:', error)
          return Response.json({ error: 'Failed to fetch history checklist' }, { status: 500 })
        }
      },
      DELETE: async ({ params }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const item = await carStore.deleteCarHistoryChecklist(params.id)
          if (!item) {
            return Response.json({ error: 'Checklist item not found' }, { status: 404 })
          }
          return Response.json({ success: true })
        } catch (error) {
          console.error('Error deleting history checklist:', error)
          return Response.json({ error: 'Failed to delete history checklist' }, { status: 500 })
        }
      },
    },
  },
})
