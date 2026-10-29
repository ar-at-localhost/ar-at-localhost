import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./schema.ts";

export const connectsTable = pgTable("connects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar({ length: 128 }).notNull(),
  lastName: varchar({ length: 128 }),
  email: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  ...timestamps,
});
