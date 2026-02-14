import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth'
import { checkUsersExistFn } from '@/server/auth'
import { RegistrationForm } from './components/RegistrationForm'
import { LoginForm } from './components/LoginForm'
import { DashboardContent } from './components/DashboardContent'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const [usersExist, setUsersExist] = useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkUsersExist = useServerFn(checkUsersExistFn)

  useEffect(() => {
    const check = async () => {
      try {
        const result = await checkUsersExist()
        setUsersExist(result.exists)
        setAdminEmail(result.adminEmail)
      } catch (error) {
        console.error('Error checking users:', error)
      } finally {
        setIsLoading(false)
      }
    }
    check()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show dashboard if authenticated
  if (user) {
    return <DashboardContent />
  }

  // Show registration form if no users exist
  if (!usersExist && adminEmail) {
    return <RegistrationForm adminEmail={adminEmail} />
  }

  // Show login form if users exist
  if (usersExist) {
    return <LoginForm />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="p-8">
          <p className="text-red-600">Unable to determine admin status</p>
        </CardContent>
      </Card>
    </div>
  )
}
