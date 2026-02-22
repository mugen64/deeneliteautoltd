import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'
import { isFeatureIconName } from '@/lib/icon-names'

export const Route = createFileRoute('/api/cars/features/update')({
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
          const name = typeof data?.name === 'string' ? data.name.trim() : ''
          const iconName = typeof data?.iconName === 'string' ? data.iconName.trim() : ''

          if (!id) {
            return Response.json({ error: 'Feature id is required' }, { status: 400 })
          }

          const updateData: { name?: string; icon?: string } = {}
          if (name) updateData.name = name
          if (iconName) {
            if (!isFeatureIconName(iconName)) {
              return Response.json({ error: 'Icon must be a supported icon name' }, { status: 400 })
            }
            updateData.icon = iconName
          }

          if (!Object.keys(updateData).length) {
            return Response.json({ error: 'No changes provided' }, { status: 400 })
          }

          const feature = await carStore.updateCarFeatureType(id, updateData)
          return Response.json({ feature })
        } catch (error) {
          console.error('Error updating car feature:', error)
          return Response.json({ error: 'Failed to update car feature' }, { status: 500 })
        }
      },
    },
  },
})
