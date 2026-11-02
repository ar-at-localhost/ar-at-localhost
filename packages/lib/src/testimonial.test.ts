import { parseAsync } from "valibot";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createTestimonialReqBodySchema,
  getFalseTestimonialRequest,
  TestimonialRequest,
} from "./testimonial";

let testimonial: TestimonialRequest;

describe("Testimonial Request", () => {
  beforeEach(() => {
    testimonial = getFalseTestimonialRequest();
  });

  describe("Type", () => {
    it("Enforces type", () => {
      expect(testimonial).toBeTruthy();
    });
  });

  describe("Create body schema", () => {
    it("Allows good values", async () => {
      const result = await parseAsync(createTestimonialReqBodySchema, testimonial);
      expect(result.first_name).toEqual(testimonial.first_name);
    });

    it("Rejects bad values", async () => {
      testimonial.first_name = "";
      await expect(parseAsync(createTestimonialReqBodySchema, testimonial)).rejects.toThrow();
    });
  });
});
