import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FeatureTab } from './components/-feature-tab'
import { HistoryChecklistTab } from './components/-history-checklist-tab'
import { InventoryTab } from './components/-inventory-tab'

export const Route = createFileRoute('/admin/console/car-inventory/')({
  component: RouteComponent,
  validateSearch: (search) => {
    const tab =
      typeof search.tab === 'string' &&
        (search.tab === 'inventory' || search.tab === 'features' || search.tab === 'history')
        ? search.tab
        : 'inventory'
    return { tab }
  },
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/admin/console" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Car Inventory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({
            search: { tab: value as 'inventory' | 'features' | 'history' },
            replace: true,
          })
        }
      >
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="history">History Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="features">
          <FeatureTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryChecklistTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
