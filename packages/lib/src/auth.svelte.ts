import { getProfileSrv, getStatementSrv, loginSrv } from "./auth";
import { mkMutationSv, mkQuerySv } from "./fetch.svelte";

export const emailLoginMutationSv = mkMutationSv(loginSrv);
export const getProfileQuerySv = mkQuerySv(getProfileSrv);
export const getStatementQuerySv = mkQuerySv(getStatementSrv);
