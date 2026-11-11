import { object, pipe, string, email, minLength, maxLength, type InferOutput } from "valibot";

import { mkClientSrv, type Srv } from "./fetch.ts";

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

export const refreshTokenSrv = mkClientSrv<LoginRespSchema>({
  method: "POST",
  endpoint: "/auth/refresh-token",
});
