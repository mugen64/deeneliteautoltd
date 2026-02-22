import { carStore } from "@/server/storage/db/cars";
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/models/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.name || typeof data.name !== 'string') {
            return json({ error: 'Name is required' }, { status: 400 });
          }

          if (!data.makeId || typeof data.makeId !== 'string') {
            return json({ error: 'Make ID is required' }, { status: 400 });
          }

          const name = data.name?.trim();
          if (!name) {
            return json({ error: 'Model name is required' }, { status: 400 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return json({ error: 'Not authenticated' }, { status: 401 });
          }

          const carModel = await carStore.createCarModel({
            name,
            makeId: data.makeId,
          });

          return json({ carModel }, { status: 201 });
        } catch (error) {
          console.error('Error creating car model:', error);
          return json({ error: 'Failed to create car model' }, { status: 500 });
        }
      },
    },
  },
})
