<script lang="ts" generics="TSchema extends FormSchema = FormSchema, TFieldPath extends RequiredPath = RequiredPath">
  import { useField, type FormSchema, type FormStore, type ValidPath } from "@formisch/svelte";
  import { type RequiredPath } from "@formisch/svelte/internals";
  import { FieldError } from "ui/svelte/field/index";
  import type { InferInput } from "valibot";

  type Props = {
    of: FormStore<TSchema>,
    path: ValidPath<InferInput<TSchema>, TFieldPath>,
    class?: string;
    error?: string;
  }

  const { of, path, class: className, error }: Props = $props();
  // svelte-ignore state_referenced_locally
  const field = useField(of, {
    path
  })
</script>

<div>
  {#if error || ((!of.isValid || field.isTouched || field.isDirty) && field.errors?.length)}
    <FieldError class={className}>{error || field?.errors?.at(0)}</FieldError>
  {/if}
</div>
