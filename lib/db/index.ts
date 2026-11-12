import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof makeDb> };

function makeDb() {
  const authToken = env().DATABASE_AUTH_TOKEN;
  const client = createClient({
    url: env().DATABASE_URL,
    ...(authToken ? { authToken } : {}),
  });
  return drizzle(client, { schema });
}

/** Single shared connection (survives Next.js dev hot reloads). */
export const db = globalForDb.db ?? makeDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export { schema };
