<script lang="ts">
  import { onMount } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import { type AIOpts, gemini } from './providers/index';

  interface Props {
    ai?: AIOpts
    content?: string;
    crepe?: Crepe | undefined,
    id?: string;
    readonly?: boolean,
    toolbar?: boolean,
  }

  let { ai, crepe = $bindable(), id = "crepe", readonly, toolbar, content }: Props = $props();

  onMount(() => {
    const instance = new Crepe({
      root: document.getElementById(id),
      defaultValue: content || `# Welcome to your draft.
---
This is an interactive markdown editor powered by AI. Use it to take notes and write your texts. Get started by deleting this placeholder and adding your own notes 🚀.`,

      features: {
        [Crepe.Feature.TopBar]: toolbar,
        [Crepe.Feature.Toolbar]: true,
        [Crepe.Feature.CodeMirror]: true,
        [Crepe.Feature.Latex]: false,
        ai: true,
      },

      featureConfigs: {
        // TODO: Support Claude / OpenAPI
        ai: ai?.type === 'Google AI' ? {
          provider: gemini(ai.opts!),
          onError: console.error
        } : undefined,
      },
    })

    let destroyed = false;

    instance?.create().then(() => {
      if (destroyed) return;
      crepe = instance;

      if (readonly) {
        crepe?.setReadonly(true)
      }
    });

    return () => {
      crepe?.destroy().then(() => destroyed = true);
    }
  })
</script>

<div id={id} class="w-full h-full p-0 m-0"></div>
