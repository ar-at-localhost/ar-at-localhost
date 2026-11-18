<script lang="ts">
  import './layout.css';
  import favicon from '../static/favicon.svg';
  import type { LayoutProps } from './$types';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Profile from "./profile.svelte";

	let { children }: LayoutProps = $props();

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity
      }
    }
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={client}>
  <Profile>
    {@render children()}
  </Profile>
</QueryClientProvider>
