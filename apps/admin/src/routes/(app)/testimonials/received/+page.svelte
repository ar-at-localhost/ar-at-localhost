{#snippet testimonial(_key: string, value: string)}
  <span class="truncate" title={value}>{ `${value?.slice(0, 100)}${value?.length > 100 ? '...' : ''}` }</span>
{/snippet}

<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import Table, { type ColDefs } from '#lib/components/table.svelte'
  import type { GetTestimonialArgs, ReqOpts } from 'lib';
  import { getTestimonialsQuerySv } from 'lib/svelte';

  const defs: ColDefs = {
    first_name: { title: "First Name" },
    last_name_initial: { title: "Last Name" },
    rating: { title: "Rating" },
    testimonial: { title: "Testimonial", render: testimonial, class:"truncate" },
  }

  const opts: ReqOpts<GetTestimonialArgs> = {
    baseURL: PUBLIC_SRV_CONTACT_URL,
  }
</script>

<Table defs={defs} queryFactory={getTestimonialsQuerySv} opts={opts}/>
