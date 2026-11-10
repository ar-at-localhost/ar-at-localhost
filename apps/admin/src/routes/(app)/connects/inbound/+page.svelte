{#snippet message(_key: string, value: string)}
  <span class="truncate" title={value}>{ `${value?.slice(0, 75)}${value?.length > 75 ? '...' : ''}` }</span>
{/snippet}

<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import Table, { type ColDefs } from '#lib/components/table.svelte';
  import type { FetchConnectsArgs, ReqOpts } from 'lib';
  import { fetchConnectsQuerySv } from 'lib/svelte';

  const defs: ColDefs = {
    first_name: { title: "First Name" },
    last_name: { title: "Last Name" },
    email: { title: "Email" },
    message: { title: "Message", render: message },
  }

  const opts: ReqOpts<FetchConnectsArgs> = {
    baseURL: PUBLIC_SRV_CONTACT_URL,
  }
</script>

<Table defs={defs} queryFactory={fetchConnectsQuerySv} opts={opts}/>
