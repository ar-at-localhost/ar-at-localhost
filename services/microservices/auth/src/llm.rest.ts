import { FastifyPluginAsync } from "fastify";
import {
  getLLMConfigParams,
  LLMConfigParams,
  llmConfigSchema,
  LLMConfigBody,
  llmConfigCommonSchema,
} from "lib";
import { db, getLlmConfigByLabel, updateLlmConfigByLabel } from "lib-server";

export const llmRest: FastifyPluginAsync = async (app) => {
  app.get(
    "/config/:label",
    {
      config: {
        auth: {
          strategies: "jwt",
          permissions: {
            roles: ["admin"],
          },
          opts: {
            jwt: {
              aud: "auth",
            },
          },
        },
      },

      schema: {
        params: getLLMConfigParams,
        response: {
          200: llmConfigSchema,
        },
      },
    },
    async (req, rep) => {
      const p = req.params as LLMConfigParams;
      const config = await getLlmConfigByLabel(db, p.label, req.userId!);
      rep.status(200).send(JSON.parse(JSON.stringify(config)));
    },
  );

  app.patch(
    "/config/:label",
    {
      config: {
        auth: {
          strategies: "jwt",
          permissions: {
            roles: ["admin"],
          },
          opts: {
            jwt: {
              aud: "auth",
            },
          },
        },
      },

      schema: {
        params: getLLMConfigParams,
        body: llmConfigCommonSchema,
        response: {
          200: llmConfigSchema,
        },
      },
    },
    async (req, rep) => {
      const p = req.params as LLMConfigParams;
      const b = req.body as LLMConfigBody;
      const config = await updateLlmConfigByLabel(db, p.label, b, req.userId!);
      rep.status(200).send(JSON.parse(JSON.stringify(config)));
    },
  );
};
