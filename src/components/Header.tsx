
import { Search, User, Moon, Sun, Monitor } from 'lucide-react'
import { Input } from '@/components/ui/input'
import React from 'react'
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

export default function Header() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const { setTheme } = useTheme()
  const { user } = useAuth()

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black">
              DEEN <span className="font-bold">ELITE AUTO LTD</span>
            </h1>
          </div>

          <div className="flex flex-1 max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="text"
                placeholder="Type Car name or Brand"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost">Sell Your Car</Button>
            <Button variant="ghost">Submit Your Enquiry</Button>
            
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
              <Link to="/admin">
                <Button variant="outline" size="default">
                  <User className="size-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

     
    </>
  )
}
