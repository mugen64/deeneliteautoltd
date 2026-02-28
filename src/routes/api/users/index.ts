import { userStore } from "@/server/storage/db/queries/users"
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session"

export const Route = createFileRoute('/api/users/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const users = await userStore.getAllUsers()
          return Response.json({ users })
        } catch (error) {
          console.error('Error fetching users:', error)
          return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
        }
      },
    },
  },
})
