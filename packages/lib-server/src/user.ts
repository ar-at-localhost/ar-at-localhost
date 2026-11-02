import type { InferSelectModel } from "drizzle-orm";
import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./schema.ts";

export const rolesEnum = pgEnum("roles", ["admin", "system", "unknown"]);
export type UserRole = (typeof rolesEnum.enumValues)[number];

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  first_name: varchar({ length: 64 }).notNull(),
  last_name: varchar({ length: 64 }).notNull(),
  email: varchar({ length: 256 }).notNull(),
  hash: varchar({ length: 256 }),
  roles: rolesEnum().array().notNull().default(["unknown"]),
  ...timestamps,
});

export type UserRecord = InferSelectModel<typeof usersTable>;
