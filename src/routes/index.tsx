import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChevronRight,
  Fuel,
  Calendar,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export const Route = createFileRoute('/')({ component: App })

// Sample car data
const cars = [
  {
    id: 1,
    name: 'BMW 525 D',
    category: 'LUXURY LINE',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
    year: 2011,
    fuelType: 'Diesel',
    kilometers: '72,000 Km',
    price: '₹ 13,75,000/-',
    oldPrice: '₹ 14,30,000/-',
  },
  {
    id: 2,
    name: 'Skoda Superb',
    category: 'STYLE',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop',
    year: 2016,
    fuelType: 'Petrol',
    kilometers: '61,000 Km',
    price: '₹ 13,25,000/-',
  },
  {
    id: 3,
    name: 'Hyundai Creta',
    category: 'SX+',
    image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=500&h=300&fit=crop',
    year: 2018,
    fuelType: 'Petrol',
    kilometers: '8,900 Km',
    price: '₹ 10,11,000/-',
  },
  {
    id: 4,
    name: 'Hyundai I-20 Elite',
    category: 'ASTA',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&h=300&fit=crop',
    year: 2017,
    fuelType: 'Petrol',
    kilometers: '3,200 Km',
    price: '₹ 5,45,000/-',
    oldPrice: '₹ 5,70,000/-',
  },
  {
    id: 5,
    name: 'Tata Harrier',
    category: 'XZ',
    image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=500&h=300&fit=crop',
    year: 2019,
    fuelType: 'Diesel',
    kilometers: '7,000 Km',
    price: '₹ 16,04,000/-',
  },
  {
    id: 6,
    name: 'Volkswagen Polo',
    category: 'HIGHLINE',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop',
    year: 2015,
    fuelType: 'Diesel',
    kilometers: '32,000 Km',
    price: '₹ 5,01,000/-',
  },
]

function App() {
  const [selectedBudget, setSelectedBudget] = useState<string[]>([])
  const [selectedEmi, setSelectedEmi] = useState<string[]>(['20000-40000', '40000-60000', 'more-60000'])

  const toggleBudget = (value: string) => {
    setSelectedBudget((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleEmi = (value: string) => {
    setSelectedEmi((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      

      {/* Breadcrumb & Title Section */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>Home</span>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Pre-owned Selection</span>
          </div>
          <h2 className="text-xl font-semibold">
            56 Certified Cars available Now
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter</h3>
                <Button variant="link" size="sm" className="text-xs">
                  Clear Filters
                </Button>
              </div>

              {/* Budget Filter */}
              <div>
                <h4 className="mb-3 font-semibold text-sm">Budget</h4>
                <div className="space-y-2">
                  {[
                    { label: '0 - 5 lakh', value: '0-5' },
                    { label: '5 - 10 lakh', value: '5-10' },
                    { label: '10 - 20 lakh', value: '10-20' },
                    { label: '20 - 50 lakh', value: '20-50' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBudget.includes(option.value)}
                        onChange={() => toggleBudget(option.value)}
                        className="size-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Select>
                    <SelectTrigger size="sm" className="flex-1">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">₹ 0</SelectItem>
                        <SelectItem value="5">₹ 5L</SelectItem>
                        <SelectItem value="10">₹ 10L</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger size="sm" className="flex-1">
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="10">₹ 10L</SelectItem>
                        <SelectItem value="20">₹ 20L</SelectItem>
                        <SelectItem value="50">₹ 50L</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* EMI Filter */}
              <div>
                <h4 className="mb-3 font-semibold text-sm">EMI per month</h4>
                <div className="space-y-2">
                  {[
                    { label: '0 - 20,000', value: '0-20000' },
                    { label: '20,000 - 40,000', value: '20000-40000' },
                    { label: '40,000 - 60,000', value: '40000-60000' },
                    { label: 'more than 60,000', value: 'more-60000' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmi.includes(option.value)}
                        onChange={() => toggleEmi(option.value)}
                        className="size-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Select>
                    <SelectTrigger size="sm" className="flex-1">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">₹ 0</SelectItem>
                        <SelectItem value="20000">₹ 20K</SelectItem>
                        <SelectItem value="40000">₹ 40K</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger size="sm" className="flex-1">
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="40000">₹ 40K</SelectItem>
                        <SelectItem value="60000">₹ 60K</SelectItem>
                        <SelectItem value="100000">₹ 100K</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Kilometers Filter */}
              <div>
                <h4 className="mb-3 font-semibold text-sm">Kilometers</h4>
                <div className="space-y-2">
                  {[
                    { label: '0 - 20,000', value: '0-20000' },
                    { label: '20,000 - 50,000', value: '20000-50000' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Car Listings */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by :</span>
                <Select defaultValue="popularity">
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="year-new">Year: Newest First</SelectItem>
                      <SelectItem value="km-low">Kilometers: Low to High</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <Card
                  key={car.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-base">{car.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase">
                        {car.category}
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
                        {car.kilometers}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-base">{car.price}</span>
                      {car.oldPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {car.oldPrice}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
