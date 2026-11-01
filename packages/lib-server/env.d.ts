import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import "lib/env.d.ts";
import "templates/env.d.ts";

declare module "fastify" {
  interface FastifyInstance {
    turnstile: (req: FastifyRequest, rep: FastifyReply) => Promise<boolean>;
    db: NodePgDatabase;
  }
}
