import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/console/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
    </div>
  )
}
