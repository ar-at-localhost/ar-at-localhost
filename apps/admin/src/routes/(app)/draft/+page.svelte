<script lang="ts">
  import { SquareText } from '@lucide/svelte';
  import { Separator } from 'ui/svelte/separator/index';
  import { Select, SelectContent, SelectItem, SelectTrigger } from 'ui/svelte/select/index';
  import SelectValue from 'ui/svelte/select/select-value.svelte';
  import { Crepe } from 'ui/svelte/crepe/index';
  import { onMount } from 'svelte';
  const { data } = $props();
  const providers = $derived(data.assistants.map(i => ({
    ...i,
    label: i.assistant.slice(0,1).toUpperCase().concat(i.assistant.slice(1)),
    value: i.assistant,
    disabled: !i.key
  })));

  // svelte-ignore state_referenced_locally
  const provider = $state(providers.find(i => i.value))

  const ai = $derived(provider?.value == 'gemini' ? {
    provider: provider.value as 'gemini',
    opts: {
      apiKey: provider.key!
    }
  } : undefined)

  let draft = $state('');

  onMount(() => {
    draft = localStorage.getItem('draft') || '';

    return (() => {
      localStorage.setItem('draft', draft);
    })
  })
</script>

<div class="w-full h-full flex flex-col gap-1 p-1 relative">
  <div class="flex flex-row items-center justify-between">
    <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
      <SquareText data-icon="inline-start" />
      <span class="pt-1">AI Draft</span>
    </h1>

    <Select type="single" items={providers} value={provider?.value}>
      <SelectTrigger>
        <SelectValue placeholder="Choose a provider"/>
      </SelectTrigger>

      <SelectContent>
        {#each providers as provider}
          <SelectItem {...provider} />
        {/each}
      </SelectContent>
    </Select>
  </div>

  <Separator />

  <div class="w-full  h-full grow">
    <Crepe ai={ai} oncontent={(c) => { if (c) draft = c;}} />
  </div>
</div>

