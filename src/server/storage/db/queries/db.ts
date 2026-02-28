import { env } from "@/env/server";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "../schema"; // your drizzle schema file
import { createServerOnlyFn } from "@tanstack/react-start";


const sql = neon(env.DATABASE_URL!);


const getDatabase = createServerOnlyFn(() =>
  drizzle(sql, {schema})
);

export const db = getDatabase();