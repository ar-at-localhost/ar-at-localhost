import { UTCDate } from "@date-fns/utc";
import { CloudTasksClient } from "@google-cloud/tasks";
import { getISOWeek, getISOWeekYear } from "date-fns";
import type { FastifyPluginAsync } from "fastify";
import { type ContentBody, contentSchema, createLeadSchema, type Lead, type OkResp } from "lib";
import {
  db,
  getFile,
  getFindLeadsLLM,
  getJdToLeadLLM,
  getSyncPortfolioLLM,
  getUserInfo,
  okSchema,
  runLLM,
  type ServerAPIErr,
  serverErrSchema,
  type SyncPortfolioParams,
  tooManyRequestsErrorSchema,
  userParamSchema,
} from "lib-server";

const { TF_VAR_project_name, TF_VAR_region, SRV_INT_URL } = process.env;

export const leadsRest: FastifyPluginAsync = async (app) => {
  app.post("/find/:user", {
    schema: {
      params: userParamSchema,

      response: {
        200: okSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user = await getUserInfo((req.params as SyncPortfolioParams).user);
      if (!user) throw new Error("No such user!");
      const llm = await getFindLeadsLLM(db, user!);
      const result = await runLLM(llm);
      await getFile(`users/${user.id}/llm/leads.json`).save(JSON.stringify(result));
      rep.status(200).send({ message: "Leads results have been saved successfully!" });
    },
  });

  app.post("/from-jd/:user", {
    schema: {
      body: contentSchema,

      response: {
        200: createLeadSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user = await getUserInfo((req.params as SyncPortfolioParams).user);
      const body = req.body as ContentBody;
      if (!user) throw new Error("No such user!");

      const llm = await getJdToLeadLLM(db, user!, {
        "Job Description": body.content,
      });

      const result = await runLLM(llm);

      let lead: Lead | undefined = undefined;
      try {
        lead = JSON.parse(result || "");

        rep.status(200).send(lead);
      } catch (err) {
        req.log.error(err);
        throw err;
      }
    },
  });

  app.post("/portfolio/sync/:user", {
    schema: {
      params: userParamSchema,

      response: {
        200: okSchema,
      },
    },

    handler: async (req, rep) => {
      const user = await getUserInfo((req.params as SyncPortfolioParams).user);
      if (!user) throw new Error("No such user!");
      const llm = await getSyncPortfolioLLM(db, user);
      const result = await runLLM(llm);
      await getFile(`users/${user.id}/llm/portfolio.md`).save(result || "");
      rep.status(200).send({ message: "Portfolio has been synced successfully!" });
    },
  });

  app.post("/portfolio/schedule-syncs", {
    schema: {
      response: {
        200: okSchema,
        500: serverErrSchema,
      },
    },

    handler: async (req, rep) => {
      const users = await db.query.usersTable.findMany({
        where: {
          roles: {
            arrayContains: ["admin"],
          },

          keys: {
            type: "Google AI",
            key: {
              isNotNull: true,
            },
          },

          handles: {
            type: "GitHub",
            handle: {
              isNotNull: true,
            },
          },
        },
      });

      const now = new UTCDate();
      const client = new CloudTasksClient();
      const queue = `${TF_VAR_project_name!}-sync-portfolio`;
      const period = `${getISOWeek(now)}-${getISOWeekYear(now)}`;
      let errors = 0;

      for (const user of users) {
        const taksPath = client.taskPath(
          TF_VAR_project_name!,
          TF_VAR_region!,
          queue,
          `${user.id}-${period}`,
        );

        await client
          .createTask({
            parent: client.queuePath(
              TF_VAR_project_name!,
              TF_VAR_region!,
              `${TF_VAR_project_name!}-sync-portfolio`,
            ),

            task: {
              name: taksPath,
              httpRequest: {
                httpMethod: "POST",
                url: `${SRV_INT_URL}/leads/portfolio/sync/${user.id}`,
              },
            },
          })
          .catch((e) => {
            if (e?.code === 6) return;
            req.log.error({ err: e, task: taksPath, msg: "Error enqueueing task." });
            errors++;
          });
      }

      if (errors) {
        const e = {
          statusCode: 500,
          error: "Internal Server Error",
          message: "One or more schedules are failed!",
        } satisfies ServerAPIErr;

        return rep.status(e.statusCode).send(e);
      }

      rep.status(200).send({
        message: "Portfolio sync has been scheduled.",
      } satisfies OkResp);
    },
  });
};
