import { carStore } from "@/server/storage/db/cars";
import { fileStore } from "@/server/storage/db/files";
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.name || typeof data.name !== 'string') {
            return json({ error: 'Name is required' }, { status: 400 });
          }

          if (!data.logo || typeof data.logo !== 'object') {
            return json({ error: 'Logo is required' }, { status: 400 });
          }

          const name = data.name?.trim();
          if (!name) {
            return json({ error: 'Make name is required' }, { status: 400 });
          }

          if (!data.logo?.public_id || !data.logo?.secure_url) {
            return json({ error: 'Logo is required' }, { status: 400 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return json({ error: 'Not authenticated' }, { status: 401 });
          }

          const logoFile = await fileStore.saveFile({
            userId,
            public_id: data.logo.public_id,
            media_url: data.logo.secure_url,
            resource_type: data.logo.resource_type,
            description: `Car make logo: ${data.name}`,
          });

          const carMake = await carStore.createCarMake({
            name,
            logoId: logoFile.id,
          });

          return json({ carMake }, { status: 201 });
        } catch (error) {
          console.error('Error creating car make:', error);
          return json({ error: 'Failed to create car make' }, { status: 500 });
        }
      },
    },
  },
})
