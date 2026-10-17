import type { FastifyPluginAsync } from "fastify";
import { createContact } from "./create.ts";

export const contact: FastifyPluginAsync = async (app) => {
  app.post("/", createContact);
};
