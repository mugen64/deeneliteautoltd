import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChevronRight,
  Fuel,
  Calendar,
  Gauge,
  X,
  Plus,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
  Car,
  TruckIcon,
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
import { getServerVersion } from '@/storage/db/data'

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    return getServerVersion()
  },
  staleTime: Infinity,

})

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
  const [selectedBodyType, setSelectedBodyType] = useState<string>('Sedan')
  const [selectedMakes, setSelectedMakes] = useState<string[]>(['Mercedes-Benz', 'BMW', 'Lexus'])
  const [selectedFuel, setSelectedFuel] = useState<string[]>([])
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([])
  const [selectedDrive, setSelectedDrive] = useState<string[]>([])
  const [yearRange] = useState([2013, 2024])
  const [priceRange] = useState([8000, 58000])
  const [mileageRange] = useState([0, 30000])

  const bodyTypes = [
    { label: 'Sedan', icon: Car },
    { label: 'SUV', icon: TruckIcon },
    { label: 'Hatchback', icon: Car },
    { label: 'Coupe', icon: Car },
    { label: 'Sport cars', icon: Car },
  ]

  const removeMake = (value: string) => {
    setSelectedMakes((prev) => prev.filter((v) => v !== value))
  }

  const toggleFuel = (value: string) => {
    setSelectedFuel((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleTransmission = (value: string) => {
    setSelectedTransmission((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleDrive = (value: string) => {
    setSelectedDrive((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const resetFilters = () => {
    setSelectedMakes([])
    setSelectedFuel([])
    setSelectedTransmission([])
    setSelectedDrive([])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Body Type Filter */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end gap-2 overflow-x-auto py-4">
            {bodyTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.label}
                  onClick={() => setSelectedBodyType(type.label)}
                  className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all min-w-25 ${selectedBodyType === type.label
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                    }`}
                >
                  <Icon
                    className={`size-8 ${selectedBodyType === type.label
                        ? 'text-primary'
                        : 'text-muted-foreground'
                      }`}
                  />
                  <span
                    className={`text-xs font-medium ${selectedBodyType === type.label
                        ? 'text-primary'
                        : 'text-foreground'
                      }`}
                  >
                    {type.label}
                  </span>
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
                  <Button
                    variant="link"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedMakes.map((make) => (
                    <Badge
                      key={make}
                      variant="secondary"
                      className="gap-1 pl-2.5 pr-1.5"
                    >
                      {make}
                      <button
                        onClick={() => removeMake(make)}
                        className="hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  AMG GT, Class A, I-03k...
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="size-4" />
                  Add model
                </Button>
              </div>

              {/* Price Filter with Histogram */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Price</h4>
                  <Button
                    variant="link"
                    size="sm"
                  >
                    Reset
                  </Button>
                </div>
                {/* Simple histogram visualization */}
                <div className="mb-4 h-20 flex items-end gap-0.5">
                  {[8, 12, 18, 22, 28, 35, 42, 38, 45, 52, 48, 55, 58, 52, 45, 38, 32, 28, 22, 18, 14, 10, 8, 6, 4].map(
                    (height, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-colors ${i >= 2 && i <= 18
                            ? 'bg-primary'
                            : 'bg-muted'
                          }`}
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={`${priceRange[0]}`}
                      readOnly
                      className="w-20 text-center"
                    />
                    <span className="text-muted-foreground">€</span>
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={`${priceRange[1]}`}
                      readOnly
                      className="w-20 text-center"
                    />
                    <span className="text-muted-foreground">€</span>
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
                    value={mileageRange[0]}
                    readOnly
                    className="flex-1 text-center"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="text"
                    value={`${mileageRange[1]}`}
                    readOnly
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
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Electric', 'Petrol', 'Diesel', 'Hybrid'].map((fuel) => (
                    <Button
                      key={fuel}
                      variant={selectedFuel.includes(fuel) ? 'default' : 'outline'}
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
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Automatic', 'Mechanical', 'Variator'].map((trans) => (
                    <Button
                      key={trans}
                      variant={selectedTransmission.includes(trans) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTransmission(trans)}
                    >
                      {trans}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Drive Filter */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Drive</h4>
                  <Button
                    variant="link"
                    size="sm"
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', '4WD', 'AWD', 'FWD', 'RWD'].map((drive) => (
                    <Button
                      key={drive}
                      variant={selectedDrive.includes(drive) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDrive(drive)}
                    >
                      {drive}
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
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{yearRange[0]}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full relative">
                    <div
                      className="absolute h-full bg-primary rounded-full"
                      style={{ left: '10%', right: '10%' }}
                    />
                  </div>
                  <span className="text-sm font-medium">{yearRange[1]}</span>
                </div>
              </div>

              {/* Reset All Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Reset all
              </Button>
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
                  <div className="relative aspect-4/3 overflow-hidden">
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

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm">
                <ChevronRight className="size-4 rotate-180" />
                Previous
              </Button>
              <div className="flex gap-1">
                <Button variant="default" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <span className="px-2 text-sm text-muted-foreground">...</span>
                <Button variant="outline" size="sm">
                  15
                </Button>
              </div>
              <Button variant="ghost" size="sm">
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
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
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Sedan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    SUV
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Hatchback
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Motorcycles
                  </a>
                </li>
              </ul>
            </div>

            {/* Sell Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Sell</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Valuation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Traded-in
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Commission sale
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
                  <a href="#" className="hover:text-foreground transition-colors">
                    Magazine
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Subscribe to the newsletter</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-mail"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  className="shrink-0"
                >
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
            <p>© 2024 «CarDealings» All rights reserved</p>
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
