import { carStore } from "@/server/storage/db/queries/cars";
import { fileStore } from "@/server/storage/db/queries/files";
import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/body-types/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.id) {
            return Response.json({ error: 'Car body type ID is required' }, { status: 400 });
          }

          const existingBodyType = await carStore.getCarBodyTypeById(data.id);
          if (!existingBodyType) {
            return Response.json({ error: 'Car body type not found' }, { status: 404 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
          }

          const updateData: { name?: string; iconId?: string } = {};
          if (data.name) {
            updateData.name = data.name.trim();
          }

          let iconId = existingBodyType.car_body_types.iconId;
          if (data.icon?.public_id && data.icon?.secure_url) {
            const iconFile = await fileStore.saveFile({
              userId,
              public_id: data.icon.public_id,
              media_url: data.icon.secure_url,
              resource_type: data.icon.resource_type,
              description: `Body type icon: ${data.name || existingBodyType.car_body_types.name}`,
            });
            iconId = iconFile.id;
          }

          if (iconId !== existingBodyType.car_body_types.iconId) {
            updateData.iconId = iconId;
          }

          const carBodyType = await carStore.updateCarBodyType(data.id, updateData);
          return Response.json({ carBodyType });
        } catch (error) {
          console.error('Error updating car body type:', error);
          return Response.json({ error: 'Failed to update car body type' }, { status: 500 });
        }
      },
    },
  },
});
