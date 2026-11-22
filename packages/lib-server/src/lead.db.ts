import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { leadStatuses, type LeadStatus } from "lib";

import { timestampCol, timestampsCols } from "./db.ts";
import { usersTable } from "./user.db.ts";

export const leadStatusSet: Set<LeadStatus> = new Set(leadStatuses);
export const leadStatusEnum = pgEnum("lead_status", leadStatuses);

export const leadsTable = pgTable(
  "leads",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),

    user_id: integer()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    company: varchar({ length: 256 }).notNull(),
    domain: varchar({ length: 256 }).notNull(),
    url: text(),
    contact_role: varchar({ length: 256 }),
    status: leadStatusEnum().notNull().default("new"),
    angle: text().notNull(),
    fit_score: smallint().notNull(),
    fit_reason: text().notNull(),
    signals: jsonb().$type<{ type: string; summary: string }[]>().notNull(),
    evidence: jsonb().$type<{ title?: string; url: string }[]>().notNull().default([]),
    matched_repos: jsonb().$type<string[]>().notNull().default([]),
    concerns: jsonb().$type<string[]>().notNull().default([]),
    reject_reason: text(),
    snooze_until: timestampCol(),
    notes: text(),

    last_seen_at: timestampCol().notNull(),
    ...timestampsCols(),
  },
  (t) => [
    uniqueIndex("lead_user_domain").on(t.user_id, t.domain),
    index("lead_user_status").on(t.user_id, t.status),
  ],
);
