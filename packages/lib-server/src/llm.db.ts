import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { LLMInput } from "lib";

import { timestampsCols } from "./db.ts";
import { usersTable } from "./user.db.ts";

export const llmProviderTable = pgTable("llm_provider", {
  id: varchar("id", { length: 128 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  ...timestampsCols(),
});

export const llmTable = pgTable(
  "llms",
  {
    provider: varchar({ length: 128 })
      .notNull()
      .references(() => llmProviderTable.id, { onDelete: "cascade" }),

    id: varchar({ length: 128 }).notNull(),
    enabled: boolean().notNull().default(true),
    ...timestampsCols(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.id] })],
);

export const llmConfigTable = pgTable("llm_configs", {
  user_id: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  label: varchar({ length: 128 }).notNull().default("None"),
  enabled: boolean().notNull().default(true),
  temperature: real(),
  max_input_tokens: integer(),
  max_output_tokens: integer(),
  inputs: jsonb().$type<LLMInput[]>().default([]),
  ...timestampsCols(),
});

export const llmConfigProviderTable = pgTable(
  "llm_config_providers",
  {
    config: uuid()
      .notNull()
      .references(() => llmConfigTable.uuid, { onDelete: "cascade" }),

    provider: varchar({ length: 128 })
      .notNull()
      .references(() => llmProviderTable.id, { onDelete: "restrict" }),

    priority: integer().notNull().default(0),
    ...timestampsCols(),
  },
  (t) => [primaryKey({ columns: [t.config, t.provider] })],
);

export const llmConfigModelTable = pgTable(
  "llm_config_models",
  {
    config: uuid().notNull(),
    provider: varchar({ length: 128 }).notNull(),
    model: varchar({ length: 128 }).notNull(),
    priority: integer().notNull().default(0),
    ...timestampsCols(),
  },
  (t) => [
    primaryKey({ columns: [t.config, t.provider, t.model] }),

    foreignKey({
      columns: [t.config, t.provider],
      foreignColumns: [llmConfigProviderTable.config, llmConfigProviderTable.provider],
    }).onDelete("cascade"),

    foreignKey({
      columns: [t.provider, t.model],
      foreignColumns: [llmTable.provider, llmTable.id],
    }).onDelete("restrict"),
  ],
);

export type LLMConfigModel = InferSelectModel<typeof llmConfigModelTable>;
