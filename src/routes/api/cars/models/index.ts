import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/models/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const carModels = await carStore.getCarModels();
          return Response.json(carModels);
        } catch (error) {
          console.error('Error fetching car models:', error);
          return Response.json({ error: 'Failed to fetch car models' }, { status: 500 });
        }
      },
    },
  },
})
