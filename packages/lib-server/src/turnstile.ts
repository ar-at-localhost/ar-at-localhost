import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { getTurnstile } from "./env.ts";

export const turnstilePlugin: FastifyPluginAsync = fp(async (app: FastifyInstance) => {
  app.decorate("turnstile", async (req: FastifyRequest, rep: FastifyReply) => {
    const { token } = req.body as unknown as { token: string };

    const errResp = (code?: number) => {
      rep.status(code || 400).send({
        message: "Human verification failed.",
      });

      return false;
    };

    if (!token) return errResp();
    const turnstile = getTurnstile();

    return fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: turnstile.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip,
      }),
    })
      .then((r) => r.json())
      .then((r) => {
        const success = (r as unknown as { success: boolean })?.success;
        if (!success) return errResp();
        return true;
      })
      .catch(() => {
        return errResp(500);
      });
  });
});
