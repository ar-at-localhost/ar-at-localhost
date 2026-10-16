import type { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { contactBodySchema } from "lib";
import { ContactModel, type Contact } from "lib-server";

/**
 * @fastify
 * Create a new create
 */
export const createContact: RouteOptions = {
  method: "post",
  url: "/",
  schema: {
    body: contactBodySchema,
  },
  handler: async (req: FastifyRequest, rep: FastifyReply) => {
    const body = req.body as unknown as Contact;
    const record = await ContactModel.create(body);

    rep.send({
      _id: record._id,
    });
  },
};
