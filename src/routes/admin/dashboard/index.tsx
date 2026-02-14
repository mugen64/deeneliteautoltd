import { createFileRoute } from '@tanstack/react-router'
import { verifySessionFn } from '@/server/auth'

export const Route = createFileRoute('/admin/dashboard/')({
  beforeLoad: async () => {
    // Verify session on server before loading component
    // This will redirect to /admin if not authenticated
    await verifySessionFn()
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/dashboard/"!</div>
}
