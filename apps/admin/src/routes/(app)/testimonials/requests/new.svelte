<script lang="ts">
  import {PUBLIC_SRV_CONTACT_URL} from '$app/env/public';
  import { callSrv } from "#lib";
  import { createForm, Field as FField, Form as FForm } from "@formisch/svelte";
  import { CirclePlus } from "@lucide/svelte";
  import { createTestimonialReqBodySchema, createTestimonialReqSrv, type CreateTestimonialReqPayload } from "lib";
  import { Button } from "ui/svelte/button/index";
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "ui/svelte/dialog/index";
  import { Field, FieldError, FieldTitle } from "ui/svelte/field/index";
  import { Input } from "ui/svelte/input/index";

  let { onsuccess }: { onsuccess?: (email: string) => void } = $props();
  let dialog = $state(false)
  let apiError = $state('')

  const form = createForm({
    schema: createTestimonialReqBodySchema
  })

  const handleSubmit = async (values: CreateTestimonialReqPayload) => {
    apiError = '';

    callSrv(createTestimonialReqSrv,{
      body: values,
      baseURL: PUBLIC_SRV_CONTACT_URL
    }).then(() => {
      onsuccess?.(values.email)
      dialog = false;
    }).catch((err) => {
      apiError = err?.message || 'Something went wrong!';
    })
  }
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
        {#if apiError}
          <span>{apiError}</span>
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
      <Button variant="default" class="w-full" type="submit" form="testimonial-request-form">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
