import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cars/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const carMake = await carStore.getCarMakeById(params.id);
          if (!carMake) {
            return Response.json({ error: 'Car make not found' }, { status: 404 });
          }
          return Response.json(carMake);
        } catch (error) {
          console.error('Error fetching car make:', error);
          return Response.json({ error: 'Failed to fetch car make' }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        try {
          const carMake = await carStore.deleteCarMake(params.id);
          if (!carMake) {
            return Response.json({ error: 'Car make not found' }, { status: 404 });
          }
          return Response.json({ success: true, carMake });
        } catch (error) {
          console.error('Error deleting car make:', error);
          return Response.json({ error: 'Failed to delete car make' }, { status: 500 });
        }
      },
    },
  },
})
