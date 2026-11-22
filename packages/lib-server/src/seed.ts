import {
  rand,
  randCompanyName,
  randDomainName,
  randNumber,
  randRole,
  randText,
  randUrl,
} from "@ngneat/falso";
import { eq } from "drizzle-orm";
import { reset, seed } from "drizzle-seed";
import { leadStatuses } from "lib";
import { hash as hashPassword } from "node-argon2";

import { connectsTable } from "./connect.db.ts";
import { isProduction } from "./env.ts";
import { leadsTable } from "./lead.db.ts";
import { db } from "./pg.ts";
import { testimonialRequestsTable } from "./testimonial-request.ts";
import { testimonialsTable } from "./testimonial.ts";
import { usersTable } from "./user.db.ts";

const main = async () => {
  if (!isProduction()) {
    await reset(db, {
      connectsTable,
      leadsTable,
      testimonialRequestsTable: testimonialRequestsTable,
      testimonialsTable: testimonialsTable,
      usersTable,
    });

    await seed(
      db,
      {
        connects: connectsTable,
        testimonialRequests: testimonialRequestsTable,
        testimonials: testimonialsTable,
        users: usersTable,
      },
      {
        seed: Date.now(),
      },
    ).refine((f) => ({
      connects: {
        columns: {
          email: f.email(),
          message: f.loremIpsum({ sentencesCount: 10 }),
        },
        count: 10,
      },
      testimonialRequests: {
        columns: {
          email: f.email(),
          last_name_initial: f.valuesFromArray({ values: ["A", "B", "C", "D"] }),
        },
        count: 10,
      },
      testimonials: {
        columns: {
          last_name_initial: f.valuesFromArray({ values: ["A", "B", "C", "D"] }),
          rating: f.number({ minValue: 1, maxValue: 5 }),
        },
        count: 10,
      },
      users: {
        count: 10,
      },
    }));
  }

  const email = process.env.ADMIN_EMAIL;
  if (email) {
    const [exists] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (exists) return;

    const name = process.env.ADMIN_NAME.split(" ");
    const [first_name, last_name] = [name[0], name.slice(1).join(" ")];
    const hash = await hashPassword(process.env.ADMIN_PASSWORD);

    await db.insert(usersTable).values({
      first_name,
      last_name,
      email,
      hash,
      roles: ["admin"],
    });

    await db.insert(leadsTable).values(
      Array.from({ length: 10 }, (_, i) => {
        const now = new Date();
        return {
          id: i + 1,
          angle: randText({ maxCharCount: 32 }),
          concerns: rand([[], ["Budget unclear"]]),
          company: randCompanyName(),
          contact_role: randRole(),
          created_at: now,
          deleted_at: null,
          domain: `${i + 1}-${randDomainName()}`,
          evidence: rand([[], [{ title: "Careers", url: "https://example.com/careers" }]]),
          fit_reason: randText({ maxCharCount: 32 }),
          fit_score: randNumber({ min: 1, max: 10 }),
          last_seen_at: now,
          matched_repos: rand([[], ["ar-at-localhost/ar-at-localhost"], ["ar-at-localhost/yalms"]]),
          signals: rand([[{ type: "Hiring", summary: "Hiring a backend developer" }]]),
          status: rand(leadStatuses),
          updated_at: now,
          url: randUrl(),
          user_id: 11,
        } satisfies typeof leadsTable.$inferInsert;
      }),
    );
  }
};

main();
