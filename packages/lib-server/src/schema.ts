import { timestamp } from "drizzle-orm/pg-core";
import {
  integer,
  object,
  pipe,
  number,
  string,
  undefinedable,
  literal,
  type InferOutput,
  picklist,
  optional,
} from "valibot";

// columns.helpers.ts
export const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};

export const errorSchema = object({
  statusCode: pipe(number(), integer()),
  code: optional(pipe(string())),
  error: picklist([
    "Internal Server Error",
    "Not Found",
    "Bad Request",
    "Unauthorized",
    "Unauthenticed",
  ]),
  message: undefinedable(string()),
});

export type APIError = InferOutput<typeof errorSchema>;

export const serverErrSchema = object({
  ...errorSchema.entries,
  statusCode: literal(500),
  error: literal("Internal Server Error"),
});

export type ServerAPIErr = InferOutput<typeof serverErrSchema>;

export const unauthenticedReqErrSchema = object({
  ...errorSchema.entries,
  statusCode: literal(401),
  error: literal("Unauthenticated"),
});

export type UnauthenticedAPIErr = InferOutput<typeof unauthenticedReqErrSchema>;

export const mkAuthErr = (message: string) =>
  ({ statusCode: 401, error: "Unauthenticated", message }) satisfies UnauthenticedAPIErr;

export const badReqErrorSchema = object({
  ...errorSchema.entries,
  statusCode: literal(400),
  error: literal("Bad Request"),
});

export type BadReqAPIError = InferOutput<typeof badReqErrorSchema>;

export const mkBadReqErr = (message: string) =>
  ({ statusCode: 404, error: "Not Found", message }) satisfies NotFoundAPIError;

export const notFoundErrorSchema = object({
  ...errorSchema.entries,
  statusCode: literal(404),
  error: literal("Not Found"),
});

export type NotFoundAPIError = InferOutput<typeof notFoundErrorSchema>;

export const mkNotFoundErr = (message: string) =>
  ({ statusCode: 404, error: "Not Found", message }) satisfies NotFoundAPIError;

export const okSchema = object({
  message: errorSchema.entries.message,
});

export type OkResponse = InferOutput<typeof okSchema>;

export const okIdSchema = object({
  ...okSchema.entries,
  id: pipe(number(), integer()),
});

export type OkIdResponse = InferOutput<typeof okIdSchema>;
