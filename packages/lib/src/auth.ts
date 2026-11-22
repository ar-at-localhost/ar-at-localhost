import {
  object,
  pipe,
  string,
  email,
  minLength,
  maxLength,
  type InferOutput,
  number,
  array,
  picklist,
  integer,
  optional,
  omit,
  partial,
} from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { recordSchema, timestamps, tooShort } from "./schema.ts";

/*
 * Login with email
 */
const err = "Invalid email or password!";
export const emailLoginBodySchema = object({
  email: pipe(string(err), email(err)),
  password: pipe(string(err), minLength(8, err), maxLength(32, err)),
});

export type EmailLoginBody = InferOutput<typeof emailLoginBodySchema>;

export const loginRespSchema = object({
  token: pipe(string("Invalid token")),
  refreshToken: pipe(string("Invalid token")),
});

export type LoginRespSchema = InferOutput<typeof loginRespSchema>;
export type LoginServiceArgs = [never, never, EmailLoginBody];

export const loginSrv = mkClientSrv<LoginRespSchema, LoginServiceArgs>({
  method: "POST",
  endpoint: "/auth/email",
});

/*
 * Refresh token
 */
export const refreshTokenSrv = mkClientSrv<LoginRespSchema, LoginServiceArgs>({
  method: "POST",
  endpoint: "/auth/refresh-token",
});

/*
 * Get Profile
 */
export const userKeys = ["Anthropic", "Google AI", "GitHub", "OpenAI"] as const;
export type UserKey = (typeof userKeys)[number];
export type UserKeysFlat = Record<UserKey, string | undefined>;
export const userKeyset: Readonly<Set<UserKey>> = new Set<UserKey>(userKeys);
export const userHandles = ["GitHub"] as const;
export type UserHandle = (typeof userHandles)[number];
export const userHandleset: Readonly<Set<UserHandle>> = new Set<UserHandle>(userHandles);

export const userKeysSchema = object({
  user_id: pipe(number(), integer()),
  type: pipe(string(), picklist(Array.from(userKeyset))),
  key: optional(string()),
  ...timestamps.entries,
});

export const userHandlesSchema = object({
  user_id: pipe(number(), integer()),
  type: pipe(string(), picklist(Array.from(userHandleset))),
  handle: optional(string()),
  ...timestamps.entries,
});

export const getProfileRespSchema = object({
  first_name: string(),
  last_name: string(),
  email: pipe(string(), email()),
  roles: pipe(array(picklist(["admin", "system", "unknown"]))),
  keys: array(userKeysSchema),
  handles: array(userHandlesSchema),
  ...recordSchema.entries,
});

export type GetProfileResp = InferOutput<typeof getProfileRespSchema>;
export type UserInfo = GetProfileResp;
export type GetProfileArgs = [never, never, never];

export const getProfileSrv = mkClientSrv<GetProfileResp>({
  method: "GET",
  endpoint: "/auth/profile",
});

/*
 * Update profile
 */
export const updateProfileSchema = partial(
  object({
    personal_info: partial(
      object({
        first_name: pipe(string("First name is required"), minLength(1, tooShort("First name", 1))),
        last_name: pipe(string("Last name is required"), minLength(1, tooShort("Last name", 1))),
      }),
    ),
    keys: array(omit(userKeysSchema, ["user_id"])),
    handles: array(omit(userHandlesSchema, ["user_id"])),
  }),
);

export type UpdateUserBody = InferOutput<typeof updateProfileSchema>;
export type UpdateUserArgs = [never, never, UpdateUserBody];

export const updateProfileSrv = mkClientSrv<GetProfileResp, UpdateUserArgs>({
  method: "PATCH",
  endpoint: "/auth/profile",
});

/*
 * Statement
 */
export const getStatementRespSchema = object({
  connects: object({
    inbound: number(),
    outbound: number(),
    total: number(),
  }),
  testimonials: object({
    received: number(),
    requested: number(),
    total: number(),
  }),
});

export type GetStatementResp = InferOutput<typeof getStatementRespSchema>;
export type GetStatementArgs = [never, never, never];

export const getStatementSrv = mkClientSrv<GetStatementResp>({
  method: "GET",
  endpoint: "/auth/statement",
});
