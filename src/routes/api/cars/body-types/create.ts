import { carStore } from "@/server/storage/db/queries/cars";
import { fileStore } from "@/server/storage/db/queries/files";
import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/body-types/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.name || typeof data.name !== 'string') {
            return Response.json({ error: 'Name is required' }, { status: 400 });
          }

          if (!data.icon || typeof data.icon !== 'object') {
            return Response.json({ error: 'Icon is required' }, { status: 400 });
          }

          const name = data.name?.trim();
          if (!name) {
            return Response.json({ error: 'Body type name is required' }, { status: 400 });
          }

          if (!data.icon?.public_id || !data.icon?.secure_url) {
            return Response.json({ error: 'Icon is required' }, { status: 400 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const iconFile = await fileStore.saveFile({
            userId,
            public_id: data.icon.public_id,
            media_url: data.icon.secure_url,
            resource_type: data.icon.resource_type,
            description: `Body type icon: ${name}`,
          });

          const carBodyType = await carStore.createCarBodyType({ name, iconId: iconFile.id });
          return Response.json({ carBodyType }, { status: 201 });
        } catch (error) {
          console.error('Error creating car body type:', error);
          return Response.json({ error: 'Failed to create car body type' }, { status: 500 });
        }
      },
    },
  },
});
