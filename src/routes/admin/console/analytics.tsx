import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BarChart3, Eye, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/console/analytics')({
  component: RouteComponent,
})

type PageViewStat = {
  pagePath: string
  views: number
}

type CarViewStat = {
  id: string
  year: number
  make: string
  model: string
  views: number
}

type AnalyticsResponse = {
  pageViews: {
    total: number
    topPages: PageViewStat[]
  }
  carViews: {
    total: number
    topCars: CarViewStat[]
  }
  days: number
}

function RouteComponent() {
  const [days, setDays] = useState(30)

  const { data, isLoading, error } = useQuery<AnalyticsResponse>({
    queryKey: ['analytics', days],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/analytics?days=${days}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to fetch analytics')
      }
      return response.json()
    },
  })

  const pageViewStats = data?.pageViews || { total: 0, topPages: [] }
  const carViewStats = data?.carViews || { total: 0, topCars: [] }

  if (error) {
    console.error('Analytics error:', error)
  }

  const formatPath = (path: string) => {
    if (path === '/') return 'Home'
    return path.replace(/\//g, ' / ').replace(/-/g, ' ')
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track page views and car listing performance</p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load analytics data. Please try again.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {[7, 30, 90].map((period) => (
          <Button
            key={period}
            variant={days === period ? 'default' : 'outline'}
            onClick={() => setDays(period)}
            disabled={isLoading}
          >
            Last {period} days
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Page Views</p>
                <p className="text-4xl font-bold text-primary mt-2">
                  {isLoading ? '...' : pageViewStats.total.toLocaleString()}
                </p>
              </div>
              <FileText className="size-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Car Views</p>
                <p className="text-4xl font-bold text-primary mt-2">
                  {isLoading ? '...' : carViewStats.total.toLocaleString()}
                </p>
              </div>
              <Eye className="size-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : pageViewStats.topPages.length === 0 ? (
              <p className="text-muted-foreground">No page views yet</p>
            ) : (
              <div className="space-y-3">
                {pageViewStats.topPages.map((page, idx) => (
                  <div key={`${page.pagePath}-${idx}`} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{formatPath(page.pagePath)}</p>
                      <p className="text-xs text-muted-foreground">{page.pagePath}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {page.views.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Top Car Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : carViewStats.topCars.length === 0 ? (
              <p className="text-muted-foreground">No car views yet</p>
            ) : (
              <div className="space-y-3">
                {carViewStats.topCars.map((car, idx) => (
                  <div key={`${car.id}-${idx}`} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {car.year} {car.make} {car.model}
                      </p>
                      <p className="text-xs text-muted-foreground" title={car.id}>{car.id.slice(0, 8)}...</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {car.views.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
