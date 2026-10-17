import type { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { ContactBody, contactBodySchema } from "lib";
import { ContactModel } from "lib-server";

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
    const body = req.body as unknown as ContactBody;
    const record = await ContactModel.create(body);

    rep.send({
      _id: record._id,
    });
  },
};
