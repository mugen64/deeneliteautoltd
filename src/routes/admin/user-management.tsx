import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/user-management')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
    </div>
  )
}
