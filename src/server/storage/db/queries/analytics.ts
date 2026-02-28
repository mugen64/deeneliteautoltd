import { count, desc, eq, gte } from 'drizzle-orm'
import { db } from './db'
import { pageViews, carViews, cars, carModels, carMakes } from '../schema'

export async function trackPageView(pagePath: string) {
  try {
    await db.insert(pageViews).values({
      pagePath,
    }).execute()
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

export async function trackCarView(carId: string) {
  try {
    await db.insert(carViews).values({
      carId,
    }).execute()
  } catch (error) {
    console.error('Error tracking car view:', error)
  }
}

export async function getPageViewStats(days: number = 30) {
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  const [totalResult] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, dateFrom))
    .execute()

  const topPages = await db
    .select({
      pagePath: pageViews.pagePath,
      views: count(pageViews.id).as('views'),
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, dateFrom))
    .groupBy(pageViews.pagePath)
    .orderBy(desc(count(pageViews.id)))
    .limit(10)
    .execute()

  return {
    total: Number(totalResult.count),
    topPages: topPages.map(p => ({
      pagePath: p.pagePath,
      views: Number(p.views),
    })),
  }
}

export async function getCarViewStats(days: number = 30) {
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  const [totalResult] = await db
    .select({ count: count() })
    .from(carViews)
    .where(gte(carViews.createdAt, dateFrom))
    .execute()

  const topCars = await db
    .select({
      id: cars.id,
      year: cars.year,
      make: carMakes.name,
      model: carModels.name,
      views: count(carViews.id).as('views'),
    })
    .from(carViews)
    .innerJoin(cars, eq(carViews.carId, cars.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carMakes, eq(carModels.makeId, carMakes.id))
    .where(gte(carViews.createdAt, dateFrom))
    .groupBy(cars.id, cars.year, carMakes.name, carModels.name)
    .orderBy(desc(count(carViews.id)))
    .limit(10)
    .execute()

  return {
    total: Number(totalResult.count),
    topCars: topCars.map(c => ({
      id: c.id,
      year: c.year,
      make: c.make,
      model: c.model,
      views: Number(c.views),
    })),
  }
}

export const analyticsStore = {
  trackPageView,
  trackCarView,
  getPageViewStats,
  getCarViewStats,
}
