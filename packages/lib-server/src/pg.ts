import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import pg from "pg";

import { connectsTable } from "./connect.db.ts";
import { testimonialRequestsTable } from "./testimonial-request.ts";
import { testimonialsTable } from "./testimonial.ts";
import { userKeysTable, usersTable } from "./user.db.ts";

const pool = new pg.Pool({
  connectionString: process.env.DB_URI,
});

const relations = defineRelations(
  {
    connectsTable,
    testimonialsTable,
    testimonialRequestsTable,
    usersTable,
    userKeysTable,
  },
  (r) => ({
    usersTable: {
      keys: r.many.userKeysTable({
        from: r.usersTable.id,
        to: r.userKeysTable.user_id,
      }),
    },
  }),
);

export const db = drizzle({ client: pool, relations });

export const pgPlugin = fp(async (app) => {
  app.decorate("db", db);
  app.addHook("onClose", async () => {
    await pool.end();
  });
});
