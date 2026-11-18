import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { type PromptSchema, promptSchema, type UserInfo } from "lib";
import {
  badReqErrorSchema,
  findLeadsIntSrv,
  getFile,
  mkBadReqErr,
  mkNotFoundErr,
  notFoundErrorSchema,
  okSchema,
  syncPortfolioIntSrv,
  type TooManyRequestsAPIError,
  tooManyRequestsErrorSchema,
} from "lib-server";

export const leadsRest: FastifyPluginAsync = async (app) => {
  const getFileRest = (file: string) => ({
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
      } satisfies AuthOpts,
    },

    schema: {
      response: {
        200: okSchema,
        400: badReqErrorSchema,
        404: notFoundErrorSchema,
      },
    },

    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      const user: UserInfo = (await req.getUser?.())!;
      const f = getFile(`users/${user.id}/${file}`);

      const m = await f
        .getMetadata()
        .then((m) => m[0])
        .catch((e) => {
          if (e.code !== 404) {
            throw e;
          }

          return null;
        });

      if (!m) {
        const e = mkNotFoundErr("File does not exists!");
        return rep.status(e.statusCode).send(e);
      }

      const stream = f.createReadStream();
      return rep.header("content-type", m.contentType).send(stream);
    },
  });

  const setFileRest = (file: string) => ({
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
      } satisfies AuthOpts,
    },

    schema: {
      body: promptSchema,
      response: {
        200: okSchema,
      },
    },

    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      const { prompt } = req.body as PromptSchema;
      const user: UserInfo = (await req.getUser?.())!;
      const f = getFile(`users/${user.id}/${file}`);

      await f
        .getMetadata()
        .then((m) => m[0])
        .catch((e) => {
          if (e.code !== 404) {
            throw e;
          }

          return null;
        });

      await f.save(prompt);
      return rep.status(200).send({
        message: "File has been save successfully!",
      });
    },
  });

  /*
   * Sync portfolio document
   *
   * Runs an LLM with context to create `portfolio.md`
   */
  app.post("/sync-portfolio", {
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
      response: {
        400: badReqErrorSchema,
        200: okSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const key = user?.keys.find((i) => i.type === "Gemini")?.key || "";

      if (!key) {
        const e = mkBadReqErr("Gemini not enabled. Please set Gemini key.");
        return rep.status(e.statusCode).send(e);
      }

      await syncPortfolioIntSrv({
        params: {
          user: req.userId!,
        },
      });

      rep.status(200).send({
        message: "Portfolio has been updated successfully!",
      });
    },
  });

  /*
   * Find leads
   *
   * Runs an LLM with context find potentional clients (leads)
   */
  app.post("/find", {
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
      response: {
        200: okSchema,
        400: badReqErrorSchema,
        429: tooManyRequestsErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const user: UserInfo = (await req.getUser?.())!;
      const key = user?.keys.find((i) => i.type === "Gemini")?.key || "";

      if (!key) {
        const e = mkBadReqErr("Gemini not enabled. Please set Gemini key.");
        return rep.status(e.statusCode).send(e);
      }

      try {
        await findLeadsIntSrv({
          params: {
            user: req.userId!,
          },
        });

        rep.status(200).send({
          message: "Portfolio has been updated successfully!",
        });
      } catch (err) {
        const e = err as TooManyRequestsAPIError;

        if (e.statusCode === 429) {
          return rep.status(e.statusCode).send(e);
        }

        throw e;
      }
    },
  });

  app.get("/prompt/sys", getFileRest("llm/leads-sp.md"));
  app.post("/prompt/sys", setFileRest("llm/leads-sp.md"));

  app.get("/portfolio", getFileRest("llm/portfolio.md"));

  app.get("/portfolio/prompt", getFileRest("llm/portfolio-p.md"));
  app.post("/portfolio/prompt", setFileRest("llm/portfolio-p.md"));

  app.get("/portfolio/prompt/sys", getFileRest("llm/portfolio-sp.md"));
  app.post("/portfolio/prompt/sys", setFileRest("llm/portfolio-sp.md"));

  app.get("/portfolio/whoami", getFileRest("llm/portfolio-whoami.md"));
  app.post("/portfolio/whoami", setFileRest("llm/portfolio-whoami.md"));
};
