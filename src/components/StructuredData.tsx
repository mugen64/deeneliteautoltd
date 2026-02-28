import type { ReactNode } from 'react'

interface StructuredDataProps {
  data: Record<string, any>
  children?: ReactNode
}

/**
 * Component to inject JSON-LD structured data into the page
 * Place this in your page component's head or use with TanStack Router's head function
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

/**
 * Hook to generate structured data meta tag for TanStack Router head() function
 */
export function useStructuredData(data: Record<string, any>) {
  return {
    scripts: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      },
    ],
  }
}
