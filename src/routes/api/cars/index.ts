import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/')({
  server: {
    handlers: {
      GET: async () => {
        console.log('Fetching car makes...') // Debug log
        try {
          const carMakes = await carStore.getCarMakes();
          return Response.json(carMakes);
        } catch (error) {
          console.error('Error fetching car makes:', error);
          return Response.json({ error: 'Failed to fetch car makes' }, { status: 500 });
        }
      },
    },
  },
})
