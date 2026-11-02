import { drizzle } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DB_URI,
});

export const db = drizzle({ client: pool });

export const pgPlugin = fp(async (app) => {
  app.decorate("db", db);
  app.addHook("onClose", async () => {
    await pool.end();
  });
});
