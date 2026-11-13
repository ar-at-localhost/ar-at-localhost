import { getStatementSrv, loginSrv } from "./auth";
import { mkMutationSv, mkQuerySv } from "./fetch.svelte";

export const emailLoginMutationSv = mkMutationSv(loginSrv);
export const getStatementQuerySv = mkQuerySv(getStatementSrv);
