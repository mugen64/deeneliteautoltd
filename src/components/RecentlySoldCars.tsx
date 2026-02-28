import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

interface RecentlySoldCar {
  id: string
  year: number
  price: string
  color: string
  mileage: number
  transmission: string
  fuelType: string
  condition: string
  createdAt: string
  modelId: string
  modelName: string
  modelSlug: string
  makeName: string
  makeSlug: string
  bodyTypeName: string
  bodyTypeSlug: string
  primaryPhoto: {
    url: string
    publicId: string
  } | null
}

export function RecentlySoldCars() {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['recently-sold-cars'],
    queryFn: async () => {
      const response = await fetch('/api/cars/public/recently-sold')
      if (!response.ok) throw new Error('Failed to fetch recently sold cars')
      return response.json() as Promise<RecentlySoldCar[]>
    },
  })

  if (isLoading) {
    return (
      <div className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">Recently Sold</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg animate-pulse overflow-hidden">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-4">Recently Sold</h2>
          <p className="text-muted-foreground">No cars have been sold yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground mb-8">Recently Sold</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cars.map((car) => (
            <Link
              key={car.id}
              to="/cars/$makeSlug/$modelSlug/$id"
              params={{
                makeSlug: car.makeSlug,
                modelSlug: car.modelSlug,
                id: car.id,
              }}
              className="bg-card border border-border rounded-lg transition-shadow overflow-hidden group hover:border-primary/50"
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                {car.primaryPhoto ? (
                  <img
                    src={car.primaryPhoto.url}
                    alt={`${car.year} ${car.makeName} ${car.modelName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary">
                  {car.year} {car.makeName} {car.modelName}
                </h3>
                <p className="text-primary font-bold text-lg mt-2">
                  £{parseFloat(car.price).toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs mt-1">{car.color}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
                  <span>{car.mileage.toLocaleString()} miles</span>
                  <span>•</span>
                  <span>{car.transmission}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
