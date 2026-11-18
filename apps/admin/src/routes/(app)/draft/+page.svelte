<script lang="ts">
  import { onMount } from 'svelte';
  import Draft from '#lib/components/draft.svelte';
  import { user } from '#lib/auth.svelte.ts';
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
  <Draft id="draft" content="" title="AI Draft" profile={data} />
{/if}

