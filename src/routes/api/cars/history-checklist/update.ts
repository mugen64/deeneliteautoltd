import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'

const isValidSvg = (value: string) => {
  const normalized = value.trim()
  return normalized.startsWith('<svg') && normalized.includes('</svg>')
}

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
          const iconSvg = typeof data?.iconSvg === 'string' ? data.iconSvg.trim() : ''
          const displayIndex = data?.displayIndex

          if (!id) {
            return Response.json({ error: 'Checklist id is required' }, { status: 400 })
          }

          const updateData: { description?: string; iconSvg?: string; displayIndex?: number } = {}
          if (description) updateData.description = description
          if (iconSvg) {
            if (!isValidSvg(iconSvg)) {
              return Response.json({ error: 'Icon must be valid SVG text' }, { status: 400 })
            }
            updateData.iconSvg = iconSvg
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
