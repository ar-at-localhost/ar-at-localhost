import { mkMutationSv, mkQuerySv } from "./fetch.svelte";
import { downloadFileSrv, uploadFileSrv } from "./file.ts";

export const downloadFileQuerySv = mkQuerySv(downloadFileSrv);
export const uploadFileMutationSv = mkMutationSv(uploadFileSrv);
