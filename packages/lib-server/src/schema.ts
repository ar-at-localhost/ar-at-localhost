import { toJsonSchema } from "@valibot/to-json-schema";
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
  type GenericSchema,
} from "valibot";

// columns.helpers.ts
export const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};

export const knownError = new Set([
  "Internal Server Error",
  "Not Found",
  "Bad Request",
  "Unauthorized",
  "Unauthenticated",
]);

export const errorSchema = object({
  statusCode: pipe(number(), integer()),
  code: optional(pipe(string())),
  error: picklist(Array.from(knownError)),
  message: undefinedable(string()),
});

export type APIError = InferOutput<typeof errorSchema>;

export const serverErrSchema = object({
  ...errorSchema.entries,
  statusCode: literal(500),
  error: literal("Internal Server Error"),
});

export type ServerAPIErr = InferOutput<typeof serverErrSchema>;
export const serverErr: ServerAPIErr = {
  statusCode: 500,
  error: "Internal Server Error",
  message: "Something went wrong!",
};

export const unauthenticedReqErrSchema = object({
  ...errorSchema.entries,
  statusCode: literal(401),
  error: literal("Unauthenticated"),
});

export type UnauthenticatedAPIErr = InferOutput<typeof unauthenticedReqErrSchema>;

export const mkAuthErr = (message: string) =>
  ({ statusCode: 401, error: "Unauthenticated", message }) satisfies UnauthenticatedAPIErr;

export const badReqErrorSchema = object({
  ...errorSchema.entries,
  statusCode: literal(400),
  error: literal("Bad Request"),
});

export type BadReqAPIError = InferOutput<typeof badReqErrorSchema>;

export const mkBadReqErr = (message: string) =>
  ({ statusCode: 400, error: "Bad Request", message }) satisfies BadReqAPIError;

export const notFoundErrorSchema = object({
  ...errorSchema.entries,
  statusCode: literal(404),
  error: literal("Not Found"),
});

export type NotFoundAPIError = InferOutput<typeof notFoundErrorSchema>;

export const mkNotFoundErr = (message: string) =>
  ({ statusCode: 404, error: "Not Found", message }) satisfies NotFoundAPIError;

export const tooManyRequestsErrorSchema = object({
  ...errorSchema.entries,
  statusCode: literal(429),
  error: literal("Too Many Requests"),
});

export type TooManyRequestsAPIError = InferOutput<typeof tooManyRequestsErrorSchema>;

export const mkTooManyRequestsErr = (message: string) =>
  ({ statusCode: 429, error: "Too Many Requests", message }) satisfies TooManyRequestsAPIError;

export const okSchema = object({
  message: errorSchema.entries.message,
});

export type OkResponse = InferOutput<typeof okSchema>;

export const idSchema = pipe(number(), integer());

export const okIdSchema = object({
  ...okSchema.entries,
  id: idSchema,
});

export type OkIdResponse = InferOutput<typeof okIdSchema>;

/*
 * Valibot to swagger/openapi transformation
 --------------------------------------------
*/
/**
 * Strips empty required[] from openapi schema, that would otherwise be invalid
 */
const stripEmptyRequired = <T>(schema: T): T => {
  if (Array.isArray(schema)) return schema.map((i) => stripEmptyRequired(i)) as T;
  if (schema && typeof schema === "object") {
    return Object.fromEntries(
      Object.entries(schema as unknown[])
        .filter(([k, v]) => !(k === "required" && Array.isArray(v) && v.length === 0))
        .map(([k, v]) => [k, stripEmptyRequired(v)]),
    ) as T;
  }

  return schema;
};

/**
 * A wrapper over valibot's toJsonSchema to strip any empty required[]
 */
export const toJsonSchemaApp = (schema: GenericSchema) => {
  const result = toJsonSchema(schema, {
    target: "openapi-3.0",
    errorMode: "ignore",
  });

  return stripEmptyRequired(result);
};
