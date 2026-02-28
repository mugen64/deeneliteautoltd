import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Fuel,
  Calendar,
  Gauge,
  X,
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
import { RecentlySoldCars } from '@/components/RecentlySoldCars'

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
  head: () => ({
    meta: [
      {
        title: 'Car Dealership - Buy & Sell Used Cars | Deen Elite Auto Ltd',
      },
      {
        name: 'description',
        content: 'Discover quality used cars at Deen Elite Auto Ltd. Browse our extensive inventory of vehicles, compare prices, and find your perfect car. Buy or sell your vehicle with confidence.',
      },
      {
        name: 'keywords',
        content: 'used cars, car dealership, buy cars, sell cars, vehicle inventory, auto sales',
      },
      {
        property: 'og:title',
        content: 'Car Dealership - Buy & Sell Used Cars | Deen Elite Auto Ltd',
      },
      {
        property: 'og:description',
        content: 'Browse quality used cars, compare prices, and find your perfect vehicle at Deen Elite Auto Ltd.',
      },
      {
        property: 'og:url',
        content: 'https://deeneliteauto.com',
      },
      {
        property: 'og:image',
        content: 'https://deeneliteauto.com/og-image.jpg',
      },
      {
        name: 'twitter:title',
        content: 'Car Dealership - Buy & Sell Used Cars | Deen Elite Auto Ltd',
      },
      {
        name: 'twitter:description',
        content: 'Browse quality used cars, compare prices, and find your perfect vehicle at Deen Elite Auto Ltd.',
      },
      {
        name: 'twitter:image',
        content: 'https://deeneliteauto.com/og-image.jpg',
      },
    ],
  }),
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    setSearchText(searchParams.search)
  }, [searchParams.search])

  useEffect(() => {
    setSelectedBodyTypeId(searchParams.bodyTypeId)
    setSelectedMakeIds(searchParams.makeIds ? searchParams.makeIds.split(',').filter(Boolean) : [])
    setSelectedFuelTypes(searchParams.fuelTypes ? searchParams.fuelTypes.split(',').filter(Boolean) : [])
    setSelectedTransmissions(
      searchParams.transmissions ? searchParams.transmissions.split(',').filter(Boolean) : []
    )
    setSelectedYears(searchParams.years ? searchParams.years.split(',').filter(Boolean) : [])
  }, [
    searchParams.bodyTypeId,
    searchParams.makeIds,
    searchParams.fuelTypes,
    searchParams.transmissions,
    searchParams.years,
  ])

  // Fetch filter options
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['carFilters'],
    queryFn: async () => {
      const response = await fetch('/api/cars/public/filters')
      if (!response.ok) throw new Error('Failed to fetch filters')
      return response.json()
    },
    staleTime: 10 * 60 * 1000,
  })

  const listingQueryParams = useMemo(() => {
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
  }, [
    searchParams.page,
    searchParams.search,
    searchParams.sortBy,
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.minMileage,
    searchParams.maxMileage,
    selectedBodyTypeId,
    selectedMakeIds,
    selectedFuelTypes,
    selectedTransmissions,
    selectedYears,
  ])

  // Fetch car listings
  const {
    data: listingsData,
    isLoading,
    error,
  } = useQuery<CarListingResponse>({
    queryKey: ['carListings', listingQueryParams],
    queryFn: async () => {
      const response = await fetch(`/api/cars/public/listings?${listingQueryParams}`)
      if (!response.ok) throw new Error('Failed to fetch car listings')
      return response.json()
    },
    staleTime: 30 * 1000,
  })

  const priceRange = filterOptions?.priceRange || { min: 0, max: 100000 }
  const mileageRange = filterOptions?.mileageRange || { min: 0, max: 200000 }

  const removeMake = (makeId: string) => {
    const newMakes = selectedMakeIds.filter((id) => id !== makeId)
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
    navigate({
      search: (prev) => ({
        ...prev,
        years: newYears.join(','),
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
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
    const newBodyTypeId = searchParams.bodyTypeId === bodyTypeId ? '' : bodyTypeId
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
          <div className="flex items-center justify-start gap-2 overflow-x-auto py-4">
            {filterOptions?.bodyTypes.map((type) => {
              return (
                <button
                  key={type.id}
                  onClick={() => handleBodyTypeClick(type.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 sm:px-6 rounded-lg border-2 transition-all min-w-22 ${
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
        <div className="mb-4 lg:hidden">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} w-full lg:block lg:w-80 lg:shrink-0`}>
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                  Close
                </Button>
              </div>

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
          <main className="min-w-0 flex-1">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2">
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        applySearch()
                      }
                    }}
                    placeholder="Type Car name or Brand"
                    className="w-full sm:max-w-sm"
                  />
                  <Button size="sm" onClick={applySearch}>
                    Search
                  </Button>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
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
                    <SelectTrigger className="w-40 sm:w-44">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={`listing-skeleton-${index}`} className="overflow-hidden h-full animate-pulse">
                    <div className="aspect-4/3 bg-muted" />
                    <CardContent className="space-y-3 pt-4">
                      <div className="space-y-2">
                        <div className="h-5 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/3 rounded bg-muted" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-6 w-16 rounded bg-muted" />
                        <div className="h-6 w-20 rounded bg-muted" />
                        <div className="h-6 w-14 rounded bg-muted" />
                      </div>

                      <div className="h-6 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      <RecentlySoldCars />
    </div>
  )
}
