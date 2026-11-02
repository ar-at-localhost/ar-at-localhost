import { UTCDate } from "@date-fns/utc";
import { CloudTasksClient } from "@google-cloud/tasks";
import { addDays, getUnixTime } from "date-fns";
import { eq } from "drizzle-orm";
import { char, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { links } from "lib";

import { createJwtToken } from "./auth.ts";
import { isDev, isCI, getContactPerson } from "./env.ts";
import { sendMail } from "./mailer/index.ts";
import { db } from "./pg.ts";
import { timestamps } from "./schema.ts";
import {
  renderTestimonialRequestTemplate,
  renderTestimonialRequestTextTemplate,
} from "./templates/testimonial-request.ts";

export const testimonialRequestsTable = pgTable("testimonial_requests", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  first_name: varchar({ length: 64 }).notNull(),
  last_name_initial: char({ length: 1 }),
  email: varchar({ length: 256 }).notNull(),
  company: varchar({ length: 64 }).notNull(),
  expiry: timestamp({ withTimezone: true }).$defaultFn(() => addDays(new UTCDate(), 30)),
  ...timestamps,
});

export const enqueueTestimonialRequest = async (id: number) => {
  const { TF_VAR_project_name, TF_VAR_region, SRV_INT_URL } = process.env;
  if (isDev() || isCI() || !SRV_INT_URL) return testimonialRequestMail(id).catch(console.error);

  const client = new CloudTasksClient();

  const [task] = await client.createTask({
    parent: client.queuePath(
      TF_VAR_project_name!,
      TF_VAR_region!,
      `${TF_VAR_project_name!}-testimonial-request`,
    ),

    task: {
      httpRequest: {
        httpMethod: "POST",
        url: `${SRV_INT_URL}/testimonial/request/${id}`,
      },
    },
  });

  return task.name ?? undefined;
};

export const testimonialRequestMail = async (id: number) => {
  const [request] = await db
    .select()
    .from(testimonialRequestsTable)
    .where(eq(testimonialRequestsTable.id, id))
    .limit(1);

  if (!request) throw new Error("No such testimonial request!");

  const token = await createJwtToken({
    sub: request.id.toString(),
    aud: "testimonial",
    exp: getUnixTime(addDays(new UTCDate(), 30)),
  });

  const tokenb64 = Buffer.from(token).toString("base64");
  const { PUBLIC_SITE_URL, CONTACT_PERSON_NAME } = process.env;

  const data = {
    first_name: request.first_name,
    links: {
      ...links,
      cta: `${PUBLIC_SITE_URL}/testimonial?token=${tokenb64}`,
    },
  };

  await sendMail({
    subject: `${CONTACT_PERSON_NAME} - Request for feedback`,
    to: [request.email],
    cc: [getContactPerson()].filter((i) => !!i) as string[],
    text: await renderTestimonialRequestTextTemplate(data),
    html: await renderTestimonialRequestTemplate(data),
  });
};
