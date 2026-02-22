import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Header from '../components/Header'
import { ThemeProvider } from '../lib/theme'
import { AuthProvider } from '../contexts/auth'

import appCss from '../styles.css?url'
import { getSessionUserFn } from '@/server/auth'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    // Protect routes starting with /admin
    if (location.pathname.startsWith('/admin')) {
      const user = await getSessionUserFn()
      if (!user && location.pathname !== '/admin/login') {
        throw redirect({ to: '/admin/login' })
      }
      if (user && location.pathname === '/admin/login') {
        throw redirect({ to: '/admin' })
      }
      return {user}
    }
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
            <ThemeProvider defaultTheme="system" storageKey="deeneliteauto-theme">
              <Header />
              
              {children}
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
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
