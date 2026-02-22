import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/console/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </div>
  )
}
