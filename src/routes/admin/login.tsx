import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { checkUsersExistFn } from '@/server/auth'
import { RegistrationForm } from './components/-registration-form'
import { LoginForm } from './components/-login-form'

export const Route = createFileRoute('/admin/login')({
  loader: async () => {
    return await checkUsersExistFn()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { exists, adminEmail } = Route.useLoaderData() as Awaited<ReturnType<typeof checkUsersExistFn>>


  if (!exists && adminEmail) {
    return <RegistrationForm adminEmail={adminEmail} />
  }

  if (exists) {
    return <LoginForm />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="p-8">
          <p className="text-red-600">Unable to determine admin status. Refresh page if the problem persists.</p>
        </CardContent>
      </Card>
    </div>
  )
}
