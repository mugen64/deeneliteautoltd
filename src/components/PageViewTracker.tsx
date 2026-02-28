import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import { trackPageView } from '@/lib/analytics'

/**
 * PageViewTracker component for non-intrusive analytics tracking
 * - Tracks page views on route changes
 * - Excludes admin pages (tracked separately if needed)
 * - Excludes car details pages (tracked separately in car views)
 * - Silently fails without disrupting user experience
 */
export function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname

    // Don't track admin pages
    if (path.startsWith('/admin')) {
      return
    }

    // Don't track car details pages (already tracked in car views)
    // Pattern: /cars/make-slug/model-slug/car-id
    const carDetailsPattern = /^\/cars\/[^/]+\/[^/]+\/[^/]+$/
    if (carDetailsPattern.test(path)) {
      return
    }

    // Track in next tick to avoid blocking render
    setTimeout(() => {
      trackPageView(path)
    }, 0)
  }, [location.pathname])

  // This component renders nothing
  return null
}
