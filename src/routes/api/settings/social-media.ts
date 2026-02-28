import { settingsStore } from "@/server/storage/db/queries/settings";
import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/server/session";

export const Route = createFileRoute("/api/settings/social-media")({
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
          
          const settings = await settingsStore.updateSocialMedia({
            facebookUrl: data.facebookUrl,
            twitterUrl: data.twitterUrl,
            instagramUrl: data.instagramUrl,
            linkedinUrl: data.linkedinUrl,
          });

          return Response.json(settings);
        } catch (error) {
          return Response.json(
            { error: "Failed to update social media links" },
            { status: 500 }
          );
        }
      },
    },
  },
});
