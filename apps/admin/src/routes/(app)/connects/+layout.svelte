<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SquareArrowDownLeft, SquareArrowUpRight } from '@lucide/svelte';
  import { Button } from 'ui/svelte/button/index';
  import { Separator } from 'ui/svelte/separator/index';
  const { children } = $props();

  const inbound = $derived(page.route.id == '/(app)/connects/inbound');
  const outbound = $derived(page.route.id == '/(app)/connects/outbound');
</script>

<div class="w-full h-full flex flex-col gap-1 relative">
  <div class="flex flex-row items-center justify-between">
    <div class="flex flex-row items-center px-2 pt-1 gap-1">
      <Button variant='outline' disabled={inbound} onclick={() =>goto('/connects/inbound')}>
        <SquareArrowDownLeft data-icon="inline-start"/>
        In-bound
      </Button>

      <Button variant="outline" disabled={outbound} onclick={() => goto('/connects/outbound')}>
        <SquareArrowUpRight data-icon="inline-start" />
        Outbound
      </Button>
    </div>
  </div>

  <Separator />

  <div class="w-full grow">
    {@render children()}
  </div>
</div>

