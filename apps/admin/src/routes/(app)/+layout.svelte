<script>
  import { delAuth } from "#lib/auth.ts";
  import { goto } from "$app/navigation";
  import { BookCheck, Contact, LogOut } from "@lucide/svelte";
  import Button from "ui/svelte/button/button.svelte";

  const { children } = $props();

  const logout = () => {
    delAuth();
    goto('/auth/login');
  }
</script>

<div class="w-screen h-screen flex flex-col justify-around items-center gap-4">
  <div class="h-9/10 w-3/4 outline-1 rounded">
    {@render children()}
  </div>

  <div class="flex flex-row items-center justify-center gap-2 p-1 rounded-xl outline">
    <Button variant="outline" size='icon'><Contact /></Button>
    <Button variant="outline" size='icon' onclick={() => goto('/testimonials')}><BookCheck /></Button>
    <Button variant="destructive" size='icon' onclick={logout}><LogOut /></Button>
  </div>
</div>
