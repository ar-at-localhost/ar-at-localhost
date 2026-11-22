import { mkMutationSv, mkQuerySv } from "./fetch.svelte.ts";
import { getLLMConfigSrv, updateLLMConfigSrv } from "./llm.ts";

export const getLLMConfigQuerySv = mkQuerySv(getLLMConfigSrv);
export const updateLLMConfigMutationSv = mkMutationSv(updateLLMConfigSrv);
