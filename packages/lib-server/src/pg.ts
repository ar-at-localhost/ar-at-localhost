import pg from "pg";
import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/node-postgres";

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
