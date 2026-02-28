import { carStore } from "@/server/storage/db/queries/cars";
import { fileStore } from "@/server/storage/db/queries/files";
import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from "@/server/session";

export const Route = createFileRoute('/api/cars/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();

          if (!data.id) {
            return Response.json({ error: 'Car make ID is required' }, { status: 400 });
          }

          const existingMake = await carStore.getCarMakeById(data.id);
          if (!existingMake) {
            return Response.json({ error: 'Car make not found' }, { status: 404 });
          }

          const session = await useAppSession();
          const userId = session.data.userId;
          if (!userId) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
          }

          let logoId = existingMake.car_makes.logoId;

          if (data.logo?.public_id && data.logo?.secure_url) {
            const logoFile = await fileStore.saveFile({
              userId,
              public_id: data.logo.public_id,
              media_url: data.logo.secure_url,
              resource_type: data.logo.resource_type,
              description: `Car make logo: ${data.name || existingMake.car_makes.name}`,
            });
            logoId = logoFile.id;
          }

          const updateData: { name?: string; logoId?: string } = {};
          if (data.name) {
            updateData.name = data.name.trim();
          }
          if (logoId !== existingMake.car_makes.logoId) {
            updateData.logoId = logoId;
          }

          const carMake = await carStore.updateCarMake(data.id, updateData);

          return Response.json({ carMake });
        } catch (error) {
          console.error('Error updating car make:', error);
          return Response.json({ error: 'Failed to update car make' }, { status: 500 });
        }
      },
    },
  },
})
