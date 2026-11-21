<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '#lib/auth.svelte.ts';
  import DocAlt from '../connects/outbound/doc-alt.svelte';
  const data = $derived(user.profile);

  let draft = $state('');

  onMount(() => {
    draft = localStorage.getItem('draft') || '';

    return (() => {
      localStorage.setItem('draft', draft);
    })
  })
</script>

{#if data}
  <DocAlt id="draft" title="MarkAI" profile={data} path="notes.md" />
{/if}

