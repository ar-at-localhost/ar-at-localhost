<script lang="ts" generics="TSchema extends FormSchema = FormSchema, TFieldPath extends RequiredPath = RequiredPath">
  import AppFieldError from "#lib/components/app-field-error.svelte";
  import { useField, type FieldStore, type FormSchema, type FormStore, type ValidPath } from "@formisch/svelte";
  import { type RequiredPath } from "@formisch/svelte/internals";
  import type { Snippet } from "svelte";
  import { Field, FieldLabel } from "ui/svelte/field/index";
  import type { InferInput } from "valibot";

  type Props = {
    of: FormStore<TSchema>,
    path: ValidPath<InferInput<TSchema>, TFieldPath>,
    title: string;
    action?: Snippet<[FieldStore<TSchema, TFieldPath>]>
    children: Snippet<[FieldStore<TSchema, TFieldPath>]>
    class?: string;
    error?: string;
  }

  const { children, of, path, title, action, class: className, error }: Props = $props();
  // svelte-ignore state_referenced_locally
  const field = useField(of, {
    path
  })
</script>

<div class={className}>
  <Field>
    <FieldLabel class="flex flex-row items-center justify-between">
      <span class="flex flex-row items-center gap-1">
        {#if action}
          {@render action(field)}
        {/if}

        <span>{title}</span>
      </span>

      <AppFieldError path={path} of={of} error={error} class={error ? 'text-gray-500!' : ''}></AppFieldError>
    </FieldLabel>

    {@render children(field)}
  </Field>
</div>
