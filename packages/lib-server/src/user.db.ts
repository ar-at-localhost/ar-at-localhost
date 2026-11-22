import { type InferSelectModel } from "drizzle-orm";
import { integer, pgEnum, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userHandles, userKeys } from "lib";

import { timestampsCols } from "./db.ts";

export const rolesEnum = pgEnum("roles", ["admin", "system", "unknown"]);
export type UserRole = (typeof rolesEnum.enumValues)[number];

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  first_name: varchar({ length: 64 }).notNull(),
  last_name: varchar({ length: 64 }).notNull(),
  email: varchar({ length: 256 }).notNull(),
  hash: varchar({ length: 256 }),
  roles: rolesEnum().array().notNull().default(["unknown"]),
  ...timestampsCols(),
});

export type UserRecord = InferSelectModel<typeof usersTable>;

export const userKeysEnum = pgEnum("user_key_type", userKeys);
export type UserKeys = (typeof userKeysEnum.enumValues)[number];
export type UserKeyRecord = InferSelectModel<typeof userKeysTable>;

export const userKeysTable = pgTable(
  "user_keys",
  {
    user_id: integer()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    type: userKeysEnum().notNull(),
    key: varchar({ length: 512 }),
    ...timestampsCols(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.type] })],
);

export const userHandlesEnum = pgEnum("user_handle_type", userHandles);
export type UserHandles = (typeof userHandlesEnum.enumValues)[number];

export const userHandlesTable = pgTable(
  "user_handles",
  {
    user_id: integer()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    type: userHandlesEnum().notNull(),
    handle: varchar({ length: 256 }),
    ...timestampsCols(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.type] })],
);
