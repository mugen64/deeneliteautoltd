import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/api/cars/body-types/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const carBodyTypes = await carStore.getCarBodyTypes();
          return Response.json(carBodyTypes);
        } catch (error) {
          console.error('Error fetching car body types:', error);
          return Response.json({ error: 'Failed to fetch car body types' }, { status: 500 });
        }
      },
    },
  },
});
