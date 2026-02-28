import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    const user = (context as { user: any }).user
    if (user && location.pathname === '/admin') {
        throw redirect({ to: '/admin/console' })
    }
    return { user }
  },
});
