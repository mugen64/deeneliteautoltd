import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/auth'

type ProtectedRouteProps = {
  children: ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page</p>
          <a href="/admin" className="text-blue-600 hover:underline">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Forbidden</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page</p>
          <a href="/" className="text-blue-600 hover:underline">
            Go home
          </a>
        </div>
      </div>
    )
  }

  return children
}
