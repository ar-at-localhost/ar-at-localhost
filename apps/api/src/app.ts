import Fastify, { type FastifyInstance } from "fastify";
import { type GenericSchema, safeParse } from "valibot";
import { contact } from "./contact/index.ts";
import { getCors, getSSL, fastifyPlugin as mongoosePlugin } from "lib-server";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import assert from "node:assert";

export const getApp = (ssl?: boolean) => {
  let safeRate = 1000;
  if (process.env.NODE_ENV == "production") {
    safeRate = 1;
  }

  assert(safeRate >= 1, "Unexpected test factor!");

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

  // CORS
  app.register(fastifyCors, {
    origin: getCors(),
    methods: ["DELETE", "GET", "OPTIONS", "POST", "PUT", "PATCH"],
  });

  app.register(fastifyHelmet, {
    global: true,
  });

  app.register(fastifyRateLimit, {
    max: 3 * safeRate,
    timeWindow: "1 minute",
    global: true,
  });

  app.get(
    "/health",
    {
      config: {
        rateLimit: {
          max: 5 * safeRate,
          timeWindow: "1 minute",
        },
      },
    },
    (_, resp) => {
      resp.send();
    },
  );

  app.register(mongoosePlugin);

  app.register(contact, {
    prefix: "/api/contact",
  });

  return app;
};
