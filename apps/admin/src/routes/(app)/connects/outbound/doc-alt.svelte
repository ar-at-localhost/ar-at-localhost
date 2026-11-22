<script lang="ts">
  import { PUBLIC_SRV_AUTH_URL } from '$app/env/public';
  import { mkOpts } from '#lib';
  import Draft from '#lib/components/draft.svelte';
  import { LoaderPinwheel } from '@lucide/svelte';
  import { downloadFileQuerySv, uploadFileMutationSv } from 'lib/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    id: string;
    children?: Snippet<[]>,
    download?: ReturnType<typeof downloadFileQuerySv>;
    title: string;
    path: string;
    readonly?: boolean
  }

  let { download = $bindable(), ...props }: Props = $props();
  // svelte-ignore state_referenced_locally
  const { children } = props;
  let content = $state<string>();

  // svelte-ignore state_referenced_locally
  download = downloadFileQuerySv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL,
      query: {
        path: props.path,
      }
    }),

    opts: {
      refetchOnMount: true
    }
  })

  $effect(() => {
    download?.data?.text?.().then((text) => content = text)
  });

  // svelte-ignore state_referenced_locally
  const update = uploadFileMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL!
    })
  })

  const oncontent = (content: string) => {
    if (props.readonly) return;

    update?.mutate({
      body: {
        path: props.path,
        content: content
      }
    })
  }
</script>

{#if download?.isPending || download?.isLoading}
  <div class="grow flex flex-col w-full h-full items-center justify-center p-1 gap-2">
    <LoaderPinwheel class="animate-spin" />
    <h1 class="font-bold text-lg text-gray-900">Loading...</h1>
  </div>
{:else if content || (download.error && download.error.statusCode === 404)}
  <Draft kind="text" id={props.id} content={content || ''} oncontent={oncontent} readonly={props.readonly} title={props.title}>
    {@render children?.()}
  </Draft>
{/if}

