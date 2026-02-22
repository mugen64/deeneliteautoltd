import { carStore } from "@/server/storage/db/cars";
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/cars/models/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const carModels = await carStore.getCarModels();
          return json(carModels);
        } catch (error) {
          console.error('Error fetching car models:', error);
          return json({ error: 'Failed to fetch car models' }, { status: 500 });
        }
      },
    },
  },
})
