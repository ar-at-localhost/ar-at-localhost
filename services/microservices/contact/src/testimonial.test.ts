import { createTestimonialReqSrv, getFalseTestimonialRequest } from "lib";
import { APIError, getTestAuth } from "lib-server";
import { beforeEach, describe, expect, it } from "vitest";

describe("Testimonial Request", () => {
  describe("create", () => {
    let errPayload: APIError = undefined as unknown as APIError;

    beforeEach(() => {
      errPayload = {
        statusCode: 500,
        error: "Internal Server Error",
        message: "You are not logged in or your session has expired!",
      };
    });

    it("should create record", async () => {
      await getTestAuth();
      const body = getFalseTestimonialRequest();
      const res = await createTestimonialReqSrv({
        bearer: (await getTestAuth()).token,
        body: {
          first_name: body.first_name,
          last_name_initial: body.last_name_initial,
          email: body.email,
          company: body.company,
        },
      });

      expect(res.id).toBeTruthy();
    }, 30_000);

    it("should raise auth error", async () => {
      const body = getFalseTestimonialRequest();
      errPayload.message = "...";
      errPayload.statusCode = 401;
      errPayload.error = "Unauthorized";

      await expect(
        createTestimonialReqSrv({
          body: {
            first_name: body.first_name,
            last_name_initial: body.last_name_initial,
            email: body.email,
            company: body.company,
          },
        }),
      ).rejects.toThrowErrorMatchingSnapshot(JSON.stringify(errPayload, null, 2));
    }, 30_000);

    it("raise validation error", async () => {
      errPayload.message = "Invalid email";
      errPayload.statusCode = 400;
      errPayload.error = "Bad Request";
      errPayload.code = "FST_ERR_VALIDATION";
      const body = getFalseTestimonialRequest();
      body.email = "foo@";

      await expect(
        createTestimonialReqSrv({
          body: {
            first_name: body.first_name,
            last_name_initial: body.last_name_initial,
            email: body.email,
            company: body.company,
          },
        }),
      ).rejects.toThrowErrorMatchingSnapshot(JSON.stringify(errPayload, null, 2));
    });
  });
});
