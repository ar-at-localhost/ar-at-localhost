import { getEnv, mkClientSrv } from "lib";
import { object, pipe, integer, type InferOutput, transform, string } from "valibot";

export const userParamSchema = object({
  user: pipe(string(), transform(Number), integer()),
});

export type SyncPortfolioParams = InferOutput<typeof userParamSchema>;
export type SyncPortfolioArgs = [SyncPortfolioParams, never, never];

export const syncPortfolioIntSrv = mkClientSrv({
  baseURL: getEnv("PUBLIC_SRV_INT_URL"),
  endpoint: "/internal/leads/portfolio/sync/:user",
  method: "POST",
});

export type FindLeadsParams = InferOutput<typeof userParamSchema>;
export type FindLeadsArgs = [FindLeadsParams, never, never];

export const findLeadsIntSrv = mkClientSrv({
  baseURL: getEnv("PUBLIC_SRV_INT_URL"),
  endpoint: "/internal/leads/find/:user",
  method: "POST",
});
