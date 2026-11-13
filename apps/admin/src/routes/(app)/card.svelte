<script lang="ts">
  import { goto } from "$app/navigation";
  import { Dot, Info, LucideZodiacGemini, RobotArm, RobotVacuum, type LucideProps } from "@lucide/svelte";
  import type { Component } from "svelte";
  import { Avatar, AvatarFallback } from "ui/svelte/avatar/index";
  import { Badge } from "ui/svelte/badge/index";
  import { cn } from "ui/utils";

  interface Props {
    data: {
      link?: string,
      icon?: Component<LucideProps>,
      title: string,
      stats: Record<string, number>
    }
  }

  const { data }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={cn(
  "flex flex-col border p-2 sm:p-3 md:p-4 rounded-md",
  "gap-4 w-full md:w-72",
  data.link ? 'cursor-pointer hover:border-gray-300 hover:shadow' : ''
)} onclick={() => data.link ? goto(data.link) : null} data-href={data.link}>
  <div class="flex flex-row items-center justify-between">
    <div class="flex flex-row items-center gap-2 justify-self-start max-w-2/3">
      <data.icon class="row-1 col-1 " size="24" />
      <b class="row-1 col-2 justify-self-start">{data.title}</b>
    </div>

    <span class="row-1 col-2 justify-self-end max-w-1/3">
      {#if data.stats.total}
        <Avatar>
          <AvatarFallback>{data.stats.total}</AvatarFallback>
        </Avatar>
      {/if}
    </span>
  </div>

  <div class="row-3 flex flex-row items-center flex-wrap gap-2">
    {#each Object.entries(data.stats).filter(i => i[0] != 'total') as stat}
      <Badge class="flex flex-row items-center gap-1" variant="outline">
        <span>{stat[1]}</span>
        <Dot />
        <span>{stat[0]}</span>
      </Badge>
    {/each}
  </div>

  <p class="flex flex-row items-center gap-1 text-sm">
    <Info class="size-4"/>
    <span class="inline-block mt-1">AI insights coming soon...</span>
  </p>
</div>
