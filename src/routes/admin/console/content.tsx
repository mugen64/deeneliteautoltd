import { createFileRoute } from '@tanstack/react-router'
import { Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/console/content')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Content Management</h1>
        <p className="text-muted-foreground mt-2">Manage your website content and pages</p>
      </div>

      <Card>
        <CardContent className="pt-20 pb-20 flex flex-col items-center justify-center text-center">
          <Zap className="size-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            Content management features are under development. Check back soon for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
