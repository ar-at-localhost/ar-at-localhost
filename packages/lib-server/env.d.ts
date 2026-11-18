import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import "lib/env.d.ts";
import "templates/env.d.ts";
import type { LoginRespSchema } from "lib";

import type { UserRecord, UserRole } from "./src/user.db.ts";

declare global {
  type AuthStrategy = "jwt" | "apiKey";
  type AuthStrategies = AuthStrategy | AuthStrategy[];

  type JwtAuthStrategyOpts = Partial<{
    aud: string | string[];
  }>;
  type JWT_KEY = Uint8Array;
  type JWT_KEYS = {
    [x: number]: JWT_KEY;
  } & {
    _latestVersion: number;
  };

  type AuthOpts = {
    optional?: boolean;
    strategies: AuthStrategies;
    permissions?: {
      /**
       * @default "all"
       */
      mode?: "any" | "all";
      roles: UserRole[];
    };

    opts?: Partial<{
      apiKey: undefined;
      jwt: JwtAuthStrategyOpts;
    }>;
  };
}

declare module "fastify" {
  interface FastifyInstance {
    turnstile: (req: FastifyRequest, rep: FastifyReply) => Promise<boolean>;
    db: NodePgDatabase;
  }

  interface FastifyRequest {
    userId?: number;
    getUser?: () => Promise<UserInfo>;
    jwt_keys: JWT_KEYS;
    routeOptions: {
      auth?: AuthOpts;
    };
  }

  interface FastifyContextConfig {
    auth?: AuthOpts;
  }
}
