<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { mkOpts } from "#lib";
  import { user } from "#lib/auth.svelte.ts";
  import Draft from "#lib/components/draft.svelte";
  import FieldWrapper from "#lib/components/field-wrapper.svelte";
  import AppFieldError from "#lib/components/app-field-error.svelte";
  import { createForm, Form, reset, FieldArray, remove, insert } from "@formisch/svelte";
  import { ArrowLeft, ChevronDown, CirclePlus, PlusIcon, Sparkles, Trash } from "@lucide/svelte";
  import { createLeadSchema } from "lib";
  import { createLeadMutationSv, jdToLeadMutationSv } from "lib/svelte";
  import { Button } from "ui/svelte/button/index";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/svelte/card/index";
  import { FieldError, FieldGroup, FieldLabel } from "ui/svelte/field/index";
  import { Input } from "ui/svelte/input/index";
  import { Textarea } from "ui/svelte/textarea/index";
  import CardFooter from 'ui/svelte/card/card-footer.svelte';
  import SelectStatus from '../select-status.svelte';
  import { Sheet, SheetContent, SheetTrigger } from 'ui/svelte/sheet/index';
  const profile = $derived(user.profile);

  const form = createForm({
    schema: createLeadSchema
  })

  const jdToLead = jdToLeadMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    })
  });

  const createLead = createLeadMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    })
  })

  const onJobDescription = (content: string) => {
    jdToLead.mutateAsync({
      body: {
        content
      }
    }).then((res) => {
      reset(form, {
        initialInput: res
      });
    })
  }
</script>


{#if profile}
  <div class="p-2 w-full h-full overflow-hidden">
    <Card class="w-full h-full overflow-hidden">
      <CardHeader>
        <CardTitle>New Lead</CardTitle>

        <CardDescription class="flex flex-row items-center justify-between">
          {#if (!form.isValid && (form.isTouched || form.isDirty)) || createLead.error}
            <span class="text-destructive">{form.errors?.pop() || createLead.error}</span>
          {:else}
            <span>Please provide the details about new lead.</span>
          {/if}
        </CardDescription>
      </CardHeader>

      <CardContent class="w-full h-full relative flex flex-col gap-2 overflow-auto">
        {#if !jdToLead.data}
          <div class="w-full sticky top-0 bg-white">
            <Sheet>
              <SheetTrigger class="w-full">
                <Button variant="secondary" class="w-full">
                  <div class="flex flex-row items-center gap-1">
                    <Sparkles />
                    <span>Load from job description</span>
                  </div>

                  <ChevronDown class="ml-auto" />
                </Button>
              </SheetTrigger>

              <SheetContent class="outline rounded my-1 shadow-lg h-[75dvh]!" showCloseButton={false} side="bottom">
                <Draft
                  kind={'text'}
                  id="new-lead-jd"
                  content={"# Job Description\n---\nReplace this with job description and hit `Save`."}
                  title="Job Description"
                  oncontent={onJobDescription}
                />
              </SheetContent>
            </Sheet>
          </div> 
        {/if}

        <Form of={form} id="create-lead-form" onsubmit={(v) => createLead.mutateAsync({ body: v })}>
          <FieldGroup class="py-2 flex flex-row flex-wrap items-center gap-2">
            <SelectStatus class="w-full md:w-1/3" of={form}></SelectStatus>

            <FieldWrapper title="Search Angle" class="w-full md:w-1/3 grow" of={form} path={['angle']}>
              {#snippet children(field)}
                <Input {...field.props} type="text" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Company" class="w-full md:w-1/3 grow" of={form} path={['company']}>
              {#snippet children(field)}
                <Input {...field.props} type="text" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Domain" class="w-full md:w-1/3 grow" of={form} path={['domain']}>
              {#snippet children(field)}
                <Input {...field.props} type="text" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="URL" class="w-full md:w-1/3 grow" of={form} path={['url']}>
              {#snippet children(field)}
                <Input {...field.props} type="url" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Contact role" class="w-full md:w-1/3 grow" of={form} path={['contact_role']}>
              {#snippet children(field)}
                <Input {...field.props} type="text" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Fit score" class="w-full md:w-1/3 grow" of={form} path={['fit_score']}>
              {#snippet children(field)}
                <Input {...field.props} type="number" min={1} max={10} value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Fit reason" class="w-full md:w-1/3 grow" of={form} path={['fit_reason']}>
              {#snippet children(field)}
                <Input {...field.props} type="text" value={field.input} />
              {/snippet}
            </FieldWrapper>

            <FieldWrapper title="Notes" class="w-full grow" of={form} path={['notes']}>
              {#snippet children(field)}
                <Textarea {...field.props} value={field.input} />
              {/snippet}
            </FieldWrapper>
          </FieldGroup>

          <FieldGroup class="mb-2">
            <FieldLabel class="w-full flex flex-row items-center justify-between">
              Signals
              
              <Button variant="ghost" onclick={() => insert(form, { path: ['signals'], initialInput: {  type: '', summary: ''} })}>
                <PlusIcon />
              </Button>
            </FieldLabel>

            <FieldArray of={form} path={['signals']}>
              {#snippet children(fieldArr)}
                <div class="flex flex-col gap-1">
                  {#each fieldArr.items as _, index}
                    <div class="flex flex-row items-end justify-between gap-1">
                      <FieldWrapper of={form} title="Type" path={['signals', index, 'type']} class="grow">
                        {#snippet children(field)}
                          <Input {...field.props} type="text" value={field.input} />
                        {/snippet}
                      </FieldWrapper>

                      <FieldWrapper of={form} title="Summary" path={['signals', index, 'summary']} class="grow">
                        {#snippet children(field)}
                          <Input {...field.props} type="text" value={field.input} />
                        {/snippet}
                      </FieldWrapper>

                      <Button variant="destructive" size="icon" onclick={() => remove(form, { path: ['signals'], at: index })}>
                        <Trash />
                      </Button>
                    </div>
                  {/each}

                  <AppFieldError of={form} path={['signals']}></AppFieldError>
                </div>
              {/snippet}
            </FieldArray>
          </FieldGroup>

          <FieldGroup class="mb-2">
            <FieldLabel class="w-full flex flex-row items-center justify-between">
              Matched Repos
              
              <Button variant="ghost" onclick={() => insert(form , { path: ['matched_repos'], initialInput: '' })}>
                <PlusIcon />
              </Button>
            </FieldLabel>

              <FieldArray of={form} path={['matched_repos']}>
                {#snippet children(fieldArr)}
                  <div class="flex flex-col gap-1">
                    {#each fieldArr.items as item, index (item)}
                      <div class="flex flex-row items-end justify-between gap-1">
                        <FieldWrapper of={form} title="Repo" path={['matched_repos', index]} class="grow">
                          {#snippet children(field)}
                            <Input {...field.props} type="text" value={field.input} />
                          {/snippet}
                        </FieldWrapper>

                        <Button variant="destructive" size="icon" onclick={() => remove(form, { path: ['matched_repos'], at: index })}>
                          <Trash />
                        </Button>
                      </div>
                    {/each}

                    <AppFieldError of={form} path={['matched_repos']}></AppFieldError>
                  </div>
                {/snippet}
              </FieldArray>
          </FieldGroup>

          <FieldGroup class="mb-2">
            <FieldLabel class="w-full flex flex-row items-center justify-between">
              Evidence
              
              <Button variant="ghost" onclick={() => insert(form , { path: ['evidence'], initialInput: {  title: '', url: '' } })}>
                <PlusIcon />
              </Button>
            </FieldLabel>

              <FieldArray of={form} path={['evidence']}>
                {#snippet children(fieldArr)}
                  <div class="flex flex-col gap-1">
                    {#each fieldArr.items as item, index (item)}
                      <div class="flex flex-row items-end justify-between gap-1">
                        <FieldWrapper of={form} title="Title" path={['evidence', index, 'title']} class="grow">
                          {#snippet children(field)}
                            <Input {...field.props} type="text" value={field.input} />
                          {/snippet}
                        </FieldWrapper>

                        <FieldWrapper of={form} title="URL" path={['evidence', index, 'url']} class="grow">
                          {#snippet children(field)}
                            <Input {...field.props} type="url" value={field.input} />
                          {/snippet}
                        </FieldWrapper>

                        <Button variant="destructive" size="icon" onclick={() => remove(form, { path: ['evidence'], at: index })}>
                          <Trash />
                        </Button>
                      </div>
                    {/each}

                    <AppFieldError of={form} path={['evidence']}></AppFieldError>
                  </div>
                {/snippet}
              </FieldArray>
          </FieldGroup>

          <FieldGroup class="mb-2">
            <FieldLabel class="w-full flex flex-row items-center justify-between">
              Concerns
              
              <Button variant="ghost" onclick={() => insert(form , { path: ['concerns'], initialInput: '' })}>
                <PlusIcon />
              </Button>
            </FieldLabel>

              <FieldArray of={form} path={['concerns']}>
                {#snippet children(fieldArr)}
                  <div class="flex flex-col gap-1">
                    {#each fieldArr.items as item, index (item)}
                      <div class="flex flex-row items-end justify-between gap-1">
                        <FieldWrapper of={form} title="Concern" path={['concerns', index]} class="grow">
                          {#snippet children(field)}
                            <Input {...field.props} type="text" value={field.input} />
                          {/snippet}
                        </FieldWrapper>

                        <Button variant="destructive" size="icon" onclick={() => remove(form, { path: ['concerns'], at: index })}>
                          <Trash />
                        </Button>
                      </div>
                    {/each}

                    {#if (fieldArr.isTouched || fieldArr.isDirty) && fieldArr.errors?.length}
                      <FieldError>{fieldArr.errors.at(0)}</FieldError>
                    {/if}
                  </div>
                {/snippet}
              </FieldArray>
          </FieldGroup>
        </Form>
      </CardContent>

      <CardFooter class="flex flex-col-reverse md:flex-row items-center justify-between gap-2">
        <Button size="lg" variant="link" class="w-full md:w-24">
          <ArrowLeft data-icon="inline-start"/>
          <span class="mt-0.5">Back</span>
        </Button>

        <Button size="lg" class="w-full md:w-24" type="submit" form="create-lead-form" onclick={() => console.log(form)}>
          <CirclePlus data-icon="inline-start"/>
          <span class="mt-0.5">Create</span>
        </Button>
      </CardFooter>
    </Card>
  </div>
{/if}
