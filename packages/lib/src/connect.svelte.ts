import { fetchConnectsSrv } from "./connect";
import { mkQuerySv } from "./fetch.svelte";

export const fetchConnectsQuerySv = mkQuerySv(fetchConnectsSrv);
