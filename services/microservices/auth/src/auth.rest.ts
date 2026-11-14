import { eq } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
  type EmailLoginBody,
  emailLoginBodySchema,
  getProfileRespSchema,
  loginRespSchema,
  type LoginRespSchema,
  type UserInfo,
} from "lib";
import { createTokenPair, mkAuthErr, unauthenticedReqErrSchema } from "lib-server";
import { usersTable } from "lib-server";
import { verify } from "node-argon2";

export const authRest: FastifyPluginAsync = async (app) => {
  app.post("/email", {
    schema: {
      body: emailLoginBodySchema,
      response: {
        200: loginRespSchema,
        401: unauthenticedReqErrSchema,
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      const writeErr = () => {
        const err = mkAuthErr("Invalid email or password!");
        rep.status(err.statusCode).send(err);
      };

      const body = req.body as unknown as EmailLoginBody;

      const [user] = await app.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, body.email))
        .limit(1);

      if (!user || !user.hash || !(await verify({ hash: user.hash, password: body.password })))
        return writeErr();

      rep.send((await createTokenPair(user)) satisfies LoginRespSchema);
    },
  });

  app.post("/refresh-token", {
    config: {
      auth: {
        strategies: "jwt",
        opts: {
          jwt: {
            aud: "refreshToken",
          },
        },
      },
    },
    schema: {
      response: {
        200: loginRespSchema,
        401: unauthenticedReqErrSchema,
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const user = await req.getUser?.();
        rep.send((await createTokenPair(user!)) satisfies LoginRespSchema);
        // TODO: Invalidate token
      } catch (err) {
        const e = err as unknown as Error;
        app.log.error(err);
        rep.status(500).send({
          message: e?.message || "Something went wrong!",
        });
      }
    },
  });

  app.get("/profile", {
    config: {
      auth: {
        strategies: ["jwt", "apiKey"],
        opts: {
          jwt: {
            aud: ["auth"],
          },
        },
      },
    },
    schema: {
      response: {
        200: getProfileRespSchema,
        401: unauthenticedReqErrSchema,
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const user = await req.getUser?.();
        rep.send(JSON.parse(JSON.stringify(user!)) satisfies UserInfo);
      } catch (err) {
        const e = err as unknown as Error;
        app.log.error(err);
        rep.status(500).send({
          message: e?.message || "Something went wrong!",
        });
      }
    },
  });
};
