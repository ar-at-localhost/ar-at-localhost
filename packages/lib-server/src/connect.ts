import { CloudTasksClient } from "@google-cloud/tasks";
import { eq } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { links } from "lib";

import { getContactPerson, isCI, isDev } from "./env.ts";
import { sendMail } from "./mailer/index.ts";
import { db } from "./pg.ts";
import { timestamps } from "./schema.ts";
import { renderConnectTemplate, renderConnectTextTemplate } from "./templates/connect.ts";

export const connectsTable = pgTable("connects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 128 }).notNull(),
  last_name: varchar({ length: 128 }),
  email: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  ...timestamps,
});

export const connectMail = async (id: number) => {
  const [connect] = await db.select().from(connectsTable).where(eq(connectsTable.id, id)).limit(1);
  if (!connect) throw new Error("No such connect!");

  const data = {
    first_name: connect.first_name,
    links,
  };

  await sendMail({
    subject: "Thank you for submitting project brief!",
    to: [connect.email],
    cc: [getContactPerson()].filter((i) => !!i) as string[],
    text: await renderConnectTextTemplate(data),
    html: await renderConnectTemplate(data),
  });
};

export const enqueueConnect = async (id: number) => {
  const { TF_VAR_project_name, TF_VAR_region, SRV_INT_URL } = process.env;
  if (isDev() || isCI() || !SRV_INT_URL) return connectMail(id).catch(() => undefined);

  const client = new CloudTasksClient();

  const [task] = await client.createTask({
    parent: client.queuePath(
      TF_VAR_project_name!,
      TF_VAR_region!,
      `${TF_VAR_project_name!}-connect`,
    ),

    task: {
      httpRequest: {
        httpMethod: "POST",
        url: `${SRV_INT_URL}/connect/${id}`,
      },
    },
  });

  return task.name ?? undefined;
};
