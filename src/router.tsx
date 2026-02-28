import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const DefaultNotFound = () => (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Not Found</h1>
      <p style={{ marginTop: 8 }}>The page you requested could not be found.</p>
    </div>
  )

  const router = createTanStackRouter({
    routeTree,
    defaultNotFoundComponent: DefaultNotFound,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
