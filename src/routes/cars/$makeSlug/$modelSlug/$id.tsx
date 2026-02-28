import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { 
  ChevronLeft, Calendar, Fuel, Gauge, MapPin, Phone, Car
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconPreview } from '@/components/IconPreview'
import { useState } from 'react'

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
  const primaryPhoto = photos?.find((p: any) => p.isPrimary) || photos?.[0]

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="md:col-span-2">
            {/* Primary Image */}
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted mb-4">
              {primaryPhoto?.url ? (
                <img
                  src={primaryPhoto.url}
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
              <div className="grid grid-cols-4 gap-2 mb-8">
                {photos.map((photo: any, idx: number) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
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
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-lg font-bold mb-3">
                    {car.year} {make.name} {model.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-5" />
                    <span className="text-lg">Kampala, Uganda</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold mb-3">
                    UGX {Number(car.price).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    {bodyType.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Year</p>
                </div>
                <p className="font-semibold">{car.year}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Mileage</p>
                </div>
                <p className="font-semibold">{car.mileage.toLocaleString()} km</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Fuel className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">Fuel Type</p>
                </div>
                <p className="font-semibold">{car.fuelType}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="size-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <p className="text-sm text-muted-foreground font-medium">Transmission</p>
                </div>
                <p className="font-semibold">{car.transmission}</p>
              </div>
            </div>

            {/* Details Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      This {car.year} {make.name} {model.name} {bodyType.name.toLowerCase()} features {car.transmission} transmission and runs on {car.fuelType}. With {car.mileage.toLocaleString()} km on the odometer, this vehicle is in {car.condition} condition and is available in a stunning {car.color} color. Located in Kampala, Uganda, this reliable {make.name} is ready for its next owner.
                    </p>
                  </div>
                </TabsContent>

                {/* Technical Specifications Tab */}
                <TabsContent value="specifications" className="mt-6">
                  <div>
                    <h3 className="font-semibold mb-8">Technical Specifications</h3>
                    <div className="space-y-6">
                      {/* Row 1 */}
                      <div className="grid grid-cols-3 gap-8 pb-6 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Make</p>
                          <p className="font-semibold text-lg">{make.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Model</p>
                          <p className="font-semibold text-lg">{model.name}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-3 gap-8 pb-6 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Year</p>
                          <p className="font-semibold text-lg">{car.year}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Body Type</p>
                          <p className="font-semibold text-lg">{bodyType.name}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-3 gap-8 pb-6 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Condition</p>
                          <p className="font-semibold text-lg capitalize">{car.condition}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Mileage</p>
                          <p className="font-semibold text-lg">{car.mileage.toLocaleString()} km</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 4 */}
                      <div className="grid grid-cols-3 gap-8 pb-6 border-b border-border">
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Transmission</p>
                          <p className="font-semibold text-lg">{car.transmission}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Fuel Type</p>
                          <p className="font-semibold text-lg">{car.fuelType}</p>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 5 */}
                      <div className="grid grid-cols-3 gap-8">
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Color</p>
                          <p className="font-semibold text-lg">{car.color}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Location</p>
                          <p className="font-semibold text-lg">Kampala, Uganda</p>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="mt-6">
                  <div>
                    <h3 className="font-semibold mb-8">Key Features</h3>
                    {features && features.length > 0 ? (
                      <div className="grid grid-cols-2 gap-8">
                        {features.map((feature: any, index: number) => (
                          <div key={`${feature.name ?? feature}-${index}`} className="flex items-center gap-3">
                            <IconPreview
                              name={feature.icon ?? 'CheckCircle2'}
                              className="size-5 text-primary shrink-0"
                            />
                            <span className="text-lg leading-none">{feature.name ?? feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No features listed</p>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-6">
                  <div>
                    <h3 className="font-semibold mb-8">Vehicle History</h3>
                    {history && history.length > 0 ? (
                      <div className="space-y-4">
                        {history.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-border last:border-b-0">
                            <IconPreview name={item.iconSvg} className="size-5 text-primary shrink-0" />
                            <div>
                              <p className="font-semibold text-base leading-none">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No history items available</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Contact Card */}
            <Card className="mb-6 sticky top-20">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact Dealer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interested in this vehicle? Get in touch with Deen Elite Auto Ltd today.
                  </p>
                </div>

                <Button className="w-full" size="lg">
                  <Phone className="mr-2 size-4" />
                  Call Now
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <MapPin className="mr-2 size-4" />
                  Visit Showroom
                </Button>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>+256 993523948</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>Kampala, Uganda</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VIN Card */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Vehicle Details</h3>
                <div className="space-y-3">
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
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }
                    >
                      {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Dealership */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">About Deen Elite Auto Ltd</h3>
          <p className="text-muted-foreground">
            Your trusted car dealership in Uganda. We offer quality vehicles and transparent pricing.
          </p>
        </div>
      </div>
    </div>
  )
}
