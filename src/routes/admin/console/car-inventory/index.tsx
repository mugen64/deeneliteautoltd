import { buttonVariants, Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
export const Route = createFileRoute('/admin/console/car-inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const { data: allCars = [], isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const response = await fetch('/api/cars/inventory')
      if (!response.ok) {
        throw new Error('Failed to fetch cars')
      }
      const data = await response.json()
      return data.cars
    },
  })


  const handleToggleFeatured = async (carId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/cars/inventory/${carId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFeatured: !isFeatured,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update car')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success(`Car ${!isFeatured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update car'
      toast.error(message)
    }
  }

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) {
      return
    }

    try {
      const response = await fetch(`/api/cars/inventory/${carId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete car')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Car deleted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete car'
      toast.error(message)
    }
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
              <BreadcrumbPage>Car Inventory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Car Inventory Management</h1>
            <p className="text-muted-foreground">Manage your car listings and inventory</p>
          </div>
          <Link
            to="/admin/console/car-inventory/add"
            className={buttonVariants({ size: 'lg', className: 'gap-2' })}
          >
            <Plus className="size-5" />
            Add New Car
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground">Loading cars...</div>
        ) : allCars.length > 0 ? (
          allCars.map((car: any) => (
            <Card key={car.cars.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Car Image */}
                    <div className="shrink-0 w-32 h-24 bg-muted rounded-lg overflow-hidden">
                    {car.files?.media_url ? (
                      <img
                        src={car.files.media_url}
                        alt={`${car.cars.year} ${car.car_makes.name} ${car.car_models.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {car.cars.year} {car.car_makes.name} {car.car_models.name}
                      </h3>
                      {car.cars.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{car.cars.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {car.cars.id}</p>

                    <div className="grid grid-cols-4 gap-6 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-semibold">UGX {parseInt(car.cars.price).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Body Type</p>
                        <p className="font-semibold">{car.cars.bodyType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mileage</p>
                        <p className="font-semibold">{car.cars.mileage.toLocaleString()} mi</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Condition</p>
                        <p className="font-semibold">{car.cars.condition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(car.cars.id, car.cars.isFeatured)}
                        className="gap-2"
                      >
                        {car.cars.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigate({
                            to: '/admin/console/car-inventory/$id',
                            params: { id: car.cars.id },
                          })
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(car.cars.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cars found. Start by adding a new car.</p>
          </div>
        )}
      </div>
    </div>
  )
}
