import { createFileRoute } from '@tanstack/react-router'
import { RecentlySoldCars } from '@/components/RecentlySoldCars'

export const Route = createFileRoute('/sell-car')({
  component: SellCarPage,
})

function SellCarPage() {
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Sell Your Car</h1>
        <p className="text-lg text-muted-foreground">Coming soon...</p>
      </div>
      <RecentlySoldCars />
    </div>
  )
}
