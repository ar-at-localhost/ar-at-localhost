<script lang="ts">
  import { Save, SquareText } from '@lucide/svelte';
  import { Separator } from 'ui/svelte/separator/index';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/svelte/select/index';
  import { Crepe as UICrepe, type AIOpts } from 'ui/svelte/crepe/index';
  import type { UserProfile } from '#lib/auth.ts';
  import 'ui/svelte/crepe/crepe.css';
  import { Button } from 'ui/svelte/button/index';
  import { Crepe } from '@milkdown/crepe';
  import type { Snippet } from 'svelte';

  interface Props {
    content: string,
    children?: Snippet<[]>,
    profile: UserProfile,
    id: string,
    readonly?: boolean,
    title?: string,
    subtitle?: string,
    oncontent?: (v: string) => void
  };

  const { children, content, profile, id, readonly, title, oncontent }: Props = $props();
  let crepe: Crepe | undefined = $state.raw(); 
  const crepeId = $derived(id);

  const providers = $derived(profile.keys.map(i => ({
    ...i,
    label: i.type,
    value: i.type,
    disabled: !i.key
  })));

  // svelte-ignore state_referenced_locally
  const provider = $state(providers.find(i => i.value))

  const ai: AIOpts | undefined = $derived(provider?.type == 'Gemini' ? {
    type: provider.value as 'Gemini',
    opts: {
      apiKey: provider.key!
    }
  } : undefined)
</script>

<div class="w-full h-full flex flex-col overflow-hidden gap-1 p-1 relative">
  <div class="flex flex-row items-center justify-between">
    {#if title}
      <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
        <SquareText data-icon="inline-start" />
        <span class="pt-1">{title}</span>
      </h1>
    {/if}

    <div class="flex flex-row items-center gap-1">
      {#if !readonly}
        <Button variant="outline" size="icon" onclick={() => oncontent?.(crepe?.getMarkdown() || '')} disabled={!crepe}>
          <Save />
        </Button>
      {/if}

      {@render children?.()}

      {#if providers.length}
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
      {/if}
    </div>
  </div>

  <Separator />

  <div class="w-full h-full grow overflow-hidden">
    <UICrepe bind:crepe content={content} ai={ai} id={crepeId} readonly={readonly} toolbar={false} />
  </div>
</div>

