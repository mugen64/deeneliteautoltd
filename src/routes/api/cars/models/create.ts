import { carStore } from "@/server/storage/db/queries/cars";
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/models/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.name || typeof data.name !== 'string') {
            return Response.json({ error: 'Name is required' }, { status: 400 });
          }

          if (!data.makeId || typeof data.makeId !== 'string') {
            return Response.json({ error: 'Make ID is required' }, { status: 400 });
          }

          const name = data.name?.trim();
          if (!name) {
            return Response.json({ error: 'Model name is required' }, { status: 400 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const carModel = await carStore.createCarModel({
            name,
            makeId: data.makeId,
          });

          return Response.json({ carModel }, { status: 201 });
        } catch (error) {
          console.error('Error creating car model:', error);
          return Response.json({ error: 'Failed to create car model' }, { status: 500 });
        }
      },
    },
  },
})
