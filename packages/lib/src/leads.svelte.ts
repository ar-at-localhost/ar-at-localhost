import { mkMutationSv, mkQuerySv } from "./fetch.svelte";
import {
  createLeadSrv,
  findLeadsSrv,
  getLeadsSrv,
  jdToLeadSrv,
  syncPortfolioSrv,
} from "./leads.ts";

export const getLeadsQuerySv = mkQuerySv(getLeadsSrv);
export const findLeadsMutationSv = mkMutationSv(findLeadsSrv);
export const jdToLeadMutationSv = mkMutationSv(jdToLeadSrv);
export const createLeadMutationSv = mkMutationSv(createLeadSrv);
export const syncPortfolioMutationSv = mkMutationSv(syncPortfolioSrv);
