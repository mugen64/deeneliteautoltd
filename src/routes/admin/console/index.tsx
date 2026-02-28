import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth'
import {
  CarIcon,
  TrendingUpIcon,
  DollarSignIcon,
  TargetIcon,
  StarIcon,
  MessageSquareIcon,
  PlusIcon,
  EditIcon,
  LayersIcon,
} from 'lucide-react'

export const Route = createFileRoute('/admin/console/')({
  component: RouteComponent,
})

type DashboardStats = {
  totalCars: number
  totalCarsChange: number
  numberSold: number
  numberSoldChange: number
  totalEarned: number
  totalEarnedChange: number
  totalProjected: number
  totalProjectedChange: number
  featuredCars: number
  featuredCarsChange: number
  inquiries: number
  inquiriesChange: number
}

function RouteComponent() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>('all')
  
  // Generate year options from 2025 to current year
  const yearOptions = []
  for (let year = 2025; year <= currentYear; year++) {
    yearOptions.push(year)
  }

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats', selectedYear],
    queryFn: async () => {
      const url = selectedYear === 'all' 
        ? '/api/dashboard/stats' 
        : `/api/dashboard/stats?year=${selectedYear}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const renderPercentageChange = (change: number) => {
    const isPositive = change >= 0
    const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    const symbol = isPositive ? '↑' : '↓'
    
    return (
      <span className={`text-xs font-medium ${color}`}>
        {symbol} {Math.abs(change)}% from last year
      </span>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.name}. Last login: {formatDate(new Date())}
            </p>
          )}
          {user && (
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <div>
                Role: <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">{user.role}</span>
              </div>
              <div className="text-muted-foreground">
                Total logins: 32
              </div>
            </div>
          )}
        </div>

        {/* Year Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Filter by year:</label>
          <Select value={selectedYear} onValueChange={(value) => setSelectedYear(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Cars */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cars
              </CardTitle>
              <CarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCars || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">In inventory</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.totalCarsChange)}</div>
              )}
            </CardContent>
          </Card>

          {/* Number Sold */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Number Sold
              </CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.numberSold || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Vehicles sold</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.numberSoldChange)}</div>
              )}
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalEarned || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">From sold vehicles</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.totalEarnedChange)}</div>
              )}
            </CardContent>
          </Card>

          {/* Total Projected */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projected
              </CardTitle>
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalProjected || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total price</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.totalProjectedChange)}</div>
              )}
            </CardContent>
          </Card>

          {/* Featured Cars */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Featured Cars
              </CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.featuredCars || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently featured</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.featuredCarsChange)}</div>
              )}
            </CardContent>
          </Card>

          {/* Inquiries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inquiries
              </CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inquiries || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
              {selectedYear !== 'all' && stats && (
                <div className="mt-2">{renderPercentageChange(stats.inquiriesChange)}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Car Inventory Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CarIcon className="h-5 w-5" />
              <CardTitle>Car Inventory Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your car listings, add new vehicles, update pricing, and control which cars are featured.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/console/car-inventory">
                <Button>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Manage Cars
                </Button>
              </Link>
              <Link to="/admin/console/car-inventory/add">
                <Button variant="outline">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Car
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Models Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayersIcon className="h-5 w-5" />
              <CardTitle>Models Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage available car models and makes for your inventory.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/console/car-models">
                <Button>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Manage Models
                </Button>
              </Link>
              <Link to="/admin/console/car-models/add-model">
                <Button variant="outline">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Model
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">New model added: Hyundai Nexo</p>
                <p className="text-xs text-muted-foreground">02/11/2025 at 12:54:09</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center py-4 border-t">
              Activity tracking coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
