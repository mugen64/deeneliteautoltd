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
        name: 'theme-color',
        content: '#ffffff',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'canonical',
        href: typeof window !== 'undefined' ? window.location.href : 'https://deeneliteauto.com',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoDealer',
              name: 'Deen Elite Auto Ltd',
              url: 'https://deeneliteauto.com',
              logo: 'https://deeneliteauto.com/logo.png',
              description: 'Premium used car dealership offering quality vehicles and excellent customer service',
              sameAs: [
                'https://www.facebook.com/deeneliteauto',
                'https://www.twitter.com/deeneliteauto',
                'https://www.instagram.com/deeneliteauto',
              ],
            }),
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
