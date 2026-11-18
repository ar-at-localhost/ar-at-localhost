<script lang="ts">
  import { getPortfolioSyncSysPromptQuerySv, setPortfolioSyncSysPromptMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import Doc from '../doc.svelte';
  import { user } from '#lib/auth.svelte.ts';
  const data = $derived(user.profile)
</script>

{#if data}
  <Doc id="portfolio-sys-prompt" title="System Prompt" profile={data} query={getPortfolioSyncSysPromptQuerySv} mutation={setPortfolioSyncSysPromptMutationSv}  />
{/if}
