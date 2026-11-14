<script>
  import { delAuth } from "#lib/auth.ts";
  import { goto } from "$app/navigation";
  import { Contact, Star, LogOut, House, User } from "@lucide/svelte";
  import { Button } from "ui/svelte/button/index";
  import { cn } from "ui/utils";

  const { children } = $props();

  const logout = () => {
    delAuth();
    goto('/auth/login');
  }
</script>

<div class={cn(
  "w-screen h-screen p-0 sm:p-4 text-gray-700",
  "flex flex-col justify-around items-center sm:p-4 gap-0 sm:gap-2 md:gap-4"
)}>
  <div class="grow md:grow-0 md:h-9/10 w-full md:w-3/4 outline-2 rounded shadow-lg">
    {@render children()}
  </div>

  <div class="
    w-full md:w-auto p-1 rounded-xl outline-2 shadow-lg inset-0 shadow-emerald-200 hover:shadow-emerald-500
    flex flex-row items-center justify-center gap-2
  ">
    <Button size='icon' onclick={() => goto('/')}><House /></Button>
    <Button variant="outline" size='icon' onclick={() => goto('/connects')}><Contact /></Button>
    <Button variant="outline" size='icon' onclick={() => goto('/testimonials')}><Star /></Button>
    <Button variant="outline" size='icon' onclick={() => goto('/profile')}><User /></Button>
    <Button variant="destructive" size='icon' onclick={logout}><LogOut /></Button>
  </div>
</div>
