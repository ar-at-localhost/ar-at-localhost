import Fastify, { FastifyInstance } from "fastify";
import { type GenericSchema, safeParse } from "valibot";
import { contact } from "./contact/index.ts";
import { getCors, getSSL, fastifyPlugin as mongoosePlugin } from "lib-server";
import fastifyCors from "@fastify/cors";

export const getApp = (ssl?: boolean) => {
  const baseOpts = {
    logger: true,
    forceCloseConnections: true,
  };

  const app = ssl
    ? (Fastify({
        ...baseOpts,
        http2: true,
        https: getSSL(),
      }) as unknown as FastifyInstance)
    : Fastify({
        ...baseOpts,
      });

  /**
   * Valibot based schema validation
   */
  app.setValidatorCompiler(({ schema }) => {
    const sc = schema as unknown as GenericSchema;

    return (data) => {
      const result = safeParse(sc, data);
      if (result.success) return { value: result.output };
      const issue = result.issues.pop();

      return {
        error: new Error(issue?.message || `Validation error at: ${issue?.path?.join(".")}`),
      };
    };
  });

  app.get("/health", (_, resp) => {
    resp.send();
  });

  app.register(fastifyCors, {
    origin: getCors(),
    methods: ["DELETE", "GET", "OPTIONS", "POST", "PUT", "PATCH"],
  });

  app.register(mongoosePlugin);

  app.register(contact, {
    prefix: "/api/contact",
  });

  return app;
};
