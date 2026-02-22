import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/console/car-inventory/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
