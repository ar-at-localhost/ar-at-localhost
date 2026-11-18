import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import pg from "pg";

import { connectsTable } from "./connect.db.ts";
import { leadsTable } from "./lead.db.ts";
import { testimonialRequestsTable } from "./testimonial-request.ts";
import { testimonialsTable } from "./testimonial.ts";
import { userHandlesTable, userKeysTable, usersTable } from "./user.db.ts";

const pool = new pg.Pool({
  connectionString: process.env.DB_URI,
});

const relations = defineRelations(
  {
    connectsTable,
    leadsTable,
    testimonialsTable,
    testimonialRequestsTable,
    usersTable,
    userHandlesTable,
    userKeysTable,
  },
  (r) => ({
    usersTable: {
      handles: r.many.userHandlesTable({
        from: r.usersTable.id,
        to: r.userHandlesTable.user_id,
      }),
      leads: r.many.leadsTable({
        from: r.usersTable.id,
        to: r.leadsTable.user_id,
      }),
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
