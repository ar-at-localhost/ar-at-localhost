<script>
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { mkOpts } from "#lib";
  import { LoaderPinwheel, LucideRotateCw, TriangleAlert } from "@lucide/svelte";
  import { findLeadsMutationSv } from "lib/svelte";
  import { Button } from "ui/svelte/button/index";

  const find = findLeadsMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    })
  })
</script>

<div class="grow flex flex-col w-full h-full items-center justify-center p-1 gap-2">
  {#if find.error}
    <div class="flex flex-row items-center justify-center gap-2 text-destructive">
      <TriangleAlert />
      <h1 class="font-bold text-sm">{find.error?.message}</h1>
    </div>
  {:else}
    <div class="flex flex-row items-center justify-center gap-2">
      <LoaderPinwheel class="animate-spin" />
      <h1 class="font-bold text-lg text-gray-900">Coming soon...</h1>
    </div>
  {/if}

  <Button size="lg" disabled={find.isPending} onclick={() => find.mutate({})}>
    <LucideRotateCw data-icon="inline-start" class={find.isPending ? 'animate-spin' :''}/>
    Find Leads
  </Button>
</div>
