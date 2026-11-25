import { check, type InferOutput, object, pipe, string } from "valibot";

import { mkClientSrv } from "./fetch.ts";
import { fileTransformer } from "./fs.ts";
import { contentSchema } from "./leads.ts";
import { type OkResp, tStr } from "./schema.ts";

export const filePathSchema = pipe(
  string(tStr("Path")),
  check((i) => !i.startsWith("/") && !/(^|\/)\.\.(\/|$)/.test(i)),
);

/*
 * Download file
 * ----------------------------------------
 */
export const downloadFileQuery = object({
  path: filePathSchema,
});

export type DownloadFileQuery = InferOutput<typeof downloadFileQuery>;
export type DownloadFileArgs = [never, DownloadFileQuery, never];

export const downloadFileSrv = mkClientSrv<File, DownloadFileArgs>({
  method: "GET",
  endpoint: "/auth/file",
  transformer: fileTransformer,
});

/*
 * Upload file
 * ----------------------------------------
 */
export const uploadFileBody = object({
  path: filePathSchema,
  ...contentSchema.entries,
});

export type UploadFileBody = InferOutput<typeof uploadFileBody>;
export type UploadFileArgs = [never, never, UploadFileBody];

export const uploadFileSrv = mkClientSrv<OkResp, UploadFileArgs>({
  method: "POST",
  endpoint: "/auth/file",
});
