<script lang="ts">
  import LlmConfig from "#lib/components/llm-config.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Briefcase, BriefcasePlus, Menu, Search } from '@lucide/svelte';
  import { Button } from "ui/svelte/button/index";
  import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from 'ui/svelte/dropdown-menu/index';
  const { children } = $props();

  type Sheet = 'sync-portfolio' | 'jd-to-lead' | 'find-leads';
  let sheet = $state<Sheet>()
  const newLead = $derived(page.route.id == '/(app)/connects/outbound/new-lead');

  const sheetTitle: Record<Sheet, string> = {
    'find-leads': 'Leads Finder',
    'jd-to-lead': 'Job Description to Lead',
    'sync-portfolio': 'Sync Portfolio'
  }; 

  const title = $derived(sheetTitle[sheet!]);
</script>

<div class="w-full h-full">
  {@render children()}

  {#if !newLead}
    <div class="absolute top-1 right-2 flex flex-row gap-1">
      <Button variant="ghost" onclick={() => goto('/connects/outbound/new-lead')}>
        Add New
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='link'>
            <Menu data-icon="inline-start" />
            Menu
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent class="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>LLM Configs</DropdownMenuLabel>
            <DropdownMenuItem onclick={() => sheet = "find-leads" }>
              <Search data-icon="inline-start" />
              Lead Finder
            </DropdownMenuItem>

            <DropdownMenuItem onclick={() => sheet = "jd-to-lead" }>
              <BriefcasePlus data-icon="inline-start" />
              Job to Lead
            </DropdownMenuItem>

            <DropdownMenuItem onclick={() => sheet = "sync-portfolio" }>
              <Briefcase data-icon="inline-start" />
              Portfolio Sync
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {#if sheet}
        <LlmConfig id={sheet} open={true} title={title} onClose={() => sheet = undefined}>
        </LlmConfig>
      {/if}
    </div>
  {/if}
</div>
