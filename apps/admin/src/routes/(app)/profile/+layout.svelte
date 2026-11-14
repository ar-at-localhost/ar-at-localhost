<script>
  import { CircleUser } from '@lucide/svelte';
  import { Separator } from 'ui/svelte/separator/index';
  const { children } = $props();

</script>

<div class="w-full h-full flex flex-col gap-1 relative px-2 pt-1">
  <div class="flex flex-row items-center justify-between">
    <h1 class="flex flex-row items-center gap-2 text-lg font-medium">
      <CircleUser data-icon="inline-start" />
      <span class="pt-1">Your profile</span>
    </h1>

    <span class="text-sm">Review and update your profile!</span>
  </div>

  <Separator />

  <div class="w-full grow">
    {@render children()}
  </div>
</div>

