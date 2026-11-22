import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import pg from "pg";

import { connectsTable } from "./connect.db.ts";
import { leadsTable } from "./lead.db.ts";
import {
  llmConfigModelTable,
  llmConfigProviderTable,
  llmConfigTable,
  llmProviderTable,
  llmTable,
} from "./llm.db.ts";
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
    llmTable,
    llmConfigTable,
    llmConfigProviderTable,
    llmConfigModelTable,
    llmProviderTable,
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
      llmConfigs: r.many.llmConfigTable({
        from: r.usersTable.id,
        to: r.llmConfigTable.user_id,
      }),
      keys: r.many.userKeysTable({
        from: r.usersTable.id,
        to: r.userKeysTable.user_id,
      }),
    },

    llmConfigTable: {
      llmProviders: r.many.llmConfigProviderTable({
        from: r.llmConfigTable.uuid,
        to: r.llmConfigProviderTable.config,
      }),
    },

    llmConfigProviderTable: {
      llms: r.many.llmConfigModelTable({
        from: [r.llmConfigProviderTable.config, r.llmConfigProviderTable.provider],
        to: [r.llmConfigModelTable.config, r.llmConfigModelTable.provider],
      }),

      llmProvider: r.one.llmProviderTable({
        from: r.llmConfigProviderTable.provider,
        to: r.llmProviderTable.id,
        optional: false,
      }),
    },

    llmConfigModelTable: {
      llm: r.one.llmTable({
        from: [r.llmConfigModelTable.provider, r.llmConfigModelTable.model],
        to: [r.llmTable.provider, r.llmTable.id],
        optional: false,
      }),
    },
  }),
);

export const db = drizzle({ client: pool, relations });
export type DB = typeof db;

export const pgPlugin = fp(async (app) => {
  app.decorate("db", db);
  app.addHook("onClose", async () => {
    await pool.end();
  });
});
