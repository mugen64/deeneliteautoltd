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
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recently Sold</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
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
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recently Sold</h2>
          <p className="text-gray-600">No cars have been sold yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Recently Sold</h2>
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
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="relative h-48 bg-gray-300 overflow-hidden">
                {car.primaryPhoto ? (
                  <img
                    src={car.primaryPhoto.url}
                    alt={`${car.year} ${car.makeName} ${car.modelName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600">
                  {car.year} {car.makeName} {car.modelName}
                </h3>
                <p className="text-blue-600 font-bold text-lg mt-2">
                  £{parseFloat(car.price).toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs mt-1">{car.color}</p>
                <div className="flex items-center gap-2 text-gray-600 text-xs mt-2">
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
