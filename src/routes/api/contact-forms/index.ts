import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@/server/session'
import { contactFormsStore, type ContactFormStatus } from '@/server/storage/db/queries/contactForms'

export const Route = createFileRoute('/api/contact-forms/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()

          const firstName = body?.firstName?.trim()
          const lastName = body?.lastName?.trim()
          const email = body?.email?.trim()
          const phone = body?.phone?.trim()
          const subject = body?.subject?.trim()
          const message = body?.message?.trim()
          const interestedInVehicles = Boolean(body?.interestedInVehicles)
          const selectedCars = Array.isArray(body?.selectedCars) ? body.selectedCars.filter(Boolean) : []

          if (!firstName || !lastName || !email || !subject || !message) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
          }

          if (message.length < 10) {
            return Response.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
          }

          const created = await contactFormsStore.createContactForm({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message,
            interestedInVehicles,
            selectedCars,
          })

          return Response.json({ success: true, submission: created })
        } catch (error) {
          console.error('Error creating contact form submission:', error)
          return Response.json({ error: 'Failed to submit contact form' }, { status: 500 })
        }
      },

      GET: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const url = new URL(request.url)
          const statusParam = url.searchParams.get('status')
          const status = statusParam || undefined

          if (status && !contactFormsStore.isValidStatus(status)) {
            return Response.json({ error: 'Invalid status filter' }, { status: 400 })
          }

          const [forms, stats] = await Promise.all([
            contactFormsStore.getContactForms(status as ContactFormStatus | undefined),
            contactFormsStore.getContactFormStats(),
          ])

          return Response.json({ forms, stats })
        } catch (error) {
          console.error('Error fetching contact forms:', error)
          return Response.json({ error: 'Failed to fetch contact forms' }, { status: 500 })
        }
      },
    },
  },
})
