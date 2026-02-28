import { settingsStore } from "@/server/storage/db/queries/settings";
import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/server/session";

export const Route = createFileRoute("/api/settings/location-contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await useAppSession();
          const userId = session.data.userId;
          
          if (!userId) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
          }

          const data = await request.json();
          
          const settings = await settingsStore.updateLocationAndContact({
            address: data.address,
            phoneNumber: data.phoneNumber,
            emailAddress: data.emailAddress,
            businessHours: data.businessHours,
          });

          return Response.json(settings);
        } catch (error) {
          return Response.json(
            { error: "Failed to update location and contact information" },
            { status: 500 }
          );
        }
      },
    },
  },
});
