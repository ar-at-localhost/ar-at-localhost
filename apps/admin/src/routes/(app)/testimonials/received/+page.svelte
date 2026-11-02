<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { callSrv } from '#lib';
  import { getTestimonialsSrv, type GetTestimonialsResp } from 'lib';
  import { Table, TableHeader, TableBody, TableRow, TableCell } from 'ui/svelte/table/index';
  import { Button } from 'ui/svelte/button/index';
  import { ChevronLeft, ChevronRightIcon, SearchIcon } from '@lucide/svelte';
  import { InputGroup, InputGroupAddon, InputGroupInput } from 'ui/svelte/input-group/index';
  import { debounce } from 'es-toolkit';
  let page = $state(1)
  let limit = $state(15)
  let search: string  = $state('' )

  let result: GetTestimonialsResp = $state({
    // svelte-ignore state_referenced_locally
    page,
    // svelte-ignore state_referenced_locally
    limit,
    items: [],
    total: 0,
    next: undefined,
    prev: undefined
  })

  const prev = () => page = page - 1;
  const next = () => page = page + 1;

  $effect(() => {
    callSrv(getTestimonialsSrv, {
      baseURL: PUBLIC_SRV_CONTACT_URL,
      query: {
        page,
        limit,
        search
      }
    }).then((res) => result = res);
  })
</script>

<div class="flex flex-col w-full h-full p-1">
  <div class="grow">
    <Table class="relative overflow-auto">
      <TableHeader class="sticky top-0">
        <TableRow>
          <TableCell class="font-bold">
            First Name
          </TableCell>

          <TableCell class="font-bold">
            Last Name
          </TableCell>

          <TableCell class="font-bold">
            Company
          </TableCell>

          <TableCell class="font-bold">
            Rating
          </TableCell>

          <TableCell  class="font-bold">
            Testimonial
          </TableCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        {#each result.items as item}
          <TableRow>
            <TableCell class="max-w-32!">{item.first_name}</TableCell>
            <TableCell>{item.last_name_initial}.</TableCell>
            <TableCell class="max-w-32! overflow-hidden text-ellipsis">{item.company}</TableCell>
            <TableCell class="max-w-16!">{item.rating}</TableCell>
            <TableCell class="max-w-lg! overflow-hidden text-ellipsis" title={item.testimonial}>{item.testimonial}</TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <div class="flex flex-col items-end">
    <div class="text-sm px-2 w-full flex flex-row items-center justify-between bg-neutral-50">
      <div>
        <InputGroup class="max-w-[256px]">
          <InputGroupInput type="search" class="" placeholder="Search" oninput={debounce((e) => search = e.target.value || '', 500)} />

          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div class="flex flex-row items-center gap-2">
        <span>
          {#if result.total}
            <span>Showing {result.items.length} of {result.total} results.</span>
          {/if}
        </span>

        {#if result.page}
          <TableCell colspan={3} class="text-right flex flex-row items-center gap-2">
            <Button size="icon-sm" variant="outline" disabled={!result.prev} onclick={prev}><ChevronLeft /></Button>
            { result.page }
            <Button size="icon-sm" variant="outline" disabled={!result.next} onclick={next}><ChevronRightIcon /></Button>
          </TableCell>
        {/if}
      </div>
    </div>
  </div>
</div>
