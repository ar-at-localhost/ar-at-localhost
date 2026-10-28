import Fastify, { type FastifyInstance } from "fastify";
import { type GenericSchema, parse, safeParse } from "valibot";
import { mongoosePlugin } from "./db.ts";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import assert from "node:assert";
import { getCors, isDev, isProduction } from "./env.ts";
import { getPort, isValibot } from "lib";
import fastifySwagger, { type FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { toJsonSchema } from "@valibot/to-json-schema";
import { cwd } from "node:process";
import { writeFile } from "node:fs/promises";

export type BaseAppOpts = {
  swagger?: FastifyDynamicSwaggerOptions;

  /**
   * Do not plugin the database plugin
   * Useful in cases, like generating the swagger specs
   */
  noDatabase?: boolean;

  /**
   * Do not wait for the database before listening,
   * useful where early ping meters, i.e. health checks
   */
  dontAwaitDatabase?: boolean;

  /**
   *
   */
  prefix?: string;

  /**
   * Name of the service
   */
  name?: string;
};

export const getBaseApp = async ({ swagger, noDatabase, dontAwaitDatabase, name }: BaseAppOpts) => {
  let safeRate = 1000;
  if (isProduction()) {
    safeRate = 1;
  }

  assert(safeRate >= 1, "Unexpected test factor!");

  const app = Fastify({
    forceCloseConnections: true,
    pluginTimeout: 60 * 1000,
    rewriteUrl:
      name && isDev()
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

  app.get("/health", async (_, resp) => {
    resp.status(200).send();
  });

  if (!noDatabase) {
    const dbPromise = app.register(mongoosePlugin);
    if (!dontAwaitDatabase) await dbPromise;
  }

  return app;
};

export const testSetup = async (app: FastifyInstance) => {
  await app.listen({
    port: getPort(),
  });

  await app.ready();
};

export const testTeardown = async (app: FastifyInstance) => {
  await app.close();
};

export const generateSwagger = async (app: FastifyInstance) => {
  await app.ready();
  await writeFile(`${cwd()}/openapi.json`, JSON.stringify(app.swagger(), null, 2), "utf8");
};
