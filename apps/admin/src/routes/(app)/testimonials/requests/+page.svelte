<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import Table, { type ColDefs } from '#lib/components/table.svelte';
  import type { GetTestimonialReqsArgs, ReqOpts } from 'lib';
  import { getTestimonialReqsQuerySv } from 'lib/svelte';

  const defs: ColDefs = {
    first_name: { title: "First Name" },
    last_name_initial: { title: "Last Name" },
    company: { title: "Company" },
    email: { title: "Email" },
  }

  const opts: ReqOpts<GetTestimonialReqsArgs> = {
    baseURL: PUBLIC_SRV_CONTACT_URL,
  }
</script>

<Table defs={defs} queryFactory={getTestimonialReqsQuerySv} opts={opts}/>
