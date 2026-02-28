import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/models/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.id) {
            return Response.json({ error: 'Car model ID is required' }, { status: 400 });
          }

          const existingModel = await carStore.getCarModelById(data.id);
          if (!existingModel) {
            return Response.json({ error: 'Car model not found' }, { status: 404 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const updateData: { name?: string; makeId?: string } = {};
          if (data.name) {
            updateData.name = data.name.trim();
          }
          if (data.makeId) {
            updateData.makeId = data.makeId;
          }

          const carModel = await carStore.updateCarModel(data.id, updateData);

          return Response.json({ carModel });
        } catch (error) {
          console.error('Error updating car model:', error);
          return Response.json({ error: 'Failed to update car model' }, { status: 500 });
        }
      },
    },
  },
})
