import { count, desc, eq, ilike, or } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import {
  type CreateTestimonialReqPayload,
  createTestimonialReqBodySchema,
  recordTestimonialBodySchema,
  type RecordTestimonialPayload,
  testimonialReqSchema,
  getTestimonialsQuerySchema,
  getTestimonialsRespSchema,
  type GetTestimonialQuery,
  paginationTransform,
  getTestimonialReqsQuerySchema,
  getTestimonialReqsRespSchema,
} from "lib";
import {
  db,
  enqueueTestimonialRequest,
  mkNotFoundErr,
  type OkIdResponse,
  okIdSchema,
  serverErrSchema,
  testimonialRequestsTable,
  testimonialsTable,
  unauthenticedReqErrSchema,
} from "lib-server";
import { type NotFoundAPIError, notFoundErrorSchema, type OkResponse, okSchema } from "lib-server";

export const testimonialRest: FastifyPluginAsync = async (app) => {
  app.post("/request", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
      },
    },

    schema: {
      body: createTestimonialReqBodySchema,
      response: {
        201: okIdSchema,
      },
    },

    handler: async (req, rep) => {
      const body = req.body as unknown as CreateTestimonialReqPayload;
      const [request] = await db.insert(testimonialRequestsTable).values(body).returning();
      if (!request) throw new Error("Error creating testimonial request!");
      await enqueueTestimonialRequest(request.id);
      rep.status(201).send({
        id: request.id,
        message: "Testimonial request has been created!",
      } satisfies OkIdResponse);
    },
  });

  app.get("/request", {
    config: {
      auth: {
        strategies: "jwt",
        opts: {
          jwt: {
            aud: "testimonial",
          },
        },
      },
    },

    schema: {
      response: {
        200: testimonialReqSchema,
        401: unauthenticedReqErrSchema,
        404: notFoundErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const id = req.userId!;

      const [request] = await db
        .select()
        .from(testimonialRequestsTable)
        .where(eq(testimonialRequestsTable.id, id))
        .limit(1)
        .then((items) => JSON.parse(JSON.stringify(items)));

      if (!request)
        return rep.status(404).send(mkNotFoundErr("Testimonial request missing or expired!"));

      rep.status(200).send(request);
    },
  });

  app.delete("/request", {
    config: {
      auth: {
        optional: true,
        strategies: "jwt",
        opts: {
          jwt: {
            aud: "testimonial",
          },
        },
      },
    },

    schema: {
      response: {
        200: okSchema,
        401: unauthenticedReqErrSchema,
        404: notFoundErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const id = req.userId!;

      const [request] = await db
        .delete(testimonialRequestsTable)
        .where(eq(testimonialRequestsTable.id, id))
        .returning()
        .then((items) => JSON.parse(JSON.stringify(items)));

      if (!request)
        return rep.status(404).send(mkNotFoundErr("Testimonial request missing or expired!"));

      rep.status(200).send({
        message: "Your request has been deleted!",
      });
    },
  });

  /**
   * Record a new testimonial submission
   */
  app.post("/record", {
    config: {
      auth: {
        strategies: "jwt",
        opts: {
          jwt: {
            aud: "testimonial",
          },
        },
      },
    },
    schema: {
      body: recordTestimonialBodySchema,
      response: {
        201: okSchema,
        404: notFoundErrorSchema,
      },
    },

    handler: async (req, rep) => {
      const { testimonial, rating } = req.body as unknown as RecordTestimonialPayload;

      await db.transaction(async (tx) => {
        const [request] = await tx
          .delete(testimonialRequestsTable)
          .where(eq(testimonialRequestsTable.id, req.userId!))
          .returning();

        if (!request) {
          rep.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: "testimonial request missing or expired!",
          } satisfies NotFoundAPIError);

          throw new Error("Record not found.");
        }

        await tx.insert(testimonialsTable).values({
          first_name: request.first_name,
          last_name_initial: request.last_name_initial,
          company: request.company,
          testimonial,
          rating: rating?.toString(),
        });
      });

      rep.status(201).send({
        message: "Testimonial has been recorded!",
      } satisfies OkResponse);
    },
  });

  /**
   * Get testimonial requests
   */
  app.get("/requests", {
    config: {
      auth: {
        strategies: ["jwt"],
        permissions: {
          roles: ["admin"],
        },
      },
    },

    schema: {
      querystring: getTestimonialReqsQuerySchema,
      response: {
        200: getTestimonialReqsRespSchema,
        500: serverErrSchema,
      },
    },

    handler: async (req, rep) => {
      const query = paginationTransform(req.query as unknown as GetTestimonialQuery);
      const search = query?.search ? `%${query.search}%` : undefined;
      const sqlWhere = search
        ? or(
            ilike(testimonialRequestsTable.first_name, search),
            ilike(testimonialRequestsTable.email, search),
            ilike(testimonialRequestsTable.company, search),
          )
        : undefined;

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(testimonialRequestsTable)
          .where(sqlWhere)
          .orderBy(desc(testimonialRequestsTable.updated_at), desc(testimonialRequestsTable.id))
          .limit(query.limit)
          .offset(query.offset)
          .then((items) => JSON.parse(JSON.stringify(items))),
        db.select({ total: count() }).from(testimonialRequestsTable).where(sqlWhere),
      ]);

      return rep.status(200).send({
        page: query.page,
        limit: query.limit,
        items,
        total,
      });
    },
  });

  /**
   * Get testimonials
   */
  app.get("/", {
    config: {
      auth: {
        strategies: ["jwt"],
        permissions: {
          roles: ["admin"],
        },
      },
    },

    schema: {
      querystring: getTestimonialsQuerySchema,
      response: {
        200: getTestimonialsRespSchema,
        500: serverErrSchema,
      },
    },

    handler: async (req, rep) => {
      const query = paginationTransform(req.query as unknown as GetTestimonialQuery);
      const search = query?.search ? `%${query.search}%` : undefined;
      const sqlWhere = search
        ? or(
            ilike(testimonialsTable.first_name, search),
            ilike(testimonialsTable.testimonial, search),
            ilike(testimonialsTable.company, search),
          )
        : undefined;

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(testimonialsTable)
          .where(sqlWhere)
          .orderBy(desc(testimonialsTable.updated_at), desc(testimonialsTable.id))
          .limit(query.limit)
          .offset(query.offset)
          .then((items) => JSON.parse(JSON.stringify(items))),
        db.select({ total: count() }).from(testimonialsTable).where(sqlWhere),
      ]);

      return rep.status(200).send({
        page: query.page,
        limit: query.limit,
        items,
        total,
      });
    },
  });
};
