import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@/server/session'
import { analyticsStore } from '@/server/storage/db/queries/analytics'

export const Route = createFileRoute('/api/dashboard/analytics')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await useAppSession()
          if (!session.data.userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 })
          }

          const url = new URL(request.url)
          const daysParam = url.searchParams.get('days')
          const days = daysParam ? parseInt(daysParam, 10) : 30

          console.log(`[Analytics] Fetching stats for ${days} days`)

          const [pageViewStats, carViewStats] = await Promise.all([
            analyticsStore.getPageViewStats(days),
            analyticsStore.getCarViewStats(days),
          ])

          console.log(`[Analytics] Page views: ${pageViewStats.total}, Car views: ${carViewStats.total}`)

          return Response.json({
            pageViews: pageViewStats,
            carViews: carViewStats,
            days,
          })
        } catch (error) {
          console.error('Error fetching analytics:', error)
          return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 })
        }
      },
    },
  },
})
