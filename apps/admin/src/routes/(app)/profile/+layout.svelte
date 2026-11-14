<script>
  import { CircleUser } from '@lucide/svelte';
  import { Separator } from 'ui/svelte/separator/index';
  const { children } = $props();

</script>

<div class="w-full h-full flex flex-col gap-1 relative">
  <div class="flex flex-row items-center justify-between">
    <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
      <CircleUser data-icon="inline-start" />
      <span class="pt-1">Your profile</span>
    </h1>
  </div>

  <Separator />

  <div class="w-full grow">
    {@render children()}
  </div>
</div>

