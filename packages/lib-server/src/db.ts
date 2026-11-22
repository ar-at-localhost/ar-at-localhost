import { timestamp } from "drizzle-orm/pg-core";

export const timestampCol = () => timestamp({ withTimezone: true });

export const timestampsCols = () => ({
  created_at: timestampCol().notNull().defaultNow(),
  updated_at: timestampCol().notNull().defaultNow(),
  deleted_at: timestampCol(),
});
