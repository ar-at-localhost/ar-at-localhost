<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { CircleDashedCheck, HandCoins } from '@lucide/svelte';
  import {Button} from 'ui/svelte/button/index';
  import {Separator} from 'ui/svelte/separator/index';
  const { children } = $props();

  const received = $derived(page.route.id == '/(app)/testimonials/received');
  const requests = $derived(page.route.id == '/(app)/testimonials/requests');
</script>

<div class="w-full h-full flex flex-col gap-1 relative">
  <div class="flex flex-row items-center justify-between">
    <div class="flex flex-row items-center px-2 pt-1 gap-1">
      <Button variant='outline' disabled={received} onclick={() =>goto('/testimonials/received')}>
        <HandCoins data-icon="inline-start"></HandCoins>
        Received
      </Button>

      <Button variant="outline" disabled={requests} onclick={() => goto('/testimonials/requests')}>
        <CircleDashedCheck data-icon="inline-start" />
        Requests
      </Button>
    </div>
  </div>

  <Separator />

  <div class="w-full grow">
    {@render children()}
  </div>
</div>

