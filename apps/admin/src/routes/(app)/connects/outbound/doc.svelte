<script lang="ts">
  import { PUBLIC_SRV_CONTACT_URL } from '$app/env/public';
  import { mkOpts, type UserProfile } from '#lib';
  import Draft from '#lib/components/draft.svelte';
  import { LoaderPinwheel } from '@lucide/svelte';
  import { type MutationSv, type QuerySv } from 'lib/svelte';
  import type { OkResp, PromptSchema } from 'lib';

  interface Props {
    id: string;
    title: string;
    profile: UserProfile,
    query: QuerySv<File, [never, never, never]>,
    mutation?: MutationSv<OkResp, [never, never, PromptSchema]>
  }

  const props: Props = $props();
  const readonly = $derived(!props.mutation)
  let content = $state<string>();

  // svelte-ignore state_referenced_locally
  const result = props.query({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL
    })
  })

  $effect(() => {
    result?.data?.text?.().then((text) => content = text)
  });

  // svelte-ignore state_referenced_locally
  const update = props.mutation?.({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_CONTACT_URL!
    })
  })

  const oncontent = (prompt: string) => {
    update?.mutate({
      body: {
        prompt
      }
    })
  }
</script>

{#if result?.isPending || result?.isLoading}
  <div class="grow flex flex-col w-full h-full items-center justify-center p-1 gap-2">
    <LoaderPinwheel class="animate-spin" />
    <h1 class="font-bold text-lg text-gray-900">Loading...</h1>
  </div>
{:else if content || (result.error && result.error.statusCode === 404)}
  <Draft kind="text" id={props.id} content={content || ''} oncontent={oncontent} readonly={readonly} title={props.title} />
{/if}

