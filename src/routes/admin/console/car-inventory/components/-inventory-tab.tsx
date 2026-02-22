import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Edit, Images, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function InventoryTab() {
  const navigate = useNavigate()
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
    const car = allCars.find((c: { id: string; primaryImage?: string | null }) => c.id === carId)
    if (!isListed && !car?.primaryImage) {
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
    const car = allCars.find((c: { id: string; primaryImage?: string | null }) => c.id === carId)
    if (!isFeatured && !car?.primaryImage) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Car Inventory Management</h2>
          <p className="text-sm text-muted-foreground">Manage your car listings and inventory</p>
        </div>
        <Link
          to="/admin/console/car-inventory/add"
          className={buttonVariants({ size: 'lg', className: 'gap-2' })}
        >
          <Plus className="size-5" />
          Add New Car
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground">Loading cars...</div>
        ) : allCars.length > 0 ? (
          allCars.map((car: any) => (
            <Card key={car.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="shrink-0 w-32 h-24 bg-muted rounded-lg overflow-hidden">
                    {car.primaryImage ? (
                      <img
                        src={car.primaryImage}
                        alt={`${car.year} - ${car.sku}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {car.year} - {car.color}
                      </h3>
                      <div className="flex gap-2">
                        {car.sold && (
                          <span className="px-2 py-1 text-xs font-semibold bg-destructive/10 text-destructive rounded">
                            Sold
                          </span>
                        )}
                        {car.listed && !car.sold && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-500/10 text-green-700 rounded">
                            Listed
                          </span>
                        )}
                        {car.isFeatured && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-500/10 text-blue-700 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      SKU:{' '}
                      <span className="font-mono font-semibold text-sm">{car.sku}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-semibold">UGX {parseInt(car.price).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="font-semibold">{car.color}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={car.listed ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleListed(car.id, car.listed)}
                        className="gap-2"
                        disabled={car.sold}
                      >
                        {car.listed ? 'Unlist' : 'List'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(car.id, car.isFeatured)}
                        className="gap-2"
                        disabled={car.sold}
                      >
                        {car.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        variant={car.sold ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleSold(car.id, car.sold)}
                        className="gap-2"
                        disabled={car.sold}
                      >
                        {car.sold ? 'Sold' : 'Mark Sold'}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigate({
                            to: '/admin/console/car-inventory/$id/images',
                            params: { id: car.id },
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
                          if (car.sold) {
                            toast.error('Cannot edit a sold car')
                            return
                          }
                          navigate({
                            to: '/admin/console/car-inventory/$id',
                            params: { id: car.id },
                          })
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(car.id)}
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
          <div className="text-muted-foreground">No cars found</div>
        )}
      </div>
    </div>
  )
}
