<script lang="ts" generics="AI extends 'gemini'">
  import { onDestroy, onMount } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import { gemini, type ProviderOpts } from './providers/index';

  interface Props {
    id?: string;
    content?: string;
    oncontent?: (content?: string) => void;
    ai?: {
      provider: AI,
      opts: ProviderOpts[AI]
    }
  }

  const { ai, id = "crepe", content, oncontent }: Props = $props()
  let crepe: Crepe | undefined = undefined;

  onMount(() => {
    crepe = new Crepe({
      root: document.getElementById(id),
      defaultValue: content || `# Welcome to your draft.
---
This is an interactive markdown editor powered by AI. Use it to take notes and write your texts. Get started by deleting this placeholder and adding your own notes 🚀.`,

      features: {
        toolbar: true,
        ai: true,
        "code-mirror": true,
        latex: false,
      },

      featureConfigs: {
        // TODO: Support Claude / OpenAPI
        ai: ai && ai.provider === 'gemini' ? {
          provider: gemini(ai.opts),
          onError: console.error
        } : undefined
      }
    })

    crepe?.create();

    return () => {
      const c = crepe?.getMarkdown();
      oncontent?.(c)
      crepe?.destroy()
    }
  })
</script>

<div id={id} class="w-full h-full p-0 m-0 overflow-auto relative"></div>

