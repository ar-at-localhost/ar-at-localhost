import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { timestampsCols } from "./db.ts";

export const connectsTable = pgTable("connects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 128 }).notNull(),
  last_name: varchar({ length: 128 }),
  email: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  ...timestampsCols(),
});
