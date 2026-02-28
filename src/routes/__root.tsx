import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../lib/theme'
import { AuthProvider } from '../contexts/auth'
import { SettingsProvider, type SiteSettings } from '../contexts/settings'
import { PageViewTracker } from '../components/PageViewTracker'

import appCss from '../styles.css?url'
import { getSessionUserFn } from '@/server/auth'

const queryClient = new QueryClient()
const showDevtools = import.meta.env.DEV

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Protect routes starting with /admin
    let user = null
    if (location.pathname.startsWith('/admin')) {
      user = await getSessionUserFn()
      if (!user && location.pathname !== '/admin/login') {
        throw redirect({ to: '/admin/login' })
      }
      if (user && location.pathname === '/admin/login') {
        throw redirect({ to: '/admin' })
      }
    }

    // Skip settings load on server - will be loaded by client via SettingsProvider
    return { user, siteSettings: null }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Deen Elite Auto Ltd',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storageKey = 'deeneliteauto-theme';
                const theme = localStorage.getItem(storageKey) || 'system';
                const root = document.documentElement;
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SettingsProvider>
              <ThemeProvider defaultTheme="system" storageKey="deeneliteauto-theme">
                <PageViewTracker />
                <Header />
                {children}
                <Footer />
                <Toaster richColors closeButton />
                {showDevtools ? (
                  <TanStackDevtools
                    config={{
                      position: 'bottom-right',
                    }}
                    plugins={[
                      {
                        name: 'Deen Elite Auto Ltd Router Devtools',
                        render: <TanStackRouterDevtoolsPanel />,
                      },
                    ]}
                  />
                ) : null}
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
