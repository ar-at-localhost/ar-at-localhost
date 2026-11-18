<script lang="ts">
  import { onMount } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import { type AIOpts, gemini } from './providers/index';

  interface Props {
    ai?: AIOpts
    content?: string;
    id?: string;
    oncontent?: (content: string) => void;
    readonly?: boolean,
  }

  const { ai, id = "crepe", readonly, content, oncontent }: Props = $props()
  let crepe: Crepe | undefined = undefined;

  onMount(() => {
    crepe = new Crepe({
      root: document.getElementById(id),
      defaultValue: content || `# Welcome to your draft.
---
This is an interactive markdown editor powered by AI. Use it to take notes and write your texts. Get started by deleting this placeholder and adding your own notes 🚀.`,

      features: {
        [Crepe.Feature.TopBar]: true,
        [Crepe.Feature.Toolbar]: true,
        [Crepe.Feature.CodeMirror]: true,
        [Crepe.Feature.Latex]: false,
        ai: true,
      },

      featureConfigs: {
        // TODO: Support Claude / OpenAPI
        ai: ai?.type === 'Gemini' ? {
          provider: gemini(ai.opts!),
          onError: console.error
        } : undefined,

        [Crepe.Feature.TopBar]: {
          buildTopBar(builder) {
            builder.addGroup('custom', 'Custom').addItem('Save', {
              onRun: () => {
                try {
                  oncontent?.(crepe?.getMarkdown() || '')
                } catch {}
              },
              active: () => false,
              icon: '<span class="text-sm px-2">Save</span>',
            })
          },
        }
      },
    })

    crepe?.create();
    if (readonly) {
      crepe?.setReadonly(true)
    }

    return () => {
      crepe?.destroy()
    }
  })
</script>

<div id={id} class="w-full h-full p-0 m-0 overflow-auto relative top-0 left-0"></div>

