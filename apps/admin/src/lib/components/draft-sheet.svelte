<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";
  import { Sheet, SheetContent } from "ui/svelte/sheet/index";
  import Draft from "./draft.svelte";
  import { Button } from "ui/svelte/button/index";
  import type { DraftProps } from "./draft";
  import DocAlt from "../../routes/(app)/connects/outbound/doc-alt.svelte";

  const props: DraftProps = $props();
  let open = $state(false)

  const onChange = (v: boolean) => {
    if (!v) open = false;
  }

  const onContent = (v: string) => {
    if (props.kind == 'text') props.oncontent?.(v);
    onChange(false)
  }
</script>

<div>
  <Button variant={'secondary'} class="flex w-full justify-between" onclick={() => open=true}>
    <span>{props.title}</span>
    <ChevronDown data-icon="inline-end"/>
  </Button>

  <Sheet open={open} onOpenChange={onChange}>
    <SheetContent side="bottom" class="min-h-[50dvh] max-h-[75dvh]" showCloseButton={false}>
      {#if props.kind === 'text'}
        <Draft {...props} oncontent={onContent} />
      {:else}
        <DocAlt {...props} />
      {/if}
    </SheetContent>
  </Sheet>
</div>
