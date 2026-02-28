import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'
import { isHistoryIconName } from '@/lib/icon-names'

export const Route = createFileRoute('/api/cars/history-checklist/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const id = typeof data?.id === 'string' ? data.id.trim() : ''
          const description = typeof data?.description === 'string' ? data.description.trim() : ''
          const iconName = typeof data?.iconName === 'string' ? data.iconName.trim() : ''
          const displayIndex = data?.displayIndex

          if (!id) {
            return Response.json({ error: 'Checklist id is required' }, { status: 400 })
          }

          const updateData: { description?: string; iconSvg?: string; displayIndex?: number } = {}
          if (description) updateData.description = description
          if (iconName) {
            if (!isHistoryIconName(iconName)) {
              return Response.json({ error: 'Icon must be a supported icon name' }, { status: 400 })
            }
            updateData.iconSvg = iconName
          }
          if (Number.isFinite(Number(displayIndex))) {
            updateData.displayIndex = Number(displayIndex)
          }

          if (!Object.keys(updateData).length) {
            return Response.json({ error: 'No changes provided' }, { status: 400 })
          }

          const item = await carStore.updateCarHistoryChecklist(id, updateData)
          return Response.json({ item })
        } catch (error) {
          console.error('Error updating history checklist:', error)
          return Response.json({ error: 'Failed to update history checklist' }, { status: 500 })
        }
      },
    },
  },
})
