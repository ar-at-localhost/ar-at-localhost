import type { FastifyPluginAsync } from "fastify";
import { testimonialRequestMail } from "lib-server";
import { InferOutput, integer, number, object, pipe, string, transform } from "valibot";

export const testimonialRest: FastifyPluginAsync = async (app) => {
  const postRequestSchema = object({
    id: pipe(
      string(),
      transform(Number),
      number("Id must be a number!"),
      integer("Id must be an integer!"),
    ),
  });

  type PostRequestParams = InferOutput<typeof postRequestSchema>;

  app.post("/request/:id", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
      },
    },

    schema: {
      params: postRequestSchema,
    },

    handler: async (req, rep) => {
      await testimonialRequestMail((req.params as PostRequestParams).id);

      rep.status(200).send({
        ok: true,
      });
    },
  });
};
