import {
  array,
  type InferOutput,
  integer,
  maxValue,
  minValue,
  nullable,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
  undefinedable,
  type GenericSchema,
  isoTimestamp,
} from "valibot";

export const required = (kind: string) => `${kind} is required!`;
export const tooLong = (kind: string, max: number) => `${kind} too long (max: ${max})`;
export const tooShort = (kind: string, min: number) =>
  min == 1 ? `${kind} is required!` : `${kind} too short (min: ${min})`;

export const isValibot = (schema: unknown): schema is GenericSchema =>
  !!schema && typeof schema == "object" && (schema as any).kind === "schema";

export const id = pipe(number("ID must be a number!"), integer("ID must be an integer!"));

export const timestamps = object({
  created_at: pipe(string(), isoTimestamp()),
  updated_at: undefinedable(nullable(pipe(string(), isoTimestamp()))),
  deleted_at: undefinedable(nullable(pipe(string(), isoTimestamp()))),
});

export const recordSchema = object({
  id,
  ...timestamps.entries,
});

/*
 * Pagination
 */
export const paginationSchema = partial(
  object({
    page: pipe(optional(string(), "1"), transform(Number), minValue(1)),
    limit: pipe(optional(string(), "10"), transform(Number), minValue(10), maxValue(50)),
  }),
);

export const paginationSearchSchema = object({
  ...paginationSchema.entries,
  search: optional(string()),
});

export type PaginationAttrs = InferOutput<typeof paginationSchema>;

export const paginationQueryTransform = <T extends PaginationAttrs>(v: T) => {
  const page = v.page || 1;
  const limit = v.limit || 10;
  const offset = (page - 1) * limit;

  return {
    ...v,
    page,
    limit,
    offset,
  };
};

export const paginatedRespSchema = <Item extends GenericSchema>(item: Item) =>
  pipe(
    object({
      offset: number(),
      total: number(),
      page: number(),
      limit: number(),
      items: array(item),
    }),

    transform((v) => ({
      ...v,
      next: v.page * v.limit < v.total ? v.page + 1 : undefined,
      prev: v.page > 1 ? v.page - 1 : undefined,
      nth_first: v.offset + 1,
      nth_last: v.offset + v.items.length,
    })),
  );

export type PaginatedAPIResp<Schema extends GenericSchema> = InferOutput<
  ReturnType<typeof paginatedRespSchema<Schema>>
>;

export type APIError = {
  statusCode: number;
  error: string;
  message: string;
};

export type OkResp = {
  message: string;
};
