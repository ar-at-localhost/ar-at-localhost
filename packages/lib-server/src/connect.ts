import { CloudTasksClient } from "@google-cloud/tasks";
import { eq } from "drizzle-orm";
import { links } from "lib";

import { connectsTable } from "./connect.db.ts";
import { getContactPerson, isCI, isDev } from "./env.ts";
import { sendMail } from "./mailer/index.ts";
import { db } from "./pg.ts";
import { renderConnectTemplate, renderConnectTextTemplate } from "./templates/connect.ts";

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
      `${TF_VAR_project_name!}-post-connect`,
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
