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
import { Plus, Edit, Trash2, Images } from 'lucide-react'
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


  const handleToggleListed = async (carId: string, isListed: boolean) => {
    // Check if car has a primary image
    const carRows = allCars.filter((c: { cars: { id: string }; car_photos?: { isPrimary?: boolean } | null }) => c.cars.id === carId)
    const hasPrimaryImage = carRows.some((row: { car_photos?: { isPrimary?: boolean } | null }) => row.car_photos?.isPrimary)
    if (!isListed && !hasPrimaryImage) {
      toast.error('Cannot list a car without a primary image. Please set a primary image first.')
      return
    }

    if (!confirm(`${isListed ? 'Unlist' : 'List'} this car? This action will ${isListed ? 'hide' : 'show'} the car from listings.`)) {
      return
    }

    try {
      const response = await fetch('/api/cars/inventory/toggle-listed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update car')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success(`Car ${isListed ? 'unlisted' : 'listed'} successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update car'
      toast.error(message)
    }
  }

  const handleToggleFeatured = async (carId: string, isFeatured: boolean) => {
    // Check if car has images
    const car = allCars.find((c: {cars: {id: string}, files: any[]}) => c.cars.id === carId)
    if (!isFeatured && (!car?.files || car.files.length === 0)) {
      toast.error('Cannot feature a car without images. Please add images first.')
      return
    }

    if (!confirm(`${isFeatured ? 'Unfeature' : 'Feature'} this car?`)) {
      return
    }

    try {
      const response = await fetch('/api/cars/inventory/toggle-featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update car')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success(`Car ${isFeatured ? 'unfeatured' : 'featured'} successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update car'
      toast.error(message)
    }
  }

  const handleToggleSold = async (carId: string, isSold: boolean) => {
    if (isSold) {
      toast.error('This car is already marked as sold and cannot be unmarked.')
      return
    }

    if (!confirm('Mark this car as sold? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/cars/inventory/toggle-sold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update car')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Car marked as sold successfully')
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
                    </div>
                    <p className="text-sm text-muted-foreground">SKU: <span className="font-mono font-semibold text-sm">{car.cars.sku}</span></p>

                    <div className="grid grid-cols-5 gap-6 pt-2">
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
                      <div>
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="font-semibold">{car.cars.color}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 pt-2">

                      <div>
                        <p className="text-xs text-muted-foreground">Transmission</p>
                        <p className="font-semibold">{car.cars.transmission}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fuel</p>
                        <p className="font-semibold">{car.cars.fuelType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className={`font-semibold ${car.cars.sold ? 'text-destructive' : 'text-green-600'}`}>
                          {car.cars.sold ? 'Sold' : 'Available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={car.cars.listed ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleListed(car.cars.id, car.cars.listed)}
                        className="gap-2"
                        disabled={car.cars.sold}
                      >
                        {car.cars.listed ? 'Unlist' : 'List'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(car.cars.id, car.cars.isFeatured)}
                        className="gap-2"
                        disabled={car.cars.sold}
                      >
                        {car.cars.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        variant={car.cars.sold ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleSold(car.cars.id, car.cars.sold)}
                        className="gap-2"
                        disabled={car.cars.sold}
                      >
                        {car.cars.sold ? 'Sold' : 'Mark Sold'}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigate({
                            to: '/admin/console/car-inventory/$id/images',
                            params: { id: car.cars.id },
                          })
                        }}
                        title="Manage images"
                      >
                        <Images className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (car.cars.sold) {
                            toast.error('Cannot edit a sold car')
                            return
                          }
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
