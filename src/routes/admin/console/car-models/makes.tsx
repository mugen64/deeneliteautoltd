import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/admin/console/car-models/makes')({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    }
  },
})

function RouteComponent() {
  const { id } = Route.useSearch()

  const { data: carMakeData, isLoading } = useQuery({
    queryKey: ['carMake', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided')
      const response = await fetch(`/api/cars/car-makes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch car make')
      }
      return response.json()
    },
    enabled: !!id,
  })

  const makeInfo = carMakeData?.car_makes
  const fileInfo = carMakeData?.files

  if (!id) {
    return (
      <div className="p-8">
        <p className="text-destructive">No make ID provided</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading make details...</p>
      </div>
    )
  }

  if (!carMakeData) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load make details</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/admin/console" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link to="/admin/console/car-models" search={{ active: 'makes' }} />}
              >
                Car Models
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>View Make</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">View Make</h1>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'makes' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Makes
          </Link>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{makeInfo?.name}</CardTitle>
            <CardDescription>Car Make Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Logo</h3>
              {fileInfo?.media_url && (
                <img
                  src={fileInfo.media_url}
                  alt={`${makeInfo?.name} logo`}
                  className="w-48 h-48 object-contain rounded border border-border"
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Make ID</h3>
              <p className="text-sm font-mono">{makeInfo?.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
              <p className="text-sm">
                {makeInfo?.createdAt
                  ? new Date(makeInfo.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
