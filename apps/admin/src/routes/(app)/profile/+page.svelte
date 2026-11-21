<script lang="ts">
  import { PUBLIC_SRV_AUTH_URL } from '$app/env/public';
  import { mkOpts } from '#lib';
  import { user } from '#lib/auth.svelte.ts';
  import { UTCDate } from '@date-fns/utc';
  import { createForm, Field as FField, Form, reset } from '@formisch/svelte';
  import { CircleUser, Eye, EyeOff, Key, Loader, Save, User } from '@lucide/svelte';
  import { userKeys, userHandles, updateProfileSchema, type UpdateUserBody } from 'lib';
  import { updateProfileMutationSv } from 'lib/svelte';
  import { Button } from 'ui/svelte/button/index';
  import { Input } from 'ui/svelte/input/index';
  import { Separator } from 'ui/svelte/separator/index';
  import { getContext } from 'svelte';
  import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from 'ui/svelte/input-group/index';

  const data = $derived(user.profile)
  const { refetch } = getContext<{ refetch: () => void }>('profile')
  const fieldTypes = $state<{ [key: string]: 'password' | 'text' }>({})

  const form = createForm({
    schema: updateProfileSchema,
    initialInput: {
      handles: userHandles.map(i => ({ type: i, handle: ''})),
      keys: userKeys.map(i => ({ type: i, keys: ''}))
    }
  })

  $effect(() => {
    if (form && data) {
      reset(form, {
        initialInput: {
          handles: userHandles.map(i => ({ type: i, handle: data.handles?.find(h => h.type == i)?.handle || '' })),
          keys: userKeys.map(i => ({ type: i, key: data.keys?.find(h => h.type == i)?.key || '' })),
          personal_info: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
        }
      })
    }
  })

  const update = updateProfileMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL
    })
  });

  const onUpdate = (values: UpdateUserBody) => {
    update.mutateAsync({
      body: values
    }).then(refetch)
  }

  const onview = (key: string) =>  fieldTypes[key] = fieldTypes[key] === 'text' ? 'password' : 'text';
</script>

{#if data}
  <Form of={form} onsubmit={onUpdate} id="profile-form" class="w-full h-full flex flex-col gap-1 relative px-2 pt-1">
    <div class="flex flex-row items-center justify-between">
      <h1 class="flex flex-row items-center gap-2 text-lg font-medium">
        <CircleUser data-icon="inline-start" />
        <span class="pt-1">Your profile</span>
      </h1>

      {#if form.isEdited}
        <Button variant="outline" type="submit" form="profile-form" disabled={update.isPending}>
          {#if update.isPending}
            <Loader class="animate-spin" data-icon="inline-start"/>
          {:else}
            <Save data-icon="inline-start"/>
          {/if}
          Save
        </Button>
      {:else}
        <span class="text-sm">Review and update your profile!</span>
      {/if}
    </div>

    <Separator />

    <div class="w-full grow">
      <div class="flex flex-col gap-8">
        <div class="data flex flex-col text-sm px-2">
          <div class="flex flex-row items-center justify-between border-b p-1">
            <span>{data.first_name}</span>
            <span class="font-semibold">First Name</span>
          </div>

          <div class="flex flex-row items-center justify-between border-b p-1">
            <span>{data.last_name}</span>
            <span class="font-semibold">Last Name</span>
          </div>

          <div class="flex flex-row items-center justify-between border-b p-1">
            <span>{data.email}</span>
            <span class="font-semibold">Email</span>
          </div>

          <div class="flex flex-row items-center justify-between border-b p-1">
            <span>{new UTCDate(data.updated_at || data.created_at).toLocaleString()}</span>
            <span class="font-semibold">Last updated</span>
          </div>

          <div class="flex flex-row items-center justify-between border-b p-1">
            <span>{new UTCDate(data.created_at).toLocaleString()}</span>
            <span class="font-semibold">Member since</span>
          </div>
        </div>

        <div class="flex flex-col text-sm px-2">
          <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
            <Key data-icon="inline-start" />
            <span class="pt-1">Keys</span>
          </h1>

          <div class="flex flex-col text-sm px-2">
            {#each userKeys.values() as key,idx}
              <div class="flex flex-row items-center justify-between border-b p-1">
                <FField of={form} path={['keys', idx, 'key']}>
                  {#snippet children(field)}
                    <InputGroup class="max-w-2/3 md:max-w-1/3">
                      <InputGroupInput type={fieldTypes[key] || 'password'} placeholder={`${key} API Key`} {...field.props} value={field.input} />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton onclick={() => onview(key)}>
                          {#if fieldTypes[key] === 'text'}
                            <EyeOff />
                          {:else}
                            <Eye />
                          {/if}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  {/snippet}
                </FField>
                <span class="font-semibold">{key}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="flex flex-col text-sm px-2">
          <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
            <User data-icon="inline-start" />
            <span class="pt-1">Handles</span>
          </h1>

<div class="flex flex-col text-sm px-2">
            {#each userHandles.values() as key,index}
              <div class="flex flex-row items-center justify-between border-b p-1">
                <FField of={form} path={['handles', index, 'handle']}>
                  {#snippet children(field)}
                    <Input class="max-w-2/3 md:max-w-1/3" placeholder={`${key} Handle`} {...field.props} value={field.input}></Input>
                  {/snippet}
                </FField>
                <span class="font-semibold">{key}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </Form>
{/if}

<style>
  .data div {
    padding-block: 8px;
  }

  .data div:hover {
    background-color: var(--color-neutral-100);
  }

  .data div:nth-child(even) {
    background-color: var(--color-neutral-50);
  }
</style>
