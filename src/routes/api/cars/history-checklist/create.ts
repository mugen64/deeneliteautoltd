import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'

const isValidSvg = (value: string) => {
  const normalized = value.trim()
  return normalized.startsWith('<svg') && normalized.includes('</svg>')
}

export const Route = createFileRoute('/api/cars/history-checklist/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const description = typeof data?.description === 'string' ? data.description.trim() : ''
          const iconSvg = typeof data?.iconSvg === 'string' ? data.iconSvg.trim() : ''

          if (!description) {
            return Response.json({ error: 'Description is required' }, { status: 400 })
          }

          if (!iconSvg || !isValidSvg(iconSvg)) {
            return Response.json({ error: 'Icon must be valid SVG text' }, { status: 400 })
          }

          const displayIndex = await carStore.getNextHistoryChecklistDisplayIndex()

          const item = await carStore.createCarHistoryChecklist({
            description,
            iconSvg,
            displayIndex,
          })

          return Response.json({ item }, { status: 201 })
        } catch (error) {
          console.error('Error creating history checklist:', error)
          return Response.json({ error: 'Failed to create history checklist' }, { status: 500 })
        }
      },
    },
  },
})
