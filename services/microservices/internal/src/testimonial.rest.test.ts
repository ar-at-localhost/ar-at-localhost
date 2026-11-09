import { BadReqAPIError } from "lib-server";
import { describe, expect, it } from "vitest";

import { postTestimonialReqInt } from "./testimonial.rest";

const baseURL = "http://localhost:8001";

describe("Contact", () => {
  describe("create", () => {
    it("should create a record", async () => {
      const result = await postTestimonialReqInt({
        baseURL,
        params: {
          id: 1,
        },
      });

      expect(result).toBeTruthy();
      expect(result.message).toBe("Request has been processed successfully!");
    }, 30_000);

    it("raise validation error", async () => {
      await expect(
        postTestimonialReqInt({
          baseURL,
          params: {
            id: "-1" as unknown as number,
          },
        }),
      ).rejects.toThrow({
        statusCode: 400,
        code: "FST_ERR_VALIDATION",
        error: "Bad Request",
        message: "Invalid id!",
      } satisfies BadReqAPIError);
    });
  });
});
