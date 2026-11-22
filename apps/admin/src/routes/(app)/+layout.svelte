<script>
  import { delAuth } from "#lib/auth.ts";
  import { goto } from "$app/navigation";
  import { Contact, Star, LogOut, House, User, SquareText, LoaderCircle } from "@lucide/svelte";
  import { Button } from "ui/svelte/button/index";
  import { cn } from "ui/utils";
  import { user } from "#lib/auth.svelte.ts";
  import logo from '../../static/favicon.svg';

  const { children } = $props();
  const data = $derived(user.profile)

  const logout = () => {
    delAuth();
    goto('/auth/login');
  }
</script>

<div class={cn(
  "w-screen h-dvh p-0 sm:p-4 text-gray-700",
  "flex flex-col justify-around items-center sm:p-4 gap-0 sm:gap-2 md:gap-4"
)}>
  {#if data}
    <div class="w-full h-auto overflow-hidden grow md:grow-0 md:h-9/10 md:w-3/4 outline-2 rounded shadow-lg">
      {@render children()}
    </div>

    <div class="
      w-full md:w-auto p-1 rounded-xl outline-2 shadow-lg inset-0 shadow-emerald-200 hover:shadow-emerald-500
      flex flex-row items-center justify-center gap-2
    ">
      <Button size='icon' onclick={() => goto('/')}><House /></Button>
      <Button variant="outline" size='icon' onclick={() => goto('/draft')}><SquareText /></Button>
      <Button variant="outline" size='icon' onclick={() => goto('/connects')}><Contact /></Button>
      <Button variant="outline" size='icon' onclick={() => goto('/testimonials')}><Star /></Button>
      <Button variant="outline" size='icon' onclick={() => goto('/profile')}><User /></Button>
      <Button variant="destructive" size='icon' onclick={logout}><LogOut /></Button>
    </div>
  {:else}
    <div class="w-full h-full flex flex-row items-center justify-center">
      <div class="p-0 m-0 size-14 relative">
        <LoaderCircle class="absolute stroke-1 stroke-gray-100 animate-spin size-14 -left-1 -top-1 z-0" />
        <img src={logo} class="size-12" alt="Logo Loader" />
      </div>
    </div>
  {/if}
</div>
