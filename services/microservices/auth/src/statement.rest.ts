import { type FastifyPluginAsync } from "fastify";
import { getStatementRespSchema } from "lib";
import { connectsTable, db, testimonialsTable, testimonialRequestsTable } from "lib-server";

export const statementRest: FastifyPluginAsync = async (app) => {
  /**
   * Get statement for the dashboard
   */
  app.get("/", {
    config: {
      auth: {
        strategies: "jwt",
        permissions: {
          roles: ["admin"],
        },
        opts: {
          jwt: {
            aud: "auth",
          },
        },
      },
    },

    schema: {
      response: {
        200: getStatementRespSchema,
      },
    },

    handler: async (_req, rep) => {
      const [connects, testimonials, testimonialRequests] = await Promise.all([
        db.$count(connectsTable),
        db.$count(testimonialsTable),
        db.$count(testimonialRequestsTable),
      ]);

      rep.status(200).send({
        connects: {
          total: connects,
          inbound: connects,
          outbound: 0,
        },

        testimonials: {
          total: testimonials + testimonialRequests,
          received: testimonials,
          requested: testimonialRequests,
        },
      });
    },
  });
};
