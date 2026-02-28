import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { 
  ChevronLeft, Calendar, Fuel, Gauge, MapPin, Phone, Car
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconPreview } from '@/components/IconPreview'
import { useState, useEffect } from 'react'
import { useSettings } from '@/contexts/settings'
import { trackCarView } from '@/lib/analytics'

type SimilarVehicle = {
  id: string
  year: number
  price: string
  mileage: number
  transmission: string
  fuelType: string
  bodyType: { name: string }
  make: { name: string; slug: string }
  model: { name: string; slug: string }
  primaryImage: string | null
}

type SimilarVehicleResponse = {
  data: SimilarVehicle[]
}

export const Route = createFileRoute('/cars/$makeSlug/$modelSlug/$id')({
  component: CarDetailsPage,
})

function CarDetailsPage() {
  const { id } = Route.useParams()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const { data: carDetails, isLoading, error } = useQuery<any>({
    queryKey: ['carDetails', id],
    queryFn: async () => {
      const response = await fetch(`/api/cars/public/${id}`)
      if (!response.ok) throw new Error('Failed to fetch car details')
      const data = await response.json()
      
      // Transform the response to match the expected structure
      return {
        car: {
          id: data.cars.id,
          sku: data.cars.sku,
          year: data.cars.year,
          price: data.cars.price,
          color: data.cars.color,
          transmission: data.cars.transmission,
          fuelType: data.cars.fuelType,
          mileage: data.cars.mileage,
          condition: data.cars.condition,
          isFeatured: data.cars.isFeatured,
        },
        make: {
          id: data.car_makes.id,
          name: data.car_makes.name,
          slug: data.car_makes.slug,
        },
        model: {
          id: data.car_models.id,
          name: data.car_models.name,
          slug: data.car_models.slug,
        },
        bodyType: {
          id: data.car_body_types.id,
          name: data.car_body_types.name,
        },
        photos: data.photos || [],
        features: data.features?.map((f: any) => ({ name: f.name, icon: f.icon })) || [],
        history: data.history || [],
      }
    },
  })

  const { data: similarVehiclesData, isLoading: isLoadingSimilarVehicles } = useQuery<SimilarVehicleResponse>({
    queryKey: ['similarVehicles', id, carDetails?.make?.id, carDetails?.bodyType?.id],
    enabled: !!carDetails?.make?.id && !!carDetails?.bodyType?.id,
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('makeIds', carDetails.make.id)
      params.set('bodyTypeIds', carDetails.bodyType.id)
      params.set('limit', '6')
      params.set('page', '1')
      params.set('sortBy', 'year_desc')

      const response = await fetch(`/api/cars/public/listings?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch similar vehicles')
      return response.json()
    },
  })

  const similarVehicles = (similarVehiclesData?.data ?? [])
    .filter((vehicle) => vehicle.id !== id)
    .slice(0, 3)

  // Set selected photo to primary when data loads
  useEffect(() => {
    if (carDetails?.photos) {
      const primaryIndex = carDetails.photos.findIndex((p: any) => p.isPrimary)
      setSelectedPhotoIndex(primaryIndex >= 0 ? primaryIndex : 0)
    }
  }, [carDetails])

  // Track car view (non-intrusive, fails silently)
  useEffect(() => {
    if (carDetails?.car?.id) {
      // Track in next tick to avoid blocking render
      setTimeout(() => {
        trackCarView(carDetails.car.id)
      }, 0)
    }
  }, [carDetails?.car?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !carDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Car not found</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Listings
        </Button>
      </div>
    )
  }

  const { car, make, model, bodyType, photos, features, history } = carDetails
  const selectedPhoto = photos?.[selectedPhotoIndex]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Back to Listings
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="outline">Call Dealer</Button>
            <Button>View Inventory</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Images Section */}
          <div className="md:col-span-2">
            {/* Primary Image */}
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted mb-3">
              {selectedPhoto?.url ? (
                <img
                  src={selectedPhoto.url}
                  alt={`${make.name} ${model.name}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Car className="size-24 text-muted-foreground" />
                </div>
              )}
              {car.isFeatured && (
                <Badge className="absolute top-4 left-4">Featured</Badge>
              )}
              <button 
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background"
                aria-label="Save listing"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
                  />
                </svg>
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {photos && photos.length > 1 && (
              <div className="grid grid-cols-6 gap-2 mb-6">
                {photos.map((photo: any, idx: number) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedPhotoIndex === idx
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`View ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title and Price Section */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h1 className="text-lg font-bold mb-2">
                    {car.year} {make.name} {model.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span className="text-sm">Kampala, Uganda</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold mb-2">
                    UGX {Number(car.price).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {bodyType.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Year</p>
                </div>
                <p className="font-semibold text-sm">{car.year}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="size-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Mileage</p>
                </div>
                <p className="font-semibold text-sm">{car.mileage.toLocaleString()} km</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="size-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Fuel Type</p>
                </div>
                <p className="font-semibold text-sm">{car.fuelType}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <p className="text-xs text-muted-foreground font-medium">Transmission</p>
                </div>
                <p className="font-semibold text-sm">{car.transmission}</p>
              </div>
            </div>

            {/* Details Tabs */}
            <div className="mt-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This {car.year} {make.name} {model.name} {bodyType.name.toLowerCase()} features {car.transmission} transmission and runs on {car.fuelType}. With {car.mileage.toLocaleString()} km on the odometer, this vehicle is in {car.condition} condition and is available in a stunning {car.color} color. Located in Kampala, Uganda, this reliable {make.name} is ready for its next owner.
                    </p>
                  </div>
                </TabsContent>

                {/* Technical Specifications Tab */}
                <TabsContent value="specifications" className="mt-4">
                  <div>
                    <h3 className="font-semibold mb-4">Technical Specifications</h3>
                    <div className="space-y-4">
                      {/* Row 1 */}
                      <div className="grid grid-cols-3 gap-6 pb-4 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Make</p>
                          <p className="font-semibold text-sm">{make.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Model</p>
                          <p className="font-semibold text-sm">{model.name}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-3 gap-6 pb-4 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Year</p>
                          <p className="font-semibold text-sm">{car.year}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Body Type</p>
                          <p className="font-semibold text-sm">{bodyType.name}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-3 gap-6 pb-4 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Condition</p>
                          <p className="font-semibold text-sm capitalize">{car.condition}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Mileage</p>
                          <p className="font-semibold text-sm">{car.mileage.toLocaleString()} km</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 4 */}
                      <div className="grid grid-cols-3 gap-6 pb-4 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Transmission</p>
                          <p className="font-semibold text-sm">{car.transmission}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Fuel Type</p>
                          <p className="font-semibold text-sm">{car.fuelType}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 5 */}
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Color</p>
                          <p className="font-semibold text-sm">{car.color}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Location</p>
                          <p className="font-semibold text-sm">Kampala, Uganda</p>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="mt-4">
                  <div>
                    <h3 className="font-semibold mb-4">Key Features</h3>
                    {features && features.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {features.map((feature: any, index: number) => (
                          <div key={`${feature.name ?? feature}-${index}`} className="flex items-center gap-2">
                            <IconPreview
                              name={feature.icon ?? 'CheckCircle2'}
                              className="size-4 text-primary shrink-0"
                            />
                            <span className="text-sm leading-none">{feature.name ?? feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No features listed</p>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-4">
                  <div>
                    <h3 className="font-semibold mb-4">Vehicle History</h3>
                    {history && history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2 pb-3 border-b border-border last:border-b-0">
                            <IconPreview name={item.iconSvg} className="size-4 text-primary shrink-0" />
                            <div>
                              <p className="font-semibold text-sm leading-none">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No history items available</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* Contact Card */}
            <Card className="sticky top-20">
              <CardContent className="pt-5 space-y-3">
                <ContactDealerCard />
              </CardContent>
            </Card>

            {/* VIN Card */}
            <Card>
              <CardContent className="pt-5 space-y-2">
                <h3 className="font-semibold text-sm">Vehicle Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">SKU</p>
                    <p className="font-mono text-sm font-semibold">{car.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Color</p>
                    <p className="font-semibold">{car.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Condition</p>
                    <Badge
                      className={
                        car.condition === 'new'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs'
                      }
                    >
                      {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Dealership */}
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-semibold text-sm mb-2">About Deen Elite Auto Ltd</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your trusted car dealership in Uganda. We offer quality vehicles and transparent pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Similar Vehicles</h2>
          </div>

          {isLoadingSimilarVehicles ? (
            <p className="text-sm text-muted-foreground">Loading similar vehicles...</p>
          ) : similarVehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No similar vehicles available right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarVehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  to="/cars/$makeSlug/$modelSlug/$id"
                  params={{
                    makeSlug: vehicle.make.slug,
                    modelSlug: vehicle.model.slug,
                    id: vehicle.id,
                  }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full transition-colors group-hover:border-primary/60">
                    <div className="aspect-4/3 bg-muted">
                      {vehicle.primaryImage ? (
                        <img
                          src={vehicle.primaryImage}
                          alt={`${vehicle.year} ${vehicle.make.name} ${vehicle.model.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="size-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4 space-y-2">
                      <h3 className="font-semibold text-sm leading-tight">
                        {vehicle.year} {vehicle.make.name} {vehicle.model.name}
                      </h3>
                      <p className="text-sm font-bold">UGX {Number(vehicle.price).toLocaleString()}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{vehicle.mileage.toLocaleString()} km</span>
                        <span>{vehicle.fuelType}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ContactDealerCard() {
  const { settings } = useSettings()
  const companyName = settings?.companyName || 'Deen Elite Auto Ltd'
  const phoneNumber = settings?.phoneNumber || '+256 993523948'
  const address = settings?.address || 'Kampala, Uganda'

  // Clean phone number for tel: link (remove spaces and special chars except +)
  const telNumber = phoneNumber.replace(/[\s\-()]/g, '')

  // Build Google Maps query
  const mapsQuery = `${companyName} ${address}`.replace(/\s+/g, '+')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <>
      <div>
        <h3 className="font-semibold mb-2">Contact Dealer</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Interested in this vehicle? Get in touch with {companyName} today.
        </p>
      </div>

      <a href={`tel:${telNumber}`} className="w-full inline-block">
        <Button className="w-full">
          <Phone className="mr-2 size-4" />
          Call Now
        </Button>
      </a>

      <a 
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-block"
      >
        <Button variant="outline" className="w-full">
          <MapPin className="mr-2 size-4" />
          Visit Showroom
        </Button>
      </a>

      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <Phone className="size-3 text-muted-foreground" />
          <span>{phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="size-3 text-muted-foreground" />
          <span>{address}</span>
        </div>
      </div>
    </>
  )
}
