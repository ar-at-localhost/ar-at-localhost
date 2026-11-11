<script lang="ts">
	import './layout.css';
	import favicon from '../static/favicon.svg';
	import type { LayoutProps } from './$types';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { children }: LayoutProps = $props();

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0
      }
    }
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={client}>
  {@render children()}
</QueryClientProvider>
