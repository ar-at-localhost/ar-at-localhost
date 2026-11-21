<script lang="ts">
  import 'ui/svelte/crepe/crepe.css';
  import { user } from '#lib/auth.svelte.ts';
  import DocAlt from '../doc-alt.svelte';
  const data = $derived(user.profile)
</script>

{#if data}
  <DocAlt id="leads-sys" title="Leads - System Prompt" profile={data} path="llm/leads-sp.md"  />
{/if}
