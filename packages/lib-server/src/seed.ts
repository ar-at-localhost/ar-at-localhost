import { eq } from "drizzle-orm";
import { reset, seed } from "drizzle-seed";
import { hash as hashPassword } from "node-argon2";

import { connectsTable } from "./connect.ts";
import { isProduction } from "./env.ts";
import { db } from "./pg.ts";
import { testimonialRequestsTable } from "./testimonial-request.ts";
import { testimonialsTable } from "./testimonial.ts";
import { usersTable } from "./user.ts";

const main = async () => {
  if (!isProduction()) {
    await reset(db, {
      connectsTable,
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
  }
};

main();
