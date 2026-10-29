import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { type ConnectBody, connectBodySchema, type CreateConnectResp } from "lib";
import { connectsTable } from "lib-server";
import { object, pipe, string, regex } from "valibot";

export const contactRest: FastifyPluginAsync = async (app) => {
  app.post("/", {
    schema: {
      body: connectBodySchema,
      response: {
        201: object({
          _id: pipe(string(), regex(/^[a-f\d]{24}$/)),
        }),
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

        rep.send({
          id: result[0].id,
        } as CreateConnectResp);
      } catch (err) {
        const e = err as unknown as Error;
        app.log.error(err);
        rep.status(500).send({
          message: e?.message || "Something went wrong!",
        });
      }
    },
  });
};
