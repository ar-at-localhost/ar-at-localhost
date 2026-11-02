import { sql } from "drizzle-orm";
import { char, check, integer, numeric, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./schema.ts";

export const testimonialsTable = pgTable(
  "testimonials",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    first_name: varchar({ length: 64 }).notNull(),
    last_name_initial: char({ length: 1 }),
    company: varchar({ length: 32 }).notNull(),
    rating: numeric({ precision: 2, scale: 1 }),
    testimonial: text().notNull(),
    ...timestamps,
  },
  (table) => [
    check("testimonials_rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);
