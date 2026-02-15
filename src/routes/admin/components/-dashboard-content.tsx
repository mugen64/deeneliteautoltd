import { useAuth } from '@/contexts/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export function DashboardContent() {
  const { user } = useAuth()

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p >Welcome, {user?.name}</p>
      </div>
    </ProtectedRoute>
  )
}
