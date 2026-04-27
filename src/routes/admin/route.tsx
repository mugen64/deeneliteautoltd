import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow, noarchive',
      },
      {
        name: 'googlebot',
        content: 'noindex, nofollow, noarchive',
      },
    ],
  }),
  beforeLoad: async ({ context, location }) => {
    const user = (context as { user: any }).user
    if (user && location.pathname === '/admin') {
        throw redirect({ to: '/admin/console' })
    }
    return { user }
  },
});
