import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/server/storage/db/queries/db'
import { cars } from '@/server/storage/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/dashboard/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const year = url.searchParams.get('year')
        
        // Base condition - filter by year if provided
        const currentYear = year ? parseInt(year) : undefined
        const lastYear = currentYear ? currentYear - 1 : undefined
        const yearCondition = currentYear ? eq(cars.year, currentYear) : undefined
        const lastYearCondition = lastYear ? eq(cars.year, lastYear) : undefined

        // Total cars in inventory (not sold)
        const totalCarsResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            yearCondition
              ? and(eq(cars.sold, false), yearCondition)
              : eq(cars.sold, false)
          )
          .execute()
        const totalCars = totalCarsResult[0]?.count || 0

        // Total cars from last year
        const totalCarsLastYearResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            lastYearCondition
              ? and(eq(cars.sold, false), lastYearCondition)
              : sql`false`
          )
          .execute()
        const totalCarsLastYear = totalCarsLastYearResult[0]?.count || 0

        // Number sold
        const numberSoldResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            yearCondition
              ? and(eq(cars.sold, true), yearCondition)
              : eq(cars.sold, true)
          )
          .execute()
        const numberSold = numberSoldResult[0]?.count || 0

        // Number sold last year
        const numberSoldLastYearResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            lastYearCondition
              ? and(eq(cars.sold, true), lastYearCondition)
              : sql`false`
          )
          .execute()
        const numberSoldLastYear = numberSoldLastYearResult[0]?.count || 0

        // Total earned from sold cars
        const totalEarnedResult = await db
          .select({ total: sql<string>`COALESCE(SUM(price), 0)` })
          .from(cars)
          .where(
            yearCondition
              ? and(eq(cars.sold, true), yearCondition)
              : eq(cars.sold, true)
          )
          .execute()
        const totalEarned = parseFloat(totalEarnedResult[0]?.total || '0')

        // Total earned last year
        const totalEarnedLastYearResult = await db
          .select({ total: sql<string>`COALESCE(SUM(price), 0)` })
          .from(cars)
          .where(
            lastYearCondition
              ? and(eq(cars.sold, true), lastYearCondition)
              : sql`false`
          )
          .execute()
        const totalEarnedLastYear = parseFloat(totalEarnedLastYearResult[0]?.total || '0')

        // Total projected from all inventory
        const totalProjectedResult = await db
          .select({ total: sql<string>`COALESCE(SUM(price), 0)` })
          .from(cars)
          .where(yearCondition || undefined)
          .execute()
        const totalProjected = parseFloat(totalProjectedResult[0]?.total || '0')

        // Total projected last year
        const totalProjectedLastYearResult = await db
          .select({ total: sql<string>`COALESCE(SUM(price), 0)` })
          .from(cars)
          .where(lastYearCondition || sql`false`)
          .execute()
        const totalProjectedLastYear = parseFloat(totalProjectedLastYearResult[0]?.total || '0')

        // Featured cars count
        const featuredCarsResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            yearCondition
              ? and(eq(cars.isFeatured, true), yearCondition)
              : eq(cars.isFeatured, true)
          )
          .execute()
        const featuredCars = featuredCarsResult[0]?.count || 0

        // Featured cars last year
        const featuredCarsLastYearResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cars)
          .where(
            lastYearCondition
              ? and(eq(cars.isFeatured, true), lastYearCondition)
              : sql`false`
          )
          .execute()
        const featuredCarsLastYear = featuredCarsLastYearResult[0]?.count || 0

        // Inquiries - placeholder for now
        const inquiries = 0
        const inquiriesLastYear = 0

        // Calculate percentage changes
        const calculatePercentage = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return Math.round(((current - previous) / previous) * 100)
        }

        return Response.json({
          totalCars,
          totalCarsChange: calculatePercentage(totalCars, totalCarsLastYear),
          numberSold,
          numberSoldChange: calculatePercentage(numberSold, numberSoldLastYear),
          totalEarned,
          totalEarnedChange: calculatePercentage(totalEarned, totalEarnedLastYear),
          totalProjected,
          totalProjectedChange: calculatePercentage(totalProjected, totalProjectedLastYear),
          featuredCars,
          featuredCarsChange: calculatePercentage(featuredCars, featuredCarsLastYear),
          inquiries,
          inquiriesChange: calculatePercentage(inquiries, inquiriesLastYear),
        })
      },
    },
  },
})
