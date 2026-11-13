import {
  object,
  pipe,
  string,
  email,
  minLength,
  maxLength,
  type InferOutput,
  number,
} from "valibot";

import { mkClientSrv, type Srv } from "./fetch.ts";

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

export const loginSrv: Srv<LoginRespSchema, LoginServiceArgs> = mkClientSrv<
  LoginRespSchema,
  LoginServiceArgs
>({
  method: "POST",
  endpoint: "/auth/email",
});

/*
 * Refresh token
 */
export const refreshTokenSrv = mkClientSrv<LoginRespSchema>({
  method: "POST",
  endpoint: "/auth/refresh-token",
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
