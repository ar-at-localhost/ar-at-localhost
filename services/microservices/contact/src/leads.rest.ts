import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import {
  type GetLeadsQuery,
  leadsRespSchema,
  type UserInfo,
  paginationQueryTransform,
  getLeadsQuerySchema,
  contentSchema,
  type ContentBody,
  createLeadSchema,
  leadSchema,
  type CreateLeadBody,
} from "lib";
import {
  badReqErrorSchema,
  db,
  findLeadsIntSrv,
  jdToLeadIntSrv,
  leadsTable,
  mkBadReqErr,
  okSchema,
  syncPortfolioIntSrv,
  type TooManyRequestsAPIError,
  tooManyRequestsErrorSchema,
} from "lib-server";

export const leadsRest: FastifyPluginAsync = async (app) => {
  /*
   * Sync portfolio document
   *
   * Runs an LLM with context to create `portfolio.md`
   */
  app.post("/sync-portfolio", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
        opts: {
          jwt: {
            aud: "auth",
          },
        },
      },
    },

    schema: {
      response: {
        400: badReqErrorSchema,
        200: okSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const key = user?.keys.find((i) => i.type === "Gemini")?.key || "";

      if (!key) {
        const e = mkBadReqErr("Gemini not enabled. Please set Gemini key.");
        return rep.status(e.statusCode).send(e);
      }

      await syncPortfolioIntSrv({
        params: {
          user: req.userId!,
        },
      });

      rep.status(200).send({
        message: "Portfolio has been updated successfully!",
      });
    },
  });

  /*
   * Find leads
   *
   * Runs an LLM with context find potentional clients (leads)
   */
  app.post("/find", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
        opts: {
          jwt: {
            aud: "auth",
          },
        },
      },
    },

    schema: {
      response: {
        200: okSchema,
        400: badReqErrorSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const key = user?.keys.find((i) => i.type === "Gemini")?.key || "";

      if (!key) {
        const e = mkBadReqErr("Gemini not enabled. Please set Gemini key.");
        return rep.status(e.statusCode).send(e);
      }

      try {
        await findLeadsIntSrv({
          params: {
            user: req.userId!,
          },
        });

        rep.status(200).send({
          message: "Portfolio has been updated successfully!",
        });
      } catch (err) {
        const e = err as TooManyRequestsAPIError;

        if (e.statusCode === 429) {
          return rep.status(e.statusCode).send(e);
        }

        throw e;
      }
    },
  });

  /*
   * Derive a lead from job description
   *
   * Runs an LLM with job description to convert it to a lead
   */
  app.post("/from-jd", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
        opts: {
          jwt: {
            aud: "auth",
          },
        },
      },
    },

    schema: {
      body: contentSchema,
      response: {
        200: createLeadSchema,
        400: badReqErrorSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const key = user?.keys.find((i) => i.type === "Gemini")?.key || "";

      if (!key) {
        const e = mkBadReqErr("Gemini not enabled. Please set Gemini key.");
        return rep.status(e.statusCode).send(e);
      }

      try {
        const result = await jdToLeadIntSrv({
          body: req.body as ContentBody,
          params: {
            user: req.userId!,
          },
        });

        rep.status(200).send(result);
      } catch (err) {
        const e = err as TooManyRequestsAPIError;

        if (e.statusCode === 429) {
          return rep.status(e.statusCode).send(e);
        }

        throw e;
      }
    },
  });

  /*
   * Creates a new lead
   *
   * Runs an LLM with job description to convert it to a lead
   */
  app.post("/", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
        opts: {
          jwt: {
            aud: "auth",
          },
        },
      },
    },

    schema: {
      body: createLeadSchema,

      response: {
        200: leadSchema,
        400: badReqErrorSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const body = req.body as CreateLeadBody;

      const [result] = await db
        .insert(leadsTable)
        .values({
          ...body,
          last_seen_at: new Date(),
          snooze_until: null,
          status: "new",
          user_id: user.id,
        })
        .returning();

      rep.status(200).send(result);
    },
  });

  /**
   * get leads
   */
  app.get(
    "/",
    {
      config: {
        auth: {
          strategies: "jwt",
          permissions: {
            roles: ["admin"],
          },
          opts: {
            jwt: {
              aud: "auth",
            },
          },
        },
      },

      schema: {
        querystring: getLeadsQuerySchema,
        response: {
          200: leadsRespSchema,
          400: badReqErrorSchema,
        },
      },
    },

    async (req, rep) => {
      const query = paginationQueryTransform(req.query as GetLeadsQuery);
      const search = query.search ? `%${query.search}` : undefined;
      const sqlWhere = and(
        eq(leadsTable.user_id, req.userId!),
        query.status ? eq(leadsTable.status, query.status) : undefined,
        query.fit_score ? gte(leadsTable.fit_score, query.fit_score) : undefined,
        search
          ? or(
              ilike(leadsTable.company, search),
              ilike(leadsTable.contact_role, search),
              ilike(leadsTable.domain, search),
              ilike(leadsTable.notes, search),
            )
          : undefined,
      );

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(leadsTable)
          .where(sqlWhere)
          .orderBy(desc(leadsTable.updated_at), desc(leadsTable.id))
          .limit(query.limit)
          .offset(query.offset)
          .then((items) => JSON.parse(JSON.stringify(items))),
        db.select({ total: count() }).from(leadsTable).where(sqlWhere),
      ]);

      rep.status(200).send({
        offset: query.offset,
        page: query.page,
        limit: query.limit,
        items,
        total,
      });
    },
  );
};
