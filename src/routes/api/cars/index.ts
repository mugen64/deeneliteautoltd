import { carStore } from "@/server/storage/db/cars";
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/cars/')({
  server: {
    handlers: {
      GET: async () => {
        console.log('Fetching car makes...') // Debug log
        try {
          const carMakes = await carStore.getCarMakes();
          return json(carMakes);
        } catch (error) {
          console.error('Error fetching car makes:', error);
          return json({ error: 'Failed to fetch car makes' }, { status: 500 });
        }
      },
    },
  },
})
