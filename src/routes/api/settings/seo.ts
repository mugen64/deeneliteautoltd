import { settingsStore } from "@/server/storage/db/queries/settings";
import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/server/session";

export const Route = createFileRoute("/api/settings/seo")({
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
          
          const settings = await settingsStore.updateSeoSettings({
            siteTitle: data.siteTitle,
            metaDescription: data.metaDescription,
            seoKeywords: data.seoKeywords,
          });

          return Response.json(settings);
        } catch (error) {
          return Response.json(
            { error: "Failed to update SEO settings" },
            { status: 500 }
          );
        }
      },
    },
  },
});
