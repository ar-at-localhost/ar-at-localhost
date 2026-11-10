<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import Table, { type ColDefs } from '#lib/components/table.svelte';
  import type { GetTestimonialReqsArgs, ReqOpts } from 'lib';
  import { getTestimonialReqsQuerySv } from 'lib/svelte';
  import New from './new.svelte';

  const defs: ColDefs = {
    first_name: { title: "First Name" },
    last_name_initial: { title: "Last Name" },
    company: { title: "Company" },
    email: { title: "Email" },
  }

  const opts = $state({
    baseURL: PUBLIC_SRV_CONTACT_URL,
    query: {
      search: ''
    }
  } as ReqOpts<GetTestimonialReqsArgs>)
</script>

<div class="p-0 m-0 flex flex-col h-full w-full">
  <div class="absolute top-1 right-2">
    <New onsuccess={(email) => {
      opts.query = {
        search: email
      }
    }} />
  </div>

  <div class="grow">
    <Table defs={defs} queryFactory={getTestimonialReqsQuerySv} opts={opts}/>
  </div>
</div>
