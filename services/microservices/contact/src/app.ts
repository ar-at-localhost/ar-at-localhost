import packageInfo from "../package.json" with { type: "json" };
import type { FastifyRequest, FastifyReply } from "fastify";
import { type ContactBody, contactBodySchema } from "lib";
import { type BaseAppOpts, ContactModel, getBaseApp } from "lib-server";
import { object, pipe, regex, string } from "valibot";

const { name, version } = packageInfo;

export const createApp = async (opts?: BaseAppOpts) => {
  const app = await getBaseApp({
    name: opts?.name,
    noDatabase: opts?.noDatabase,
    dontAwaitDatabase: opts?.dontAwaitDatabase,
    swagger: {
      openapi: {
        openapi: "3.0.3",
        info: {
          title: name,
          version: version,
        },
      },
    },
  });

  app.post("/", {
    schema: {
      body: contactBodySchema,
      response: {
        201: object({
          _id: pipe(string(), regex(/^[a-f\d]{24}$/)),
        }),
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      const body = req.body as unknown as ContactBody;
      const record = await ContactModel.create(body);

      rep.send({
        _id: record._id.toString(),
      });
    },
  });

  return app;
};
