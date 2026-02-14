
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Button } from './ui/button'

export default function Header() {
  const [searchQuery, setSearchQuery] = React.useState('')

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-red-600">
              SHREEVAS <span className="text-foreground">MOTORS</span>
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
            <Button variant="outline" size="default">
              <User className="size-4" />
              Login/Register
            </Button>
          </div>
        </div>
      </header>

     
    </>
  )
}
