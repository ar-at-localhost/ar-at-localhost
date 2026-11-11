<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { createForm, Field as FField, Form as FForm } from "@formisch/svelte";
  import { CirclePlus, LoaderCircle } from "@lucide/svelte";
  import { createTestimonialReqBodySchema, type CreateTestimonialReqBody } from "lib";
  import { Button } from "ui/svelte/button/index";
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "ui/svelte/dialog/index";
  import { Field, FieldError, FieldTitle } from "ui/svelte/field/index";
  import { Input } from "ui/svelte/input/index";
  import { createTestimonialReqMutationSv } from '../../../../../../../packages/lib/src/testimonial.svelte';
  import { mkOpts } from '#lib';

  let { onsuccess }: { onsuccess?: (email: string) => void } = $props();
  let dialog = $state(false)

  const form = createForm({
    schema: createTestimonialReqBodySchema
  })

  const srv = createTestimonialReqMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL,
    }),
    opts: {
      onSuccess: (data) => {
        onsuccess?.(data.email)
        dialog = false;
      }
    }
  })

  const handleSubmit = (v: CreateTestimonialReqBody) => srv.mutate({
    body: v
  })
</script>

<Dialog bind:open={dialog}>
  <DialogTrigger>
    <Button variant="secondary">
      <CirclePlus data-icon="inline-start"></CirclePlus>
      New
    </Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>New testimonial request</DialogTitle>

      <DialogDescription class="text-destructive">
        {#if srv.error}
          <span>{srv.error}</span>
        {:else}
          <span>Double check information, it can't be changed later.</span>
        {/if}
      </DialogDescription>
    </DialogHeader>

    <FForm of={form} id="testimonial-request-form" onsubmit={handleSubmit} class="flex flex-col gap-1">
      <FField of={form} path={['first_name']}>
        {#snippet children(field)}
          <Field>
            <FieldTitle>First name</FieldTitle>
            {#if field.isEdited && field.errors?.length}
              <FieldError>{field.errors.shift()}</FieldError>
            {/if}
            <Input {...field.props}></Input>
          </Field>
        {/snippet}
      </FField>

      <FField of={form} path={['last_name_initial']}>
        {#snippet children(field)}
          <Field>
            <FieldTitle>Last name (initial)</FieldTitle>
            <Input {...field.props}></Input>
            {#if field.isEdited && field.errors?.length}
              <FieldError>{field.errors.shift()}</FieldError>
            {/if}
          </Field>
        {/snippet}
      </FField>

      <FField of={form} path={['email']}>
        {#snippet children(field)}
          <Field>
            <FieldTitle>Email</FieldTitle>
            <Input {...field.props} type="email"></Input>
            {#if field.isEdited && field.errors?.length}
              <FieldError>{field.errors.shift()}</FieldError>
            {/if}
          </Field>
        {/snippet}
      </FField>

      <FField of={form} path={['company']}>
        {#snippet children(field)}
          <Field>
            <FieldTitle>Company</FieldTitle>
            <Input {...field.props}></Input>
            {#if field.isEdited && field.errors?.length}
              <FieldError>{field.errors.shift()}</FieldError>
            {/if}
          </Field>
        {/snippet}
      </FField>
    </FForm>
    
    <DialogFooter>
      <Button variant="default" class="w-full" type="submit" form="testimonial-request-form">
        {#if srv.isPending}
          <LoaderCircle data-icon="inline-start" class="animate-spin" />
        {/if}

        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
