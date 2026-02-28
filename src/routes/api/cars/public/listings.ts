import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

export const Route = createFileRoute('/api/cars/public/listings')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          
          // Extract query parameters
          const search = url.searchParams.get('search') || undefined
          const makeIds = url.searchParams.get('makeIds')?.split(',').filter(Boolean) || undefined
          const modelIds = url.searchParams.get('modelIds')?.split(',').filter(Boolean) || undefined
          const bodyTypeIds = url.searchParams.get('bodyTypeIds')?.split(',').filter(Boolean) || undefined
          const yearsParam = url.searchParams.get('years')
          const years = yearsParam ? yearsParam.split(',').map(Number).filter(n => !isNaN(n)) : undefined
          const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined
          const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined
          const transmissions = url.searchParams.get('transmissions')?.split(',').filter(Boolean) || undefined
          const fuelTypes = url.searchParams.get('fuelTypes')?.split(',').filter(Boolean) || undefined
          const conditions = url.searchParams.get('conditions')?.split(',').filter(Boolean) || undefined
          const colors = url.searchParams.get('colors')?.split(',').filter(Boolean) || undefined
          const minMileage = url.searchParams.get('minMileage') ? Number(url.searchParams.get('minMileage')) : undefined
          const maxMileage = url.searchParams.get('maxMileage') ? Number(url.searchParams.get('maxMileage')) : undefined
          const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1
          const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 12
          const sortBy = url.searchParams.get('sortBy') as any || 'featured'

          const result = await carStore.getPublicCarListings({
            search,
            makeIds,
            modelIds,
            bodyTypeIds,
            years,
            minPrice,
            maxPrice,
            transmissions,
            fuelTypes,
            conditions,
            colors,
            minMileage,
            maxMileage,
            page,
            limit,
            sortBy,
          })

          return Response.json(result)
        } catch (error) {
          console.error('Error fetching car listings:', error)
          return Response.json({ error: 'Failed to fetch car listings' }, { status: 500 })
        }
      },
    },
  },
})
