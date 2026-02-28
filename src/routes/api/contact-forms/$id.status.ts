import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@/server/session'
import { contactFormsStore } from '@/server/storage/db/queries/contactForms'

export const Route = createFileRoute('/api/contact-forms/$id/status')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const body = await request.json()
          const status = body?.status

          if (!status || !contactFormsStore.isValidStatus(status)) {
            return Response.json({ error: 'Invalid status' }, { status: 400 })
          }

          const updated = await contactFormsStore.updateContactFormStatus(params.id, status)
          if (!updated) {
            return Response.json({ error: 'Contact form not found' }, { status: 404 })
          }

          return Response.json({ success: true, form: updated })
        } catch (error) {
          console.error('Error updating contact form status:', error)
          return Response.json({ error: 'Failed to update contact form status' }, { status: 500 })
        }
      },
    },
  },
})
