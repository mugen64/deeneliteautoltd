import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/console/user-management')({
  component: RouteComponent,
})

type User = {
  id: string
  email: string
  phone: string
  name: string
  role: string
  createdAt: string
  updatedAt: string | null
}

function RouteComponent() {
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      return data.users
    },
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage system users and their roles</p>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : usersData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(user.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No users found</div>
        )}
      </div>
    </div>
  )
}

