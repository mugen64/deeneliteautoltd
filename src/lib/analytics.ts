/**
 * Client-side analytics tracking utilities
 */

export async function trackPageView(pagePath: string) {
  try {
    await fetch(`/api/analytics/page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pagePath }),
    })
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics failures
    console.error('Failed to track page view:', error)
  }
}

export async function trackCarView(carId: string) {
  try {
    await fetch(`/api/analytics/car-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ carId }),
    })
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics failures
    console.error('Failed to track car view:', error)
  }
}
