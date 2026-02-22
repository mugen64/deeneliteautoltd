import { carStore } from '@/server/storage/db/queries/cars'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/history-checklist/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await carStore.getCarHistoryChecklist()
          return Response.json({ items })
        } catch (error) {
          console.error('Error fetching history checklist:', error)
          return Response.json({ error: 'Failed to fetch history checklist' }, { status: 500 })
        }
      },
    },
  },
})
