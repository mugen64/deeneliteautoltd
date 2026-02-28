import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/api/cars/body-types/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const carBodyType = await carStore.getCarBodyTypeById(params.id);
          if (!carBodyType) {
            return Response.json({ error: 'Car body type not found' }, { status: 404 });
          }
          return Response.json(carBodyType);
        } catch (error) {
          console.error('Error fetching car body type:', error);
          return Response.json({ error: 'Failed to fetch car body type' }, { status: 500 });
        }
      },
      DELETE: async ({ params }) => {
        try {
          const carBodyType = await carStore.deleteCarBodyType(params.id);
          if (!carBodyType) {
            return Response.json({ error: 'Car body type not found' }, { status: 404 });
          }
          return Response.json({ success: true, carBodyType });
        } catch (error) {
          console.error('Error deleting car body type:', error);
          return Response.json({ error: 'Failed to delete car body type' }, { status: 500 });
        }
      },
    },
  },
});
