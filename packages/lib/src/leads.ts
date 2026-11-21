import {
  array,
  domain,
  integer,
  isoTimestamp,
  maxValue,
  minLength,
  minValue,
  nullish,
  number,
  object,
  optional,
  partial,
  pick,
  picklist,
  pipe,
  string,
  transform,
  union,
  url,
  type InferOutput,
} from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { fileTransformer } from "./fs.ts";
import {
  paginatedRespSchema,
  paginationSearchSchema,
  recordSchema,
  required,
  requiredStr,
  tNum,
  tooHigh,
  tooLow,
  tStr,
  type OkResp,
} from "./schema.ts";

export type LeadStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "replied"
  | "proposal"
  | "won"
  | "lost"
  | "rejected";

export const leadStatuses = [
  "new",
  "reviewed",
  "contacted",
  "replied",
  "proposal",
  "won",
  "lost",
  "rejected",
] as const;

export const promptSchema = object({
  prompt: string(),
});

export type PromptSchema = InferOutput<typeof promptSchema>;
export type PromptArgs = [never, never, PromptSchema];

export const contentSchema = object({
  content: string(),
});

export type ContentBody = InferOutput<typeof contentSchema>;
export type ContentArgs = [never, never, ContentBody];

/*
 * Leads
 * ----------------------------------------
 */
/**
 * Get lead finder system prompt
 */
export const getLeadsSysPromptSrv = mkClientSrv<File, [never, never, never]>({
  method: "GET",
  endpoint: "/contact/leads/prompt/sys",
  transformer: fileTransformer,
});

/**
 * Set lead finder system prompt
 */
export const setLeadsSysPromptSrv = mkClientSrv<OkResp, PromptArgs>({
  method: "POST",
  endpoint: "/contact/leads/prompt/sys",
});

/**
 * Leads
 * ----------------------------------------
 */
export const leadConcernSchema = string("Concern must be text!");

export const leadEvidenceSchema = object({
  title: optional(string("Title must be text!")),
  url: pipe(string("URL is required!"), url("URL must be url!")),
});

export const leadMatchedRepoSchema = string("<repo> OR <owner>/<repo>");

export const leadSignalSchema = object({
  type: string(tStr("Type")),
  summary: string(tStr("Summary")),
});

export const createLeadSchema = object({
  angle: requiredStr("Search angle"),
  company: string(required("Company")),
  concerns: array(leadConcernSchema),
  contact_role: nullish(string(tStr("Contact role"))),
  domain: pipe(string(tStr("Domain")), domain("Please provide valid domain!")),
  evidence: array(leadEvidenceSchema),
  fit_score: pipe(
    union([string(), number()], "Fit score should be a number!"),
    transform(Number),
    integer(tNum("Fit score")),
    minValue(1, tooLow("Fit score", 1)),
    maxValue(10, tooHigh("Fit score", 10)),
  ),
  fit_reason: requiredStr("Fit reason"),
  matched_repos: array(leadMatchedRepoSchema),
  notes: nullish(string(tStr("Notes"))),
  reject_reason: nullish(string(tStr("Rejection reason"))),
  signals: pipe(array(leadSignalSchema), minLength(1, "At-least 1 signal must be provided!")),
  snooze_until: nullish(pipe(string(), isoTimestamp())),
  status: pipe(string("Invalid status!"), picklist(leadStatuses, "Invalid status!")),
  url: nullish(pipe(string("Invalid URL!"), url("Invalid URL!"))),
});

export type CreateLeadBody = InferOutput<typeof createLeadSchema>;

export const leadSchema = object({
  ...recordSchema.entries,
  ...createLeadSchema.entries,
  user_id: recordSchema.entries.id,
});

export const getLeadsQuerySchema = object({
  ...paginationSearchSchema.entries,
  ...partial(pick(leadSchema, ["fit_score", "status"])).entries,
});

export type GetLeadsQuery = InferOutput<typeof getLeadsQuerySchema>;

export type Lead = InferOutput<typeof leadSchema>;
export const leadsRespSchema = paginatedRespSchema(leadSchema);

/**
 * Get leads (Search through existing leads)
 */
export const getLeadsSrv = mkClientSrv<OkResp, [never, GetLeadsQuery, never]>({
  method: "GET",
  endpoint: "/contact/leads",
});

/**
 * Convert job description to lead
 */
export const jdToLeadSrv = mkClientSrv<Lead, [never, never, ContentBody]>({
  method: "POST",
  endpoint: "/contact/leads/from-jd",
});

/**
 * Create new lead
 */
export const createLeadSrv = mkClientSrv<Lead, [never, never, CreateLeadBody]>({
  method: "POST",
  endpoint: "/contact/leads",
});

/*
 * Portfolio
 */
export const syncPortfolioSrv = mkClientSrv<File, [never, never, never]>({
  method: "POST",
  endpoint: "/contact/leads/sync-portfolio",
  transformer: fileTransformer,
});

/*
 * Find leads
 */
export const findLeadsSrv = mkClientSrv<File, [never, never, never]>({
  method: "POST",
  endpoint: "/contact/leads/find",
});
