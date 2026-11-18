<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { mkOpts } from '#lib';
  import { LucideRotateCw } from '@lucide/svelte';
  import { getPortfolioQuerySv, syncPortfolioMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import { Button } from 'ui/svelte/button/index';
  import Doc from '../doc.svelte';
  import { user } from '#lib/auth.svelte.ts';
  const data = $derived(user.profile);


  const result = getPortfolioQuerySv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    })
  })

  const sync = syncPortfolioMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    }),

    opts: {
      onSuccess: () => result.refetch()
    }
  });
</script>

<div class="grow w-full h-full overflow-auto">
  {#if data}
    <Doc id="portfolio-portfolio" title="Whoami" profile={data} query={getPortfolioQuerySv}  />
  {/if}

  <div class="absolute bottom-1 right-1">
    <Button size="lg" class="px-12!" onclick={sync.mutate.bind(sync)} disabled={sync.isPending}>
      <LucideRotateCw data-icon="inline-start" class={sync.isPending ? 'animate-spin' : ''} />
      { sync.isPending ? 'Syncing portfolio' : 'Sync now' }
    </Button>
  </div>
</div>
