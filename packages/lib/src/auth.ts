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
} from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { recordSchema } from "./schema.ts";

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
 * Profile
 */
export const getProfileRespSchema = object({
  first_name: string(),
  last_name: string(),
  email: pipe(string(), email()),
  roles: pipe(array(picklist(["admin", "system", "unknown"]))),
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
