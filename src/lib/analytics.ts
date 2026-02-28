/**
 * Client-side analytics tracking utilities
 */

function postAnalytics(url: string, payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload)

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
      return
    }

    void fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    })
  } catch (error) {
    console.error('Failed to send analytics:', error)
  }
}

export async function trackPageView(pagePath: string) {
  try {
    postAnalytics('/api/analytics/page-view', { pagePath })
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics failures
    console.error('Failed to track page view:', error)
  }
}

export async function trackCarView(carId: string) {
  try {
    postAnalytics('/api/analytics/car-view', { carId })
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics failures
    console.error('Failed to track car view:', error)
  }
}
