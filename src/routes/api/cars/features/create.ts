import { carStore } from '@/server/storage/db/queries/cars'
import { useAppSession } from '@/server/session'
import { createFileRoute } from '@tanstack/react-router'
import { isFeatureIconName } from '@/lib/icon-names'

export const Route = createFileRoute('/api/cars/features/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const data = await request.json()
          const name = typeof data?.name === 'string' ? data.name.trim() : ''
          const iconName = typeof data?.iconName === 'string' ? data.iconName.trim() : ''

          if (!name) {
            return Response.json({ error: 'Name is required' }, { status: 400 })
          }

          if (!iconName || !isFeatureIconName(iconName)) {
            return Response.json({ error: 'Icon must be a supported icon name' }, { status: 400 })
          }

          const feature = await carStore.createCarFeatureType({ name, icon: iconName })
          return Response.json({ feature }, { status: 201 })
        } catch (error) {
          console.error('Error creating car feature:', error)
          return Response.json({ error: 'Failed to create car feature' }, { status: 500 })
        }
      },
    },
  },
})
