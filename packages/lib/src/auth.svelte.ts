import { getProfileSrv, getStatementSrv, loginSrv, updateProfileSrv } from "./auth";
import { mkMutationSv, mkQuerySv } from "./fetch.svelte";

export const emailLoginMutationSv = mkMutationSv(loginSrv);

export const getProfileQuerySv = mkQuerySv(getProfileSrv);
export const updateProfileMutationSv = mkMutationSv(updateProfileSrv);

export const getStatementQuerySv = mkQuerySv(getStatementSrv);
