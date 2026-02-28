import { settingsStore } from "@/server/storage/db/queries/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/settings/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const settings = await settingsStore.getSettings();
          return Response.json(settings);
        } catch (error) {
          return Response.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
          );
        }
      },
    },
  },
});
