<script lang="ts">
  import { getPortfolioSyncPromptQuerySv, setPortfolioSyncPromptMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import Doc from '../doc.svelte';
  import { user } from '#lib/auth.svelte.ts';
  const data = $derived(user.profile)
</script>

{#if data}
  <Doc id="portfolio-prompt" title="Prompt" profile={data} query={getPortfolioSyncPromptQuerySv} mutation={setPortfolioSyncPromptMutationSv}  />
{/if}
