import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { connectMail } from "lib-server";
import { object, boolean, type InferOutput, pipe, string, integer, transform } from "valibot";
import { getAPIBaseURL } from "lib";

const postPathSchema = object({
  id: pipe(string(), transform(Number), integer("Invalid id!")),
});

type PostBody = InferOutput<typeof postPathSchema>;

export const connectIntRest: FastifyPluginAsync = async (app) => {
  app.post("/:id", {
    schema: {
      params: postPathSchema,
      response: {
        201: object({
          ok: boolean(),
        }),
      },
    },
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const { id } = req.params as unknown as PostBody;
        await connectMail(id);
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

export const postConnectInt = (id: number, baseURL?: string) =>
  fetch(`${getAPIBaseURL(baseURL)}/connect/${id}`, {
    method: "POST",
  });
