import { randomUUID } from "node:crypto";

import { UTCDate } from "@date-fns/utc";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { addDays, addMinutes, getUnixTime } from "date-fns";
import { eq } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { LoginRespSchema } from "lib";

import { isCI, isDev } from "./env.ts";
import { db } from "./pg.ts";
import { usersTable, type UserRecord } from "./user.ts";

/**
 * Resolve JWT Keys from the Google Cloud Secret Manager
 */
export const resolveJwtKeys = (() => {
  const ttl = 60 * 60 * 1000; // 1 hour

  const getKeysInit = () => ({
    _latestVersion: undefined as unknown as number,
  });

  let keys: JWT_KEYS = getKeysInit();
  let promise: Promise<JWT_KEYS> | undefined = undefined;

  const resolve = async () => {
    if (isDev() || isCI()) {
      keys[1] = new TextEncoder().encode(process.env.TF_VAR_jwt!);
      keys._latestVersion = 1;
    }

    if (keys._latestVersion) return keys;
    if (promise) return promise;

    const fetch_ = async () => {
      const sm = new SecretManagerServiceClient();
      const { TF_VAR_project_name } = process.env;
      const secretPath = sm.secretPath(TF_VAR_project_name!, "jwt");

      const [secretVersions] = await sm.listSecretVersions({
        parent: secretPath,
      });

      const enableVersions = secretVersions.filter((i) => i.state == "ENABLED");

      for (const enabledVersion of enableVersions) {
        const [secret] = await sm.accessSecretVersion({
          name: enabledVersion.name,
        });

        if (secret?.name && secret?.payload?.data) {
          const data =
            typeof secret.payload.data == "string"
              ? new TextEncoder().encode(secret.payload.data)
              : new Uint8Array(secret.payload.data);

          const version = parseInt(secret.name.split("/").pop()!);
          keys[version] = data;
          keys._latestVersion = Math.max(version, keys._latestVersion || 0);
        }
      }

      if (!keys._latestVersion) {
        throw new Error("Error fetching JWT secret keys.");
      }

      setTimeout(() => {
        keys = getKeysInit();
      }, ttl);

      return keys;
    };

    promise = fetch_();

    try {
      return await promise;
    } finally {
      promise = undefined;
    }
  };

  return resolve;
})();

export const createJwtToken = async (payload?: JWTPayload) => {
  const keys = await resolveJwtKeys();
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
      kid: keys._latestVersion.toString(),
    })
    .setIssuedAt()
    .setJti(randomUUID())
    .sign(keys[keys._latestVersion]);
};

export const decodeJwtToken = async (token: string, keys?: JWT_KEYS) => {
  const finalKeys = keys || (await resolveJwtKeys());
  return await jwtVerify(token, (header) => {
    return finalKeys[parseInt(header.kid!)];
  });
};

type AuthHandler<Opts = any> = (req: FastifyRequest, opts?: Opts) => Promise<void>;

export const apiKeyAuth: AuthHandler = async function (req) {
  const apiToken = req.headers["x-api-key"];

  if (apiToken) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.hash, apiToken.toString()))
      .limit(1);

    req.userId = user.id;
    req.getUser = async () => user;
  }
};

export const jwtTokenAuth: AuthHandler<JwtAuthStrategyOpts> = async function (req, opts) {
  const forwarded = req.headers["x-forwarded-authorization"];
  const authorization = typeof forwarded === "string" ? forwarded : req.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");
    const { payload } = await jwtVerify(token, (header) => {
      const keys = req.jwt_keys;
      return keys[parseInt(header.kid!)];
    });

    if (opts?.aud) {
      const setA = typeof opts.aud == "string" ? [opts.aud] : opts.aud;
      const setB = new Set(typeof payload.aud === "string" ? [payload.aud] : payload.aud);
      if (!setA.some((a) => setB.has(a))) return;
    }

    const id = parseInt(payload.sub!);
    req.userId = id;

    req.getUser = (() => {
      let user: UserRecord | undefined = undefined;

      return async () => {
        if (!user) {
          [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
        }

        return user;
      };
    })();
  }
};

export const handlers: Record<AuthStrategy, AuthHandler> = {
  apiKey: apiKeyAuth,
  jwt: jwtTokenAuth,
};

export const authPlugin = fp(async (app) => {
  app.addHook("preHandler", async function (req, rep) {
    if (req.routeOptions.config.auth) {
      const auth = req.routeOptions.config.auth;
      const strategies = req.routeOptions.config.auth.strategies;
      const strategySet = new Set(typeof strategies == "string" ? [strategies] : strategies);

      for (const strategy of strategySet) {
        if (strategy == "jwt") {
          req.jwt_keys = await resolveJwtKeys();
        }

        await handlers[strategy]
          .bind(this)(req, auth.opts?.[strategy])
          .catch(() => null);

        if (req.getUser) break;
      }

      if (!req.getUser) {
        if (auth.optional) return;
        return rep.status(401).send({
          statusCode: 401,
          error: "Unauthenticated",
          message: "You are not logged in or your session has expired!",
        });
      }

      const permssions = req.routeOptions.config.auth.permissions;
      if (permssions) {
        const match = permssions.mode || "all";
        const roles = permssions.roles ?? [];
        const userRoles = await req.getUser?.();

        if (!roles[match == "any" ? "some" : "every"]((role) => userRoles?.roles?.includes(role))) {
          return rep.status(403).send({
            statusCode: 403,
            error: "Unauthorized",
            message: "You are not allowed to perform this operation!",
          });
        }
      }
    }
  });
});

export const createTokenPair = async (user: UserRecord) => {
  const { id } = user;

  const token = await createJwtToken({
    aud: "auth",
    sub: id.toString(),
    exp: getUnixTime(addMinutes(new UTCDate(), 10)),
  });

  const refreshToken = await createJwtToken({
    aud: "refreshToken",
    sub: id.toString(),
    exp: getUnixTime(addDays(new UTCDate(), 1)),
  });

  return {
    token,
    refreshToken,
  };
};

export const getTestAuth = (() => {
  let tokenPair: LoginRespSchema | undefined = undefined;

  return async () => {
    if (tokenPair) return tokenPair;

    const email = process.env.ADMIN_EMAIL;
    if (email && (isCI() || isDev())) {
      return createTokenPair(
        (await db.select().from(usersTable).where(eq(usersTable.email, email)))[0],
      );
    }

    throw new Error("Admin account not configured.");
  };
})();
