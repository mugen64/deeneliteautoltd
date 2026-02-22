import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/models/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const carModel = await carStore.getCarModelById(params.id);
          if (!carModel) {
            return Response.json({ error: 'Car model not found' }, { status: 404 });
          }
          return Response.json(carModel);
        } catch (error) {
          console.error('Error fetching car model:', error);
          return Response.json({ error: 'Failed to fetch car model' }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        try {
          const carModel = await carStore.deleteCarModel(params.id);
          if (!carModel) {
            return Response.json({ error: 'Car model not found' }, { status: 404 });
          }
          return Response.json({ success: true, carModel });
        } catch (error) {
          console.error('Error deleting car model:', error);
          return Response.json({ error: 'Failed to delete car model' }, { status: 500 });
        }
      },
    },
  },
})
