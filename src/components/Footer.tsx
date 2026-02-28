import { ArrowRight, Facebook, Instagram, Linkedin, CheckCircle, TrendingUp, Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettings } from '@/contexts/settings'

type FooterFilterOptions = {
  bodyTypes: Array<{ id: string; name: string }>
}

type CarStatistics = {
  total: number
  sold: number
  available: number
  listed: number
  byMake: Array<{ makeName: string; count: number }>
  byBodyType: Array<{ bodyTypeName: string; count: number }>
}

export default function Footer() {
  const { settings } = useSettings()
  const { data: filterOptions } = useQuery<FooterFilterOptions>({
    queryKey: ['carFilters'],
    queryFn: async () => {
      const response = await fetch('/api/cars/public/filters')
      if (!response.ok) throw new Error('Failed to fetch filters')
      return response.json()
    },
    staleTime: 10 * 60 * 1000,
  })

  const { data: statistics } = useQuery<CarStatistics>({
    queryKey: ['carStatistics'],
    queryFn: async () => {
      const response = await fetch('/api/cars/statistics')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })

  const companyName = settings?.companyName || 'Deen Elite Auto Ltd'
  const facebookUrl = settings?.facebookUrl || '#'
  const instagramUrl = settings?.instagramUrl || '#'
  const linkedinUrl = settings?.linkedinUrl || '#'

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* Statistics Section - Top */}
        <div className="mb-12">
          <h3 className="font-semibold text-sm mb-6">Our Inventory Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Available</p>
                  <p className="text-4xl font-bold text-foreground">{statistics?.available || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Cars ready to go</p>
                </div>
                <CheckCircle className="size-8 text-muted-foreground opacity-80 shrink-0" />
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Sold</p>
                  <p className="text-4xl font-bold text-foreground">{statistics?.sold || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Happy customers</p>
                </div>
                <TrendingUp className="size-8 text-muted-foreground opacity-80 shrink-0" />
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Listed</p>
                  <p className="text-4xl font-bold text-foreground">{statistics?.listed || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Active listings</p>
                </div>
                <Eye className="size-8 text-muted-foreground opacity-80 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 py-8 border-t border-border">
          <div>
            <h3 className="font-semibold text-sm mb-4">Buy</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {filterOptions?.bodyTypes.slice(0, 4).map((type) => (
                <li key={type.id}>
                  <Link
                    to="/"
                    search={{
                      page: 1,
                      search: '',
                      sortBy: 'year_desc',
                      bodyTypeId: type.id,
                      makeIds: '',
                      fuelTypes: '',
                      transmissions: '',
                      years: '',
                      minPrice: undefined,
                      maxPrice: undefined,
                      minMileage: undefined,
                      maxMileage: undefined,
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                href={facebookUrl}
                className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Facebook className="size-4" fill="currentColor" />
              </a>
              <a
                href={instagramUrl}
                className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={linkedinUrl}
                className="size-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Linkedin className="size-4" fill="currentColor" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 {companyName} All rights reserved</p>
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
  )
}