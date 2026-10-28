import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { contactBodySchema, type ContactBody } from "lib";
import { ContactModel } from "lib-server";
import { object, pipe, string, regex } from "valibot";

export const contactRest: FastifyPluginAsync = async (app) => {
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
      if (!(await app.turnstile(req, rep))) return;
      const body = req.body as unknown as ContactBody;
      const record = await ContactModel.create(body);

      rep.send({
        _id: record._id.toString(),
      });
    },
  });
};
