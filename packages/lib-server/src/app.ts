import assert from "node:assert";
import { writeFile } from "node:fs/promises";
import { cwd } from "node:process";

import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger, { type FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { toJsonSchema } from "@valibot/to-json-schema";
import Fastify, { type FastifyInstance } from "fastify";
import { getPort, isValibot } from "lib";
import { type GenericSchema, parse, safeParse } from "valibot";

import { getCors, isCI, isDev, isProduction } from "./env.ts";
import { turnstilePlugin } from "./turnstile.ts";

export type BaseAppOpts = {
  swagger?: FastifyDynamicSwaggerOptions;

  /**
   *
   */
  prefix?: string;

  /**
   * Name of the service
   */
  name?: string;
};

export const getBaseApp = async ({ swagger, name }: BaseAppOpts) => {
  let safeRate = 1000;
  if (isProduction()) {
    safeRate = 1;
  }

  assert(safeRate >= 1, "Unexpected test factor!");

  const app = Fastify({
    forceCloseConnections: true,
    pluginTimeout: 5 * 60 * 1000,
    rewriteUrl:
      !!name && (isDev() || isCI())
        ? (req) => req.url?.replace(`/${name}`, "/").replace("//", "/") as unknown as string
        : undefined,

    logger: {
      level: isProduction() ? "info" : "debug",
    },
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

  /**
   * Set valibot serializer for response validation
   */
  app.setSerializerCompiler(
    ({ schema }) =>
      (data) =>
        JSON.stringify(isValibot(schema) ? parse(schema, data) : data),
  );

  /**
   * Swagger
   */
  if (swagger) {
    await app.register(fastifySwagger, {
      ...swagger,
      transform: ({ schema, url }) => {
        if (!schema) return { schema, url };
        const out = { ...schema } as unknown as typeof schema;
        const jsonOpts = {
          target: "openapi-3.0",
          errorMode: "ignore",
        } as const;

        for (const k of ["body", "params", "querystring"] as const) {
          if (isValibot(schema[k])) out[k] = toJsonSchema(schema[k], jsonOpts) as unknown;
        }

        if (schema.response) {
          out.response = Object.fromEntries(
            Object.entries(schema.response).map(([code, s]) => [
              code,
              isValibot(s) ? toJsonSchema(s, jsonOpts) : s,
            ]),
          );
        }

        return { schema: out, url };
      },
    });

    app.get(
      "/openapi.json",
      {
        schema: {
          hide: true,
        },
      },
      () => app.swagger(),
    );
  }

  // CORS
  await app.register(fastifyCors, {
    origin: getCors(),
    methods: ["DELETE", "GET", "OPTIONS", "POST", "PUT", "PATCH"],
  });

  await app.register(fastifyHelmet, {
    global: true,
  });

  await app.register(fastifyRateLimit, {
    max: 3 * safeRate,
    timeWindow: "1 minute",
    global: true,
  });

  await app.register(turnstilePlugin);

  app.get("/health", async (_, resp) => {
    resp.status(200).send();
  });

  return app;
};

let _app: FastifyInstance;

export const testSetup = async (
  appFactory: () => Promise<FastifyInstance>,
  opts?: { port?: number; after?: () => Promise<void>; before?: () => Promise<void> },
) => {
  await opts?.before?.();
  _app = await appFactory();

  await _app.listen({
    port: opts?.port || getPort(),
  });

  await _app.ready();
  await opts?.after?.();
};

export const testTeardown = async () => {
  await _app?.close();
};

export const generateSwagger = async (app: FastifyInstance) => {
  await app.ready();
  await writeFile(`${cwd()}/openapi.json`, JSON.stringify(app.swagger(), null, 2), "utf8");
};
