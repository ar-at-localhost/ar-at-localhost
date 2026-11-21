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
    children: Snippet<[FieldStore<TSchema, TFieldPath>]>
    class?: string;
  }

  const { children, of, path, title, class: className }: Props = $props();
  // svelte-ignore state_referenced_locally
  const field = useField(of, {
    path
  })
</script>

<div class={className}>
  <Field>
    <FieldLabel class="flex flex-row items-center justify-between">
      <span>{title}</span>

      <AppFieldError path={path} of={of}></AppFieldError>
    </FieldLabel>

    {@render children(field)}
  </Field>
</div>
