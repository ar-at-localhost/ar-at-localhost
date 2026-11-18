<script lang="ts">
  import { getPortfolioWhoamiQuerySv, setPortfolioWhoamiMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import Doc from '../doc.svelte';
  import { user } from '#lib/auth.svelte.ts';
  const data = $derived(user.profile)
</script>

{#if data}
  <Doc id="portfolio-sys-whomai" title="System Prompt" profile={data} query={getPortfolioWhoamiQuerySv} mutation={setPortfolioWhoamiMutationSv}  />
{/if}
