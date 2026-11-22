<script lang="ts">
  import { PUBLIC_SRV_AUTH_URL } from "$app/env/public";
  import { getProfileQuerySv } from 'lib/svelte';
  import { getToken, mkOpts, transform } from '#lib';
  import { user } from "#lib/auth.svelte.ts";
  import { setContext, type Snippet } from "svelte";

  const {children}: {children: Snippet} = $props();

  const query = getProfileQuerySv(() => ({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL,
      bearer: getToken(),
    }),

    opts: {
      refetchInterval: 60_000,
      retry: true,
      staleTime: 0
    },

    onResult: async (v) => {
      user.profile = transform(v);
    },
  }));

  setContext('profile', {
    refetch: () => query.refetch()
  })
</script>

{@render children?.()}
