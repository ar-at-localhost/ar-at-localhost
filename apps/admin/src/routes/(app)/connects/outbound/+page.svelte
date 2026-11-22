{#snippet withTitle(_: string, value: string)}
  <span title={value}>{value}</span>
{/snippet}

<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { getLeadsQuerySv } from 'lib/svelte';
  import 'ui/svelte/crepe/crepe.css';
  import { user } from '#lib/auth.svelte.ts';
  import Table, { type ColDefs } from '#lib/components/table.svelte';
  import { createForm, Field as FField, Form, reset } from '@formisch/svelte';
  import { pick } from 'valibot';
  import { getLeadsQuerySchema, leadStatuses, type LeadStatus } from 'lib';
  import { FieldGroup, FieldLabel } from 'ui/svelte/field/index';
  import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from 'ui/svelte/select/index';
  import { Slider } from 'ui/svelte/slider/index';
  import { capitalize } from 'es-toolkit';
  import Field from 'ui/svelte/field/field.svelte';
  import { Button } from 'ui/svelte/button/index';
  import { SheetDescription, SheetHeader, SheetTitle } from 'ui/svelte/sheet/index';
  const data = $derived(user.profile)

  const defs = {
    status: {
      title: 'Status',
      class: 'uppercase',
    },

    company: {
      title: 'Company'
    },

    domain: {
      title: 'Domain'
    },

    contact_role: {
      title: 'Contact Role'
    },

    fit_score: {
      title: 'Score'
    },

    fit_reason: {
      title: 'Reason',
      class:"min-w-8 max-w-16 truncate",
      render: withTitle
    },

    url: {
      title: 'URL',
      class:"min-w-8 max-w-16 truncate",
      render: withTitle

    },
  } as ColDefs;

  const form = createForm({
    schema: pick(getLeadsQuerySchema, ['fit_score', 'status']),
  })
</script>

{#if data}
  <Table queryFactory={getLeadsQuerySv} defs={defs} opts={{ baseURL: PUBLIC_SRV_CONTACT_URL }}>
    {#snippet sheet(opts, onSubmit)}
      <SheetHeader>
        <SheetTitle>Options</SheetTitle>
        <SheetDescription>
          {#if form.errors}
            <span class="text-destructive">{form.errors?.at(0)}</span>
          {:else}
            <span>Tweak your search</span>
          {/if}
        </SheetDescription>
      </SheetHeader>

      <Form of={form} onsubmit={(o) => onSubmit({ query: o })} class="mx-4" id="lead-query-form">
        <FieldGroup class="flex flex-col md:flex-row flex-wrap mb-2">
          <FField of={form} path={['status']}>
            {#snippet children(field)}
              <Select value={(opts?.query?.status as string) ?? field.input ?? ''} type="single" onValueChange={(v) => field.onInput(v as LeadStatus)}>
                <SelectTrigger class="w-full md:w-1/3 grow">{field.input ? capitalize( field.input) : 'Status'}</SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {#each leadStatuses as status}
                      <SelectItem value={status}>{capitalize(status)}</SelectItem>
                    {/each}
                  </SelectGroup>
                </SelectContent>
              </Select>
            {/snippet}
          </FField>

          <FField of={form} path={['fit_score']}>
            {#snippet children(field)}
              <Field class="w-full md:w-1/3 grow">
                <FieldLabel class="flex flex-row items-center justify-between">
                  <span>Fit Score</span>
                  <span>10</span>
                </FieldLabel>

                <Slider type="single" value={opts?.query?.fit_score ?? (field.input ? Number(field.input) : null) ?? 0} min={1} max={10} onValueCommit={(v) => field.onInput(v.toString())}></Slider>
              </Field>
            {/snippet}
          </FField>
        </FieldGroup>

        <div class="flex flex-row gap-1">
          <Button type="submit" form="lead-query-form">Apply</Button>
          <Button variant="ghost" onclick={() => reset(form)}>Clear all</Button>
        </div>
      </Form>
    {/snippet}
  </Table>
{/if}
