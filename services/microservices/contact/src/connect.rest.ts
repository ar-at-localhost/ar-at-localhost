import { count, desc, ilike, or } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
  type ConnectBody,
  connectBodySchema,
  type CreateConnectResp,
  type FetchConnectsQuery,
  fetchConnectsQuerySchema,
  fetchConnectsRespSchema,
  paginationQueryTransform,
} from "lib";
import { connectsTable, db, enqueueConnect, okSchema, serverErrSchema } from "lib-server";

export const contactRest: FastifyPluginAsync = async (app) => {
  app.post("/", {
    schema: {
      body: connectBodySchema,
      response: {
        200: okSchema,
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        if (!(await app.turnstile(req, rep))) return;
        const body = req.body as unknown as ConnectBody;
        const result = await app.db
          .insert(connectsTable)
          .values(body)
          .returning({ id: connectsTable.id });

        if (!result.length) throw new Error("Unexpected insert result!");
        const { id } = result[0];
        await enqueueConnect(id);
        rep.send({
          message: "Request has been processed successfully!",
        } satisfies CreateConnectResp);
      } catch (err) {
        const e = err as unknown as Error;
        app.log.error(err);
        rep.status(500).send({
          message: e?.message || "Something went wrong!",
        });
      }
    },
  });

  /**
   * Get contacts
   */
  app.get("/", {
    config: {
      auth: {
        strategies: "jwt",
        opts: {
          jwt: {
            roles: ["admin"],
          },
        },
      },
    },

    schema: {
      querystring: fetchConnectsQuerySchema,
      response: {
        200: fetchConnectsRespSchema,
        500: serverErrSchema,
      },
    },

    handler: async (req, rep) => {
      const query = paginationQueryTransform(req.query as unknown as FetchConnectsQuery);
      const search = query?.search ? `%${query.search}%` : undefined;
      const sqlWhere = search
        ? or(
            ilike(connectsTable.first_name, search),
            ilike(connectsTable.last_name, search),
            ilike(connectsTable.email, search),
            ilike(connectsTable.message, search),
          )
        : undefined;

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(connectsTable)
          .where(sqlWhere)
          .orderBy(desc(connectsTable.updated_at), desc(connectsTable.id))
          .limit(query.limit)
          .offset(query.offset)
          .then((items) => JSON.parse(JSON.stringify(items))),
        db.select({ total: count() }).from(connectsTable).where(sqlWhere),
      ]);

      rep.status(200).send({
        offset: query.offset,
        page: query.page,
        limit: query.limit,
        items,
        total,
      });
    },
  });
};
