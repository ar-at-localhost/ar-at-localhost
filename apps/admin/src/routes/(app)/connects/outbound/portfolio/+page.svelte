<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { mkOpts } from '#lib';
  import { LucideRotateCw } from '@lucide/svelte';
  import {  downloadFileQuerySv, syncPortfolioMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import { Button } from 'ui/svelte/button/index';
  import { user } from '#lib/auth.svelte.ts';
  import DocAlt from '../doc-alt.svelte';
  const data = $derived(user.profile);


  let download: ReturnType<typeof downloadFileQuerySv> | undefined = $state.raw()

  const sync = syncPortfolioMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    }),

    opts: {
      onSuccess: () => download?.refetch()
    }
  });
</script>

<div class="grow w-full h-full overflow-auto">
  {#if data}
    <DocAlt id="portfolio-portfolio" title="Whoami" profile={data} readonly path="llm/portfolio.md" bind:download>
      <Button variant={'outline'} onclick={sync.mutate.bind(sync)} disabled={sync.isPending}>
        <LucideRotateCw data-icon="inline-start" class={sync.isPending ? 'animate-spin' : ''} />
        { sync.isPending ? 'Syncing portfolio' : 'Sync now' }
      </Button>
    </DocAlt>
  {/if}
</div>
