import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Fuel,
  Calendar,
  Gauge,
  X,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
  Car,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
 Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CarListing = {
  id: string
  sku: string
  year: number
  price: string
  color: string
  transmission: string
  fuelType: string
  mileage: number
  condition: string
  isFeatured: boolean
  features: string[]
  make: { id: string; name: string; slug: string }
  model: { id: string; name: string; slug: string }
  bodyType: { id: string; name: string; slug: string }
  primaryImage: string | null
}

type CarListingResponse = {
  data: CarListing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type FilterOptions = {
  makes: Array<{ id: string; name: string; count: number }>
  bodyTypes: Array<{ id: string; name: string; iconUrl: string | null; count: number }>
  years: number[]
  transmissions: string[]
  fuelTypes: string[]
  conditions: string[]
  colors: string[]
  priceRange: { min: number; max: number }
  mileageRange: { min: number; max: number }
}

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: (search) => {
    return {
      page: Number(search.page) || 1,
      search: (search.search as string) || '',
      sortBy: (search.sortBy as string) || 'year_desc',
      bodyTypeId: (search.bodyTypeId as string) || '',
      makeIds: (search.makeIds as string) || '',
      fuelTypes: (search.fuelTypes as string) || '',
      transmissions: (search.transmissions as string) || '',
      years: (search.years as string) || '',
      minPrice: Number(search.minPrice) || undefined,
      maxPrice: Number(search.maxPrice) || undefined,
      minMileage: Number(search.minMileage) || undefined,
      maxMileage: Number(search.maxMileage) || undefined,
    }
  },
})

function App() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  // Local state for filters
  const [searchText, setSearchText] = useState(searchParams.search)
  const [selectedBodyTypeId, setSelectedBodyTypeId] = useState<string>(searchParams.bodyTypeId)
  const [selectedMakeIds, setSelectedMakeIds] = useState<string[]>(
    searchParams.makeIds ? searchParams.makeIds.split(',').filter(Boolean) : []
  )
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(
    searchParams.fuelTypes ? searchParams.fuelTypes.split(',').filter(Boolean) : []
  )
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    searchParams.transmissions ? searchParams.transmissions.split(',').filter(Boolean) : []
  )
  const [selectedYears, setSelectedYears] = useState<string[]>(
    searchParams.years ? searchParams.years.split(',').filter(Boolean) : []
  )

  useEffect(() => {
    setSearchText(searchParams.search)
  }, [searchParams.search])

  // Fetch filter options
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['carFilters'],
    queryFn: async () => {
      const response = await fetch('/api/cars/public/filters')
      if (!response.ok) throw new Error('Failed to fetch filters')
      return response.json()
    },
  })

  // Build query params for API
  const buildQueryParams = () => {
    const params = new URLSearchParams()
    params.set('page', searchParams.page.toString())
    params.set('limit', '12')
    if (searchParams.search) params.set('search', searchParams.search)
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy)
    if (selectedBodyTypeId) params.set('bodyTypeIds', selectedBodyTypeId)
    if (selectedMakeIds.length) params.set('makeIds', selectedMakeIds.join(','))
    if (selectedFuelTypes.length) params.set('fuelTypes', selectedFuelTypes.join(','))
    if (selectedTransmissions.length) params.set('transmissions', selectedTransmissions.join(','))
    if (selectedYears.length) params.set('years', selectedYears.join(','))
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice.toString())
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice.toString())
    if (searchParams.minMileage) params.set('minMileage', searchParams.minMileage.toString())
    if (searchParams.maxMileage) params.set('maxMileage', searchParams.maxMileage.toString())
    return params.toString()
  }

  // Fetch car listings
  const {
    data: listingsData,
    isLoading,
    error,
  } = useQuery<CarListingResponse>({
    queryKey: [
      'carListings',
      searchParams.search,
      searchParams.page,
      searchParams.sortBy,
      selectedBodyTypeId,
      selectedMakeIds,
      selectedFuelTypes,
      selectedTransmissions,
      selectedYears,
      searchParams.minPrice,
      searchParams.maxPrice,
      searchParams.minMileage,
      searchParams.maxMileage,
    ],
    queryFn: async () => {
      const response = await fetch(`/api/cars/public/listings?${buildQueryParams()}`)
      if (!response.ok) throw new Error('Failed to fetch car listings')
      return response.json()
    },
  })

  const priceRange = filterOptions?.priceRange || { min: 0, max: 100000 }
  const mileageRange = filterOptions?.mileageRange || { min: 0, max: 200000 }

  const removeMake = (makeId: string) => {
    const newMakes = selectedMakeIds.filter((id) => id !== makeId)
    setSelectedMakeIds(newMakes)
    navigate({
      search: (prev) => ({
        ...prev,
        makeIds: newMakes.join(','),
        page: 1,
      }),
    })
  }

  const toggleFuel = (value: string) => {
    const newFuels = selectedFuelTypes.includes(value)
      ? selectedFuelTypes.filter((v) => v !== value)
      : [...selectedFuelTypes, value]
    setSelectedFuelTypes(newFuels)
    navigate({
      search: (prev) => ({
        ...prev,
        fuelTypes: newFuels.join(','),
        page: 1,
      }),
    })
  }

  const toggleTransmission = (value: string) => {
    const newTrans = selectedTransmissions.includes(value)
      ? selectedTransmissions.filter((v) => v !== value)
      : [...selectedTransmissions, value]
    setSelectedTransmissions(newTrans)
    navigate({
      search: (prev) => ({
        ...prev,
        transmissions: newTrans.join(','),
        page: 1,
      }),
    })
  }

  const toggleYear = (year: string) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year]
    setSelectedYears(newYears)
    navigate({
      search: (prev) => ({
        ...prev,
        years: newYears.join(','),
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
    setSelectedMakeIds([])
    setSelectedFuelTypes([])
    setSelectedTransmissions([])
    setSelectedYears([])
    setSelectedBodyTypeId('')
    navigate({
      search: {
        page: 1,
        search: '',
        sortBy: 'year_desc',
        bodyTypeId: '',
        makeIds: '',
        fuelTypes: '',
        transmissions: '',
        years: '',
        minPrice: undefined,
        maxPrice: undefined,
        minMileage: undefined,
        maxMileage: undefined,
      },
    })
  }

  const applySearch = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchText.trim(),
        page: 1,
      }),
    })
  }

  const handleBodyTypeClick = (bodyTypeId: string) => {
    const newBodyTypeId = selectedBodyTypeId === bodyTypeId ? '' : bodyTypeId
    setSelectedBodyTypeId(newBodyTypeId)
    navigate({
      search: (prev) => ({
        ...prev,
        bodyTypeId: newBodyTypeId,
        page: 1,
      }),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Body Type Filter */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end gap-2 overflow-x-auto py-4">
            {filterOptions?.bodyTypes.map((type) => {
              return (
                <button
                  key={type.id}
                  onClick={() => handleBodyTypeClick(type.id)}
                  className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all min-w-25 ${
                    selectedBodyTypeId === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {type.iconUrl ? (
                    <img
                      src={type.iconUrl}
                      alt={`${type.name} icon`}
                      className={`size-8 ${
                        selectedBodyTypeId === type.id
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ) : (
                    <Car
                      className={`size-8 ${
                        selectedBodyTypeId === type.id
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      selectedBodyTypeId === type.id ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {type.name}
                  </span>
                  <span className="text-xs text-muted-foreground">({type.count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-80 shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Make and Model Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Make and model</h4>
                  <Button variant="link" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedMakeIds.map((makeId) => {
                    const make = filterOptions?.makes.find((m) => m.id === makeId)
                    return (
                      <Badge key={makeId} variant="secondary" className="gap-1 pl-2.5 pr-1.5">
                        {make?.name}
                        <button
                          onClick={() => removeMake(makeId)}
                          className="hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions?.makes.map((make) => (
                    <label key={make.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMakeIds.includes(make.id)}
                        onChange={() => {
                          const newMakes = selectedMakeIds.includes(make.id)
                            ? selectedMakeIds.filter((id) => id !== make.id)
                            : [...selectedMakeIds, make.id]
                          setSelectedMakeIds(newMakes)
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              makeIds: newMakes.join(','),
                              page: 1,
                            }),
                          })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {make.name} ({make.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter with Histogram */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Price</h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          minPrice: undefined,
                          maxPrice: undefined,
                          page: 1,
                        }),
                      })
                    }
                  >
                    Reset
                  </Button>
                </div>
                {/* Simple histogram visualization */}
                <div className="mb-4 h-20 flex items-end gap-0.5">
                  {[
                    8, 12, 18, 22, 28, 35, 42, 38, 45, 52, 48, 55, 58, 52, 45, 38, 32, 28, 22, 18,
                    14, 10, 8, 6, 4,
                  ].map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-colors ${
                        i >= 2 && i <= 18 ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={searchParams.minPrice || priceRange.min}
                      onChange={(e) =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            minPrice: Number(e.target.value) || undefined,
                            page: 1,
                          }),
                        })
                      }
                      className="w-24 text-center"
                    />
                    <span className="text-muted-foreground">$</span>
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={searchParams.maxPrice || priceRange.max}
                      onChange={(e) =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            maxPrice: Number(e.target.value) || undefined,
                            page: 1,
                          }),
                        })
                      }
                      className="w-24 text-center"
                    />
                    <span className="text-muted-foreground">$</span>
                  </div>
                </div>
              </div>

              {/* Mileage Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Mileage, km</h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          minMileage: undefined,
                          maxMileage: undefined,
                          page: 1,
                        }),
                      })
                    }
                  >
                    Reset
                  </Button>
                </div>
                {/* Simple mileage visualization */}
                <div className="mb-4 h-16 flex items-end gap-px">
                  {[5, 8, 12, 15, 18, 22, 25, 20, 18, 15, 12, 10, 8, 6].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary rounded-sm opacity-80"
                      style={{ height: `${height * 3}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Input
                    type="text"
                    value={searchParams.minMileage || mileageRange.min}
                    onChange={(e) =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          minMileage: Number(e.target.value) || undefined,
                          page: 1,
                        }),
                      })
                    }
                    className="flex-1 text-center"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="text"
                    value={searchParams.maxMileage || mileageRange.max}
                    onChange={(e) =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          maxMileage: Number(e.target.value) || undefined,
                          page: 1,
                        }),
                      })
                    }
                    className="flex-1 text-center"
                  />
                </div>
              </div>

              {/* Fuel Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Fuel</h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSelectedFuelTypes([])
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          fuelTypes: '',
                          page: 1,
                        }),
                      })
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions?.fuelTypes.map((fuel) => (
                    <Button
                      key={fuel}
                      variant={selectedFuelTypes.includes(fuel) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFuel(fuel)}
                    >
                      {fuel}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Transmission Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Transmission</h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSelectedTransmissions([])
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          transmissions: '',
                          page: 1,
                        }),
                      })
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions?.transmissions.map((trans) => (
                    <Button
                      key={trans}
                      variant={selectedTransmissions.includes(trans) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTransmission(trans)}
                    >
                      {trans}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Vehicle Year Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Vehicle year</h4>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSelectedYears([])
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          years: '',
                          page: 1,
                        }),
                      })
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions?.years
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <label key={year} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(year.toString())}
                          onChange={() => toggleYear(year.toString())}
                          className="rounded"
                        />
                        <span className="text-sm">{year}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Reset All Button */}
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Reset all
              </Button>
            </div>
          </aside>

          {/* Car Listings */}
          <main className="flex-1">
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        applySearch()
                      }
                    }}
                    placeholder="Type Car name or Brand"
                    className="max-w-sm"
                  />
                  <Button size="sm" onClick={applySearch}>
                    Search
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select
                    value={searchParams.sortBy || 'year_desc'}
                    onValueChange={(value) =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          sortBy: value || 'year_desc',
                          page: 1,
                        }),
                      })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="year_desc">Year: Newest</SelectItem>
                        <SelectItem value="year_asc">Year: Oldest</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
                        <SelectItem value="mileage_desc">Mileage: High to Low</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {listingsData?.pagination.total || 0} results
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading cars...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-destructive">Error loading cars</div>
              </div>
            ) : !listingsData?.data.length ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No cars found matching your filters</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listingsData.data.map((car) => (
                    <Link
                      key={car.id}
                      to="/cars/$makeSlug/$modelSlug/$id"
                      params={{
                        makeSlug: car.make.slug,
                        modelSlug: car.model.slug,
                        id: car.id,
                      }}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <div className="relative aspect-4/3 overflow-hidden bg-muted">
                          {car.primaryImage ? (
                            <img
                              src={car.primaryImage}
                              alt={`${car.make.name} ${car.model.name}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Car className="size-16 text-muted-foreground" />
                            </div>
                          )}
                          {car.isFeatured && (
                            <Badge className="absolute top-2 right-2">Featured</Badge>
                          )}
                        </div>
                        <CardContent className="space-y-3 pt-4">
                          <div>
                            <h3 className="font-semibold text-base">
                              {car.make.name} {car.model.name}
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase">
                              {car.bodyType.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="size-3" />
                              {car.year}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Fuel className="size-3" />
                              {car.fuelType}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Gauge className="size-3" />
                              {car.mileage.toLocaleString()} km
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              {car.transmission}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              {car.color}
                            </Badge>
                          </div>

                          {car.features.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {car.features.slice(0, 4).map((feature) => (
                                <Badge key={feature} variant="secondary">
                                  {feature}
                                </Badge>
                              ))}
                              {car.features.length > 4 && (
                                <Badge variant="secondary">+{car.features.length - 4} more</Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-base">
                              ${Number(car.price).toLocaleString()}
                            </span>
                            <Badge
                              variant="secondary"
                              className={
                                car.condition === 'new'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }
                            >
                              {car.condition}
                            </Badge>
                            <span className="text-xs text-muted-foreground">SKU {car.sku}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {listingsData.pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={searchParams.page <= 1}
                      onClick={() =>
                        navigate({
                          search: (prev) => ({ ...prev, page: prev.page - 1 }),
                        })
                      }
                    >
                      <ChevronRight className="size-4 rotate-180" />
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: listingsData.pagination.totalPages }, (_, i) => {
                        const page = i + 1
                        // Show first, last, current, and pages around current
                        if (
                          page === 1 ||
                          page === listingsData.pagination.totalPages ||
                          (page >= searchParams.page - 1 && page <= searchParams.page + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={searchParams.page === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                navigate({
                                  search: (prev) => ({ ...prev, page }),
                                })
                              }
                            >
                              {page}
                            </Button>
                          )
                        } else if (
                          page === searchParams.page - 2 ||
                          page === searchParams.page + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-sm text-muted-foreground">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={searchParams.page >= listingsData.pagination.totalPages}
                      onClick={() =>
                        navigate({
                          search: (prev) => ({ ...prev, page: prev.page + 1 }),
                        })
                      }
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Buy Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Buy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {filterOptions?.bodyTypes.slice(0, 4).map((type) => (
                  <li key={type.id}>
                    <button
                      onClick={() => handleBodyTypeClick(type.id)}
                      className="hover:text-foreground transition-colors"
                    >
                      {type.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sell Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Sell</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/sell-car" className="hover:text-foreground transition-colors">
                    Sell Your Car
                  </a>
                </li>
                <li>
                  <a href="/sell-car" className="hover:text-foreground transition-colors">
                    Valuation
                  </a>
                </li>
                <li>
                  <a href="/sell-car" className="hover:text-foreground transition-colors">
                    Traded-in
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Career
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contacts
                  </a>
                </li>
                <li>
                  <a href="/submit-enquiry" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Subscribe to the newsletter</h3>
              <div className="flex gap-2">
                <Input type="email" placeholder="E-mail" className="flex-1" />
                <Button size="icon" className="shrink-0">
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="flex gap-3 mt-4">
                <a
                  href="#"
                  className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Facebook className="size-4" fill="currentColor" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Instagram className="size-4" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Linkedin className="size-4" fill="currentColor" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 «CarDealings» All rights reserved</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of use
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                User Agreement
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
