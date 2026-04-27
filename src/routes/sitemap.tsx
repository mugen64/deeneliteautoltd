import { createFileRoute } from '@tanstack/react-router'
import { carStore } from '@/server/storage/db/queries/cars'

const BASE_URL = 'https://deeneliteauto.com'
const PAGE_SIZE = 250

type SitemapCar = {
  id: string
  createdAt: Date | string
  updatedAt?: Date | string | null
  make: { slug: string }
  model: { slug: string }
}

function toLastmod(value: Date | string | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10)
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlXml({
  loc,
  lastmod,
  changefreq,
  priority,
}: {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

async function getAllPublicCarsForSitemap() {
  const cars: SitemapCar[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await carStore.getPublicCarListings({
      page,
      limit: PAGE_SIZE,
      sortBy: 'year_desc',
    })

    cars.push(...(response.data as SitemapCar[]))
    totalPages = Math.max(1, response.pagination.totalPages)
    page += 1
  }

  return cars
}

export const Route = createFileRoute('/sitemap')({
  component: () => null,
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10)
        const cars = await getAllPublicCarsForSitemap()

        const staticUrls = [
          buildUrlXml({
            loc: `${BASE_URL}/`,
            lastmod: today,
            changefreq: 'daily',
            priority: '1.0',
          }),
          buildUrlXml({
            loc: `${BASE_URL}/sell-car`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.8',
          }),
          buildUrlXml({
            loc: `${BASE_URL}/submit-enquiry`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.8',
          }),
        ]

        const carUrls = cars.map((car) => {
          const detailUrl = `${BASE_URL}/cars/${car.make.slug}/${car.model.slug}/${car.id}`
          return buildUrlXml({
            loc: detailUrl,
            lastmod: toLastmod(car.updatedAt || car.createdAt),
            changefreq: 'daily',
            priority: '0.9',
          })
        })

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...staticUrls,
          ...carUrls,
          '</urlset>',
        ].join('\n')

        return new Response(xml, {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=300, s-maxage=300',
          },
        })
      },
    },
  },
})
