import { and, eq, notInArray, sql } from "drizzle-orm";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
  type EmailLoginBody,
  emailLoginBodySchema,
  getProfileRespSchema,
  loginRespSchema,
  type LoginRespSchema,
  updateProfileSchema,
  type UpdateUserBody,
  type UserInfo,
} from "lib";
import {
  createTokenPair,
  db,
  getUserInfo,
  mkAuthErr,
  unauthenticedReqErrSchema,
  userHandlesTable,
  userKeysTable,
} from "lib-server";
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
        const user = await db.query.usersTable.findFirst({
          where: {
            id: req.userId!,
          },
          with: {
            keys: true,
            handles: true,
          },
        });

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

  app.patch(
    "/profile",
    {
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
        body: updateProfileSchema,

        response: {
          200: getProfileRespSchema,
          401: unauthenticedReqErrSchema,
        },
      },
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const user = (await req.getUser?.())!;
        const data = req.body as UpdateUserBody;

        await db.transaction(async (tx) => {
          if (data.personal_info) {
            await tx.update(usersTable).set(data.personal_info);
          }

          if (data.keys) {
            const kept = data.keys.filter((i) => i.key);
            const keptTypes = kept.map((i) => i.type);

            await tx
              .delete(userKeysTable)
              .where(
                and(
                  eq(userKeysTable.user_id, user.id),
                  keptTypes.length ? notInArray(userKeysTable.type, keptTypes) : undefined,
                ),
              );

            if (kept.length) {
              await tx
                .insert(userKeysTable)
                .values(kept.map((i) => ({ user_id: user.id, type: i.type, key: i.key })))
                .onConflictDoUpdate({
                  target: [userKeysTable.user_id, userKeysTable.type],
                  set: { key: sql`excluded.key` },
                });
            }
          }

          if (data.handles) {
            const kept = data.handles.filter((i) => i.handle);
            const keptTypes = kept.map((i) => i.type);

            await tx
              .delete(userHandlesTable)
              .where(
                and(
                  eq(userHandlesTable.user_id, user.id),
                  keptTypes.length ? notInArray(userHandlesTable.type, keptTypes) : undefined,
                ),
              );

            if (kept.length) {
              await tx
                .insert(userHandlesTable)
                .values(kept.map((i) => ({ user_id: user.id, type: i.type, handle: i.handle })))
                .onConflictDoUpdate({
                  target: [userHandlesTable.user_id, userHandlesTable.type],
                  set: { handle: sql`excluded.handle` },
                });
            }
          }
        });

        const result = await getUserInfo(user.id);
        rep.send(JSON.parse(JSON.stringify(result)) satisfies UserInfo);
      } catch (err) {
        const e = err as unknown as Error;
        app.log.error(err);
        rep.status(500).send({
          message: e?.message || "Something went wrong!",
        });
      }
    },
  );
};
