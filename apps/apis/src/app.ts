import Fastify from "fastify";
import { type GenericSchema, safeParse } from "valibot";
import { contact } from "./contact/index.ts";
import { fastifyPlugin as mongoosePlugin } from "lib";

export const getApp = () => {
  const app = Fastify({
    logger: true,
    forceCloseConnections: true,
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

  app.register(mongoosePlugin);

  app.register(contact, {
    prefix: "/api/contact",
  });

  return app;
};
