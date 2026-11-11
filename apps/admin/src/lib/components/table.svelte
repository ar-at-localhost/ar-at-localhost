<script lang="ts" module>
  export type ColDef = {
      title?: string,
      render?: Snippet<[key: string, value: string]>
      class?: string
  };

  export type ColDefs = Record<string, ColDef>;
</script>

<script lang="ts" generics="
    Params extends URLValues = {},
    Query extends URLValues & { page?: number, limit?: number } = URLValues & { page?: number, limit?: number }
">
  import { Table, TableHeader, TableBody, TableRow, TableCell } from 'ui/svelte/table/index';
  import { Button } from 'ui/svelte/button/index';
  import { ChevronLeft, ChevronRightIcon, RotateCcw, SearchIcon, TriangleAlert } from '@lucide/svelte';
  import { InputGroup, InputGroupAddon, InputGroupInput } from 'ui/svelte/input-group/index';
  import { debounce, merge } from 'es-toolkit';
  import type { ReqArgs, ReqOpts, URLValues } from 'lib';
  import { mkOpts } from '#lib/http.ts';
  import type { QuerySv } from 'lib/svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    queryFactory: QuerySv<any, [Params, Query, never]>,
    searchKey?: string 
    defs: ColDefs,
    opts?: Partial<ReqOpts<ReqArgs<Params, Query, never>>>
  };

  const { defs, opts, searchKey = 'search', queryFactory }: Props = $props();
  let page = $state(1)
  let limit = $state(10)
  let search = $state('')
  const loadingItems = $derived(Array.from({ length: limit }).map((_, i) => i+1))
  const prev = () => page = page - 1;
  const next = () => page = page + 1;
  
  // svelte-ignore state_referenced_locally
  const result = queryFactory(() => mkOpts<ReqArgs<Params, Query, never>>(merge({
    query: {
      page,
      limit,
      ...(searchKey ? { [searchKey]: search } : undefined)
    } as Query,
  }, opts ?? {})));
</script>

<div class="flex flex-col w-full h-full p-1">
  <div class="grow">
    <Table class="relative overflow-auto">
      <TableHeader class="sticky top-0">
        <TableRow>
          {#each Object.entries(defs) as col}
            <TableCell class="font-bold">
              {col[1]?.title || col[0]}
            </TableCell>
          {/each}
        </TableRow>
      </TableHeader>

      <TableBody>
        {#if result.data}
          {#each result.data?.items as item}
            <TableRow>
              {#each Object.entries(defs) as col}
                <TableCell class={col[1].class || ''}>
                  {#if col[1].render}
                    {@render col[1].render(col[0], item[col[0]])}
                  {:else}
                    {item[col[0]]}
                  {/if}
                </TableCell>
              {/each}
            </TableRow>
          {/each}
        {:else if result.error && !result.isFetching}
          <TableRow>
            <TableCell class="text-destructive w-full col-span-5 flex items-center gap-1">
              <TriangleAlert />
              {result.error.message}
            </TableCell>
          </TableRow>
        {:else if result.isLoading}
          {#each loadingItems}
            <TableRow>
              <TableCell colspan={100} class="bg-neutral-50 animate-pulse">
                <span class="invisible">
                  Loading... 
                </span>
              </TableCell>
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>

  <div class="flex flex-col items-end">
    <div class="text-sm px-2 w-full flex flex-row flex-wrap sm:flex-nowrap items-center justify-between bg-neutral-50">
      <div class="order-3 sm:order-0 grow">
        <InputGroup class="w-full sm:max-w-[256px]">
          <InputGroupInput type="search" class="" placeholder="Search" oninput={debounce((e) => search = e.target.value || '', 500)} />

          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <span>
        {#if result.data?.total && result.data.items.length > 1}
          <span>Showing {result.data.nth_first}/{result.data.nth_last} of {result.data.total} results.</span>
        {/if}
      </span>

      <div>
        {#if result.data?.page}
          <TableCell colspan={3} class="text-right flex flex-row items-center gap-2">
            <Button size="icon-sm" variant="outline" disabled={!result.data.prev} onclick={prev}><ChevronLeft /></Button>
            { result.data.page }
            <Button size="icon-sm" variant="outline" disabled={!result.data.next} onclick={next}><ChevronRightIcon /></Button>
          </TableCell>
        {:else if result.error}
          <Button variant={'ghost'} onclick={result.refetch}>
            <RotateCcw data-icon="inline-start" />
            Retry
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>
