import type { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { contactBodySchema, type Contact, ContactModel } from "lib";

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
    rep.send(record);
  },
};
