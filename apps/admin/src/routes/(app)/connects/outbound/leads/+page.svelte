<script lang="ts">
  import { getLeadsSysPromptQuerySv, setLeadsSysPromptMutationSv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import Doc from '../doc.svelte';
  import { user } from '#lib/auth.svelte.ts';
  const data = $derived(user.profile)
</script>

{#if data}
  <Doc id="leads-sys" title="Leads - System Prompt" profile={data} query={getLeadsSysPromptQuerySv} mutation={setLeadsSysPromptMutationSv}  />
{/if}
