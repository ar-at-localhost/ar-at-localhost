import { loginSrv } from "./auth";
import { mkMutationSv } from "./fetch.svelte";

export const emailLoginMutationSv = mkMutationSv(loginSrv);
