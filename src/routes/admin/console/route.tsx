import { getSessionUserFn, logoutFn } from '@/server/auth'
import { Outlet, createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { 
  Home, 
  Car, 
  Wrench, 
  Users, 
  FileText, 
  FileStack, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/admin/console')({
  // Optional: protect the whole dashboard
  beforeLoad: async ({ context }) => {
    if ('user' in context) {
      return { user: context.user }
    }
    return {
      user: await getSessionUserFn()
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const router = useRouter()

  const handleLogout = async () => {
    await logoutFn()
    router.navigate({ to: '/admin/login' })
  }

  const navItems = [
    { to: '/admin/console', label: 'Dashboard', icon: Home },
    { to: '/admin/console/car-inventory', label: 'Car Inventory', icon: Car },
    { to: '/admin/console/car-models', label: 'Car Models', icon: Wrench },
    { to: '/admin/console/user-management', label: 'User Management', icon: Users },
    { to: '/admin/console/contact-forms', label: 'Contact Forms', icon: FileText },
    { to: '/admin/console/content', label: 'Content', icon: FileStack },
    { to: '/admin/console/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/console/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      {/* Mobile floating menu button */}
      <div className="fixed left-4 bottom-4 z-20 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="icon" className="h-12 w-12 rounded-full shadow-lg" />}>
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open admin menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            {navItems.map((item) => (
              <DropdownMenuItem key={item.to}>
                <Link to={item.to} className="w-full flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r lg:flex">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
              activeProps={{
                className: 'flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm'
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t ">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}
