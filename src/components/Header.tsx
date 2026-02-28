
import { User, Moon, Sun, Monitor } from 'lucide-react'
import React from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Button } from './ui/button'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/contexts/auth'
import { logoutFn } from '@/server/auth'

export default function Header() {
  const { setTheme } = useTheme()
  const { user } = useAuth()
  const logout = useServerFn(logoutFn)

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-mds font-black">
              <Link to="/">
                DEEN <span className="font-bold">ELITE AUTO LTD</span>
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost">Inventory</Button>
            </Link>

            <Link to="/sell-car">
              <Button variant="ghost">Sell Your Car</Button>
            </Link>
            
            <Link to="/submit-enquiry">
              <Button variant="ghost">Submit Your Enquiry</Button>
            </Link>
            
            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="size-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="size-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="size-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(
                    <Button variant="outline" size="default">
                      <User className="size-4" />
                      Admin
                    </Button>
                  )}
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/admin" className="w-full">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      try { 
                        await logout()
                        location.href = '/admin' // Redirect to login page after logout
                      } catch (err) {
                        throw err
                      }
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

     
    </>
  )
}
