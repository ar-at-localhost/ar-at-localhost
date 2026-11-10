<script>
  import { delAuth } from "#lib/auth.ts";
  import { goto } from "$app/navigation";
  import { Contact, Star, LogOut } from "@lucide/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { Button } from "ui/svelte/button/index";
  import { cn } from "ui/utils";

  const { children } = $props();
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0
      }
    }
  });

  const logout = () => {
    delAuth();
    goto('/auth/login');
  }
</script>

<div class={cn(
  "w-screen h-screen p-0 sm:p-4 text-gray-700",
  "flex flex-col justify-around items-center sm:p-4 gap-0 sm:gap-2 md:gap-4"
)}>
  <div class="grow md:grow-0 md:h-9/10 w-full md:w-3/4 outline-1 rounded">
    <QueryClientProvider client={client}>
      {@render children()}
    </QueryClientProvider>
  </div>

  <div class="w-full md:w-auto flex flex-row items-center justify-center gap-2 p-1 rounded-xl outline">
    <Button variant="outline" size='icon' onclick={() => goto('/connects')}><Contact /></Button>
    <Button variant="outline" size='icon' onclick={() => goto('/testimonials')}><Star /></Button>
    <Button variant="destructive" size='icon' onclick={logout}><LogOut /></Button>
  </div>
</div>
