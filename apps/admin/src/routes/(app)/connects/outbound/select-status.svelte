<script lang="ts">
  import AppFieldError from "#lib/components/app-field-error.svelte";
  import { Field as FField, type FormStore } from "@formisch/svelte";
  import { capitalize } from "es-toolkit";
  import { createLeadSchema, leadSchema, leadStatuses, type LeadStatus } from "lib";
  import { Field, FieldLabel } from "ui/svelte/field/index";
  import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "ui/svelte/select/index";

  type Props = {
    of: FormStore<typeof leadSchema | typeof createLeadSchema>,
    class?: string;
  }

  const { of, class: className }: Props = $props();
</script>

<div class={className}>
  <FField of={of} path={['status']}>
    {#snippet children(field)}
      <Field>
        <FieldLabel class="flex flex-row items-center justify-between">
          <span>Status</span>

          <AppFieldError path={['status']} of={of}></AppFieldError>
        </FieldLabel>

        <Select value={field.input ?? ''} type="single" onValueChange={(v) => field.onInput(v as LeadStatus)}>
          <SelectTrigger class="w-full">{field.input ? capitalize(field.input) : 'Status'}</SelectTrigger>
          <SelectContent class="w-full">
            <SelectGroup class="w-full">
              {#each leadStatuses as status}
                <SelectItem value={status}>{status ? capitalize(status) : ''}</SelectItem>
              {/each}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    {/snippet}
  </FField>
</div>
