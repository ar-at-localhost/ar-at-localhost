import "lib/env.d.ts";
import "templates/env.d.ts";

declare module "fastify" {
  interface FastifyInstance {
    turnstile: (req: FastifyRequest, rep: FastifyReply) => Promise<boolean>;
  }
}
