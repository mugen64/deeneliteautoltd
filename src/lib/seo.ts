/**
 * SEO utilities for generating structured data and metadata
 */

interface SEOMetaProps {
  title: string
  description: string
  image?: string
  url: string
  type?: 'website' | 'article'
  ogImage?: string
}

/**
 * Generate Open Graph and Twitter Card meta tags
 */
export function generateSocialMeta(props: SEOMetaProps) {
  return {
    og: [
      { property: 'og:title', content: props.title },
      { property: 'og:description', content: props.description },
      { property: 'og:url', content: props.url },
      { property: 'og:type', content: props.type || 'website' },
      ...(props.ogImage ? [{ property: 'og:image', content: props.ogImage }] : []),
    ],
    twitter: [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: props.title },
      { name: 'twitter:description', content: props.description },
      ...(props.image ? [{ name: 'twitter:image', content: props.image }] : []),
    ],
  }
}

/**
 * Generate Schema.org structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Deen Elite Auto Ltd',
    url: 'https://deeneliteauto.com',
    logo: 'https://deeneliteauto.com/logo.png',
    description: 'Premium used car dealership offering quality vehicles and excellent service',
    sameAs: [
      'https://www.facebook.com/deeneliteauto',
      'https://www.twitter.com/deeneliteauto',
      'https://www.instagram.com/deeneliteauto',
    ],
  }
}

/**
 * Generate Schema.org structured data for LocalBusiness
 */
export function generateLocalBusinessSchema(phone?: string, address?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'Deen Elite Auto Ltd',
    url: 'https://deeneliteauto.com',
    telephone: phone || '+44 (0) 123 456 7890',
    address: address || {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address',
      addressLocality: 'Your City',
      addressRegion: 'Your Region',
      postalCode: 'Your Postal Code',
      addressCountry: 'GB',
    },
  }
}

/**
 * Generate Schema.org structured data for Vehicle
 */
export function generateVehicleSchema(vehicle: {
  make: string
  model: string
  year: number
  price: string
  mileage: number
  condition: string
  transmission: string
  fuelType: string
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'MI',
    },
    vehicleCondition: `https://schema.org/${
      vehicle.condition.charAt(0).toUpperCase() + vehicle.condition.slice(1)
    }Condition`,
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'GBP',
    },
  }
}

/**
 * Generate Schema.org structured data for Breadcrumb Navigation
 */
export function generateBreadcrumbSchema(
  items: Array<{
    name: string
    url: string
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate meta tags for a page
 */
export function generatePageMeta(props: {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  twitterHandle?: string
}) {
  const url = props.canonical || 'https://deeneliteauto.com'

  return [
    { title: props.title },
    { name: 'description', content: props.description },
    { property: 'og:title', content: props.title },
    { property: 'og:description', content: props.description },
    { property: 'og:url', content: url },
    ...(props.ogImage ? [{ property: 'og:image', content: props.ogImage }] : []),
    { name: 'twitter:title', content: props.title },
    { name: 'twitter:description', content: props.description },
    ...(props.twitterHandle
      ? [{ name: 'twitter:creator', content: props.twitterHandle }]
      : []),
  ]
}
