<script lang="ts">
  import { goto } from "$app/navigation";
  import { Briefcase, CircleLetterS, Settings, SquareText, User } from '@lucide/svelte';
  import { Button } from "ui/svelte/button/index";
  import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from 'ui/svelte/dropdown-menu/index';
  const { children } = $props();
</script>

<div class="w-full h-full">
  {@render children()}

  <div class="absolute top-1 right-2">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={'outline'} class="min-w-40">
          <Settings data-icon="inline-start" />
          Configurations
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onclick={() => goto('/connects/outbound/leads')}>
            <CircleLetterS data-icon="inline-start" />
            System Prompt
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuLabel>Portfolio</DropdownMenuLabel>

          <DropdownMenuItem onclick={() => goto('/connects/outbound/portfolio')}>
            <Briefcase data-icon="inline-start" />
            Portfolio
          </DropdownMenuItem>

          <DropdownMenuItem onclick={() => goto('/connects/outbound/whoami')}>
            <User data-icon="inline-start" />
            Whoami
          </DropdownMenuItem>

          <DropdownMenuItem onclick={() => goto('/connects/outbound/prompt')}>
            <SquareText data-icon="inline-start" />
            Prompt
          </DropdownMenuItem>

          <DropdownMenuItem onclick={() => goto('/connects/outbound/sys-prompt')}>
            <CircleLetterS data-icon="inline-start" />
            System Prompt
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
