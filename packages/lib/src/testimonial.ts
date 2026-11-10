import {
  randCompanyName,
  randEmail,
  randFirstName,
  randLastName,
  randNumber,
  randPastDate,
} from "@ngneat/falso";
import {
  type InferOutput,
  isoTimestamp,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nullable,
  object,
  omit,
  partial,
  pipe,
  rfcEmail,
  string,
  transform,
  undefinedable,
} from "valibot";

import { mkClientSrv } from "./fetch.ts";
import {
  paginatedRespSchema,
  paginationSchema,
  recordSchema,
  tooLong,
  tooShort,
} from "./schema.ts";

/*
 * Create testimonial request
 */
export const createTestimonialReqBodySchema = object({
  first_name: pipe(
    string("Invalid name!"),
    minLength(1, tooShort("First Name", 1)),
    maxLength(64, tooLong("First Name", 65)),
  ),
  last_name_initial: undefinedable(
    pipe(string("Invalid name!"), maxLength(1, "Please provide initial only (i.e. A).")),
  ),
  company: pipe(
    string("Invalid company name!"),
    minLength(1, tooShort("Company name", 1)),
    maxLength(64, tooLong("Company name", 64)),
  ),
  email: pipe(string("Invalid email!"), rfcEmail("Invalid email!")),
});

export type CreateTestimonialReqPayload = InferOutput<typeof createTestimonialReqBodySchema>;

export const testimonialReqSchema = object({
  ...createTestimonialReqBodySchema.entries,
  ...recordSchema.entries,
  expiry: pipe(string(), isoTimestamp()),
});

export type TestimonialRequest = InferOutput<typeof testimonialReqSchema>;

export const createTestimonialReqSrv = mkClientSrv<
  TestimonialRequest,
  [never, never, CreateTestimonialReqPayload]
>({
  method: "POST",
  endpoint: "/contact/testimonial/request",
});

/*
 * Get testimonial request info
 */
export const getTestimonialReqSrv = mkClientSrv<TestimonialRequest, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/testimonial/request",
});

/*
 * Delete testimonial request info
 */
export const delTestimonialReqSrv = mkClientSrv<TestimonialRequest, [never, never, never]>({
  method: "DELETE",
  endpoint: "/contact/testimonial/request",
});

/*
 * record testimonial
 */
export const recordTestimonialBodySchema = object({
  testimonial: pipe(
    string("Invalid message"),
    minLength(128, tooShort("Testimonial", 128)),
    maxLength(10000, tooLong("Testimonial", 10000)),
  ),
  rating: undefinedable(
    pipe(
      string("Invalid rating!"),
      transform(Number),
      minValue(1, "Minimum rating should be 1."),
      maxValue(5, "Minimum rating should be 5."),
      transform(String),
    ),
  ),
});

export type RecordTestimonialPayload = InferOutput<typeof recordTestimonialBodySchema>;

export const recordTestimonialSrv = mkClientSrv<
  {
    message?: string;
  },
  [never, never, RecordTestimonialPayload]
>({
  method: "POST",
  endpoint: "/contact/testimonial/record",
});

/*
 * Get testimonial requests
 */
export const getTestimonialReqsQuerySchema = partial(
  object({
    ...paginationSchema.entries,
    search: pipe(string()),
  }),
);

export type GetTestimonialReqsQuery = InferOutput<typeof getTestimonialReqsQuerySchema>;
export const getTestimonialReqsRespSchema = paginatedRespSchema(testimonialReqSchema);
export type GetTestimonialReqsResp = InferOutput<typeof getTestimonialReqsRespSchema>;

export const getTestimonialReqsSrv = mkClientSrv<
  GetTestimonialReqsResp,
  [never, GetTestimonialReqsQuery, never]
>({
  method: "GET",
  endpoint: "/contact/testimonial/requests",
});

/*
 * Get testimonials
 */
export const testimonialSchema = object({
  ...omit(testimonialReqSchema, ["email", "expiry"]).entries,
  testimonial: string(),
  rating: nullable(pipe(string(), transform(Number), minValue(1), maxValue(5))),
});

export type TestimonialRecord = InferOutput<typeof testimonialSchema>;

export const getTestimonialsQuerySchema = partial(
  object({
    ...paginationSchema.entries,
    search: pipe(string()),
  }),
);

export type GetTestimonialQuery = InferOutput<typeof getTestimonialsQuerySchema>;
export const getTestimonialsRespSchema = paginatedRespSchema(testimonialSchema);
export type GetTestimonialsResp = InferOutput<typeof getTestimonialsRespSchema>;
export type GetTestimonialArgs = [never, GetTestimonialQuery, never];

export const getTestimonialsSrv = mkClientSrv<GetTestimonialsResp, GetTestimonialArgs>({
  method: "GET",
  endpoint: "/contact/testimonial",
});

export const getFalseTestimonialRequest = () => {
  const created_at = randPastDate();

  return {
    id: randNumber({ min: 1 }),
    first_name: randFirstName(),
    last_name_initial: randLastName().slice(0, 1),
    company: randCompanyName(),
    email: randEmail(),
    expiry: created_at.toISOString(),
    created_at: created_at.toISOString(),
    updated_at: created_at.toISOString(),
    deleted_at: null,
  } satisfies TestimonialRequest;
};
