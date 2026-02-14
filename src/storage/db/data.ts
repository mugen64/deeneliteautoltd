import { neon } from "@neondatabase/serverless";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";


export const getServerVersion = createServerFn({ method: "GET" })
.middleware([staticFunctionMiddleware])
.handler(async () => {
  const sql = neon(process.env.DATABASE_URL||"");
  const response = await sql`SELECT version()`;

  return response[0].version;
});