import { object, string, type InferOutput } from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { fileTransformer } from "./fs.ts";
import type { OkResp } from "./schema.ts";

export const promptSchema = object({
  prompt: string(),
});

export type PromptSchema = InferOutput<typeof promptSchema>;
export type PromptArgs = [never, never, PromptSchema];

export const getPortfolioSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/portfolio",
  transformer: fileTransformer,
});

export const getLeadsSysPromptSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/prompt/sys",
  transformer: fileTransformer,
});

export const setLeadsSysPromptSrv = mkClientSrv<OkResp, PromptArgs>({
  method: "POST",
  endpoint: "/contact/leads/prompt/sys",
});

export const getPortfolioSyncPromptSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/portfolio/prompt",
  transformer: fileTransformer,
});

export const setPortfolioSyncPromptSrv = mkClientSrv<OkResp, PromptArgs>({
  method: "POST",
  endpoint: "/contact/leads/portfolio/prompt",
});

export const getPortfolioSyncSysPromptSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/portfolio/prompt/sys",
  transformer: fileTransformer,
});

export const setPortfolioSyncSysPromptSrv = mkClientSrv<OkResp, PromptArgs>({
  method: "POST",
  endpoint: "/contact/leads/portfolio/prompt/sys",
});

export const setPortfolioWhoamiSrv = mkClientSrv<OkResp, PromptArgs>({
  method: "POST",
  endpoint: "/contact/leads/portfolio/whoami",
});

export const getPortfolioWhoamiSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/portfolio/whoami",
});

export const syncPortfolioSrv = mkClientSrv<File, [never, never, never]>({
  method: "POST",
  endpoint: "/contact/leads/sync-portfolio",
  transformer: fileTransformer,
});

export const findLeadsSrv = mkClientSrv<File, [never, never, never]>({
  method: "POST",
  endpoint: "/contact/leads/find",
});
