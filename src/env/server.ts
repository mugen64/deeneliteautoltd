import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    
    VITE_BASE_URL: z.string().url().default("http://localhost:8080"),
    
    ADMIN_LOGIN: z.string().email().optional(),
    SESSION_SECRET: z.string().min(32),

    CLOUDINARY_URL: z.string().url().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
  },
  runtimeEnv: process.env,
});