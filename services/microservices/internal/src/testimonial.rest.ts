import type { FastifyPluginAsync } from "fastify";
import { mkClientSrv } from "lib";
import {
  badReqErrorSchema,
  OkResponse,
  okSchema,
  serverErrSchema,
  testimonialRequestMail,
} from "lib-server";
import { InferOutput, integer, minValue, number, object, pipe, string, transform } from "valibot";

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
      params: postTestimonialReqIntParamsSchema,
      response: {
        200: okSchema,
        400: badReqErrorSchema,
        500: serverErrSchema,
      },
    },

    handler: async (req, rep) => {
      await testimonialRequestMail((req.params as PostRequestParams).id);

      rep.status(200).send({
        message: "Request has been processed successfully!",
      });
    },
  });
};

export const postTestimonialReqIntParamsSchema = object({
  id: pipe(
    string("Invalid id!"),
    transform(Number),
    integer("Invalid id!"),
    minValue(1, "Invalid id!"),
  ),
});

export type PostTestimonialReqIntParams = InferOutput<typeof postTestimonialReqIntParamsSchema>;

export const postTestimonialReqInt = mkClientSrv<
  OkResponse,
  [PostTestimonialReqIntParams, never, never]
>({
  method: "POST",
  endpoint: "/testimonial/request/:id",
});
