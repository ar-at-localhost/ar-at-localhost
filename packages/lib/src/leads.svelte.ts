import { mkMutationSv, mkQuerySv } from "./fetch.svelte";
import {
  findLeadsSrv,
  getLeadsSysPromptSrv,
  getPortfolioSrv,
  getPortfolioSyncPromptSrv,
  getPortfolioSyncSysPromptSrv,
  getPortfolioWhoamiSrv,
  setLeadsSysPromptSrv,
  setPortfolioSyncPromptSrv,
  setPortfolioSyncSysPromptSrv,
  setPortfolioWhoamiSrv,
  syncPortfolioSrv,
} from "./leads.ts";

export const getPortfolioQuerySv = mkQuerySv(getPortfolioSrv);

export const getLeadsSysPromptQuerySv = mkQuerySv(getLeadsSysPromptSrv);
export const setLeadsSysPromptMutationSv = mkMutationSv(setLeadsSysPromptSrv);

export const getPortfolioSyncPromptQuerySv = mkQuerySv(getPortfolioSyncPromptSrv);
export const setPortfolioSyncPromptMutationSv = mkMutationSv(setPortfolioSyncPromptSrv);

export const getPortfolioSyncSysPromptQuerySv = mkQuerySv(getPortfolioSyncSysPromptSrv);
export const setPortfolioSyncSysPromptMutationSv = mkMutationSv(setPortfolioSyncSysPromptSrv);

export const getPortfolioWhoamiQuerySv = mkQuerySv(getPortfolioWhoamiSrv);
export const setPortfolioWhoamiMutationSv = mkMutationSv(setPortfolioWhoamiSrv);

export const syncPortfolioMutationSv = mkMutationSv(syncPortfolioSrv);
export const findLeadsMutationSv = mkMutationSv(findLeadsSrv);
