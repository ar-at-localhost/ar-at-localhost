<script lang="ts">
  import { PUBLIC_SRV_AUTH_URL } from '$app/env/public';
  import { createForm, Field, FieldArray, Form, getInput, insert, remove, reset, setInput, swap } from "@formisch/svelte";
  import { ArrowLeft, Dot, Loader, Plus, Save, Trash, X } from "@lucide/svelte";
  import { llmConfigFormSchema, llmConfigToForm, llmModels, llmProviders, type LLM_MODELS, type LLM_PROVIDER } from "lib";
  import { Button } from "ui/svelte/button/index";
  import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "ui/svelte/collapsible/index";
  import { FieldGroup, FieldLabel } from "ui/svelte/field/index";
  import { Separator } from "ui/svelte/separator/index";
  import { Sheet, SheetContent, SheetTitle, SheetHeader } from "ui/svelte/sheet/index";
  import FieldWrapper from "./field-wrapper.svelte";
  import { Input } from "ui/svelte/input/index";
  import { Slider } from "ui/svelte/slider/index";
  import { getLLMConfigQuerySv, updateLLMConfigMutationSv } from "lib/svelte";
  import { mkOpts } from "#lib/http.ts";
  import { Select, SelectContent, SelectItem, SelectTrigger } from 'ui/svelte/select/index';
  import { capitalize } from 'es-toolkit';
  import DraftSheet from './draft-sheet.svelte';
  import { Badge } from 'ui/svelte/badge/index';
  import { untrack, type Snippet } from 'svelte';
  import { Avatar, AvatarFallback } from 'ui/svelte/avatar/index';
  import AppFieldError from './app-field-error.svelte';

  type DragData = {
    type: 'providers' | 'models';
    idx: number
  };

  const form = createForm({
    schema: llmConfigFormSchema,
  });

  interface Props {
    id: string;
    title: string;
    open?: boolean,
    onClose?: () => void,
    children?: Snippet<[typeof form]>
  };

  let { children, title, open = $bindable(), ...props }: Props = $props()

  const config = getLLMConfigQuerySv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL,
      params: {
        // svelte-ignore state_referenced_locally
        label: props.id
      }
    }),
  });

  const saveConfig = updateLLMConfigMutationSv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL,
      params: {
        // svelte-ignore state_referenced_locally
        label: props.id
      }
    }),
  });

  $effect(() => {
    if (!config.data) return;
    const initialInput = llmConfigToForm(config.data);
    reset(untrack(() => form), {
      initialInput,
    })
  })

  const addInput =  (currentLength: number) => {
    const item = currentLength + 1;
    insert(form, {
      path: ['inputs'],

      initialInput: {
        rel: 'context',
        key: `Untitled ${item}`},
      }
    );

    const f = document.querySelector('#inputs-marker');
    if (!f) return;
    f.scrollIntoView({ behavior: 'smooth' })
  };

  const onDragStart = (e: DragEvent) => {
    const t =  (e.target as HTMLElement);
    if (!t) return;

    try {
      e.dataTransfer?.setData('application/json', JSON.stringify({
        type: t.getAttribute('data-type')!,
        idx: parseInt(t.getAttribute('data-idx')!)
      } as DragData))
    } catch {}
  };


  const onDragover = (e: DragEvent, out?: boolean) => {
    e?.preventDefault()
    const t =  (e.target as HTMLElement);
    const tp = t?.parentElement;
    if (!tp) return;

    if (!out) {
      tp.classList.add('dragover');
    } else {
      tp.classList.remove('dragover')
    }
  }

  const onDrop = (e: DragEvent) => {
    e?.preventDefault();
    const t = e.target as HTMLElement;
    t.classList.remove('dragover');
    const s = e.dataTransfer?.getData('application/json');
    const ti = t?.parentElement?.getAttribute('data-idx');
    try {
      document.querySelectorAll('.dragover').forEach((e) => e.classList.remove('dragover'));
      const d = JSON.parse(s!) as DragData;

      swap(form, {
        path: [d.type],
        at: parseInt(ti!),
        and: d.idx
      })
    } catch {}
  }
</script>

<style>
  :global(span.dragover) {
    border: 1px dotted gray;
  }
</style>

<Sheet bind:open onOpenChange={(v) => !v ? open = false : undefined}>
  <SheetContent showCloseButton={false} class="flex flex-col h-full">
    <SheetHeader class="px-1">
      <SheetTitle class="flex flex-row items-center gap-2">
        <Button variant={'link'} onclick={props.onClose}>
          <ArrowLeft />
        </Button>

        <span class="grow">
          {title}
        </span>

        {#if config.data}
          <div class="justify-self-end">
            <Button variant="secondary" disabled={config.isPending || config.isLoading || saveConfig.isPending} type="submit" form="update-llm-config">
              {#if saveConfig.isPending}
                <Loader data-icon="inline-start" class="animate-spin" />
              {:else}
                <Save data-icon="inline-start" />
              {/if}
              <span>Save</span>
            </Button>
          </div>
        {/if}

        {@render children?.(form)}
      </SheetTitle>

      {#if (!form.isValid && (form.isDirty || form.isTouched)) || saveConfig.error}
        <div class="text-destructive">{form.errors?.at(0) || saveConfig.error}</div>
      {/if}

      <Separator class="mt-2" />
    </SheetHeader>

    {#if config.isLoading || config.isPending}
      <div class="flex flex-row items-center justify-center">
        <Loader class="animate-spin" />
      </div>
    {:else}
      <Form of={form} id="update-llm-config"
        onsubmit={(v) => saveConfig.mutateAsync({ body: v })}
        class="grow overflow-auto px-2 flex flex-col gap-2 pb-2"
      >
        <FieldGroup>
          <Field of={form} path={['max_input_tokens']}>
            <FieldWrapper title="Max. Input Tokens" of={form} path={['max_input_tokens']} error="Not applicable!">
              {#snippet children(field)}
                <Input {...field.props} type="number" readonly value={0} />
              {/snippet}
            </FieldWrapper>
          </Field>

          <Field of={form} path={['max_output_tokens']}>
            {#snippet children(field)}
              <FieldWrapper title="Max. Output Tokens" of={form} path={['max_output_tokens']}>
                <Input {...field.props} type="number" />
              </FieldWrapper>
            {/snippet}
          </Field>

          <Field of={form} path={['temperature']}>
            {#snippet children(field)}
              <FieldWrapper title="Temperature (0.0 - 1.0)" of={form} path={['temperature']}>
                <Slider type="single" min={0} max={1} step={0.10} value={Number(field.input || 0.5)} onValueCommit={field.onInput} />
              </FieldWrapper>
            {/snippet}
          </Field>
        </FieldGroup>

        <div class="flex flex-col gap-4 py-2">
          <div class="flex flex-col gap-1 py-2">
            <Field of={form} path={['systemPrompt']}>
              {#snippet children(field)}
                <DraftSheet id={'system-prompt'} title="System Prompt" kind="file" path={field.input.ref!} />
              {/snippet}
            </Field>

            <Field of={form} path={['prompt']}>
              {#snippet children(field)}
                <DraftSheet id={'prompt'} title="Prompt" kind="file" path={field.input.ref!} />
              {/snippet}
            </Field>
          </div>

          <Separator />

          <FieldArray of={form} path={['providers']}>
            {#snippet children(fieldArr)}
              <FieldWrapper title="Providers" of={form} path={['providers']}>
                {#snippet children()}
                  <Select
                    value={getInput(form, { path: ['providers']})}
                    onValueChange={(v) => setInput(form, { path: ['providers'], input: v as LLM_PROVIDER[] })}
                    type="multiple"
                  >
                    <SelectTrigger class="w-full">
                      Select Providers
                    </SelectTrigger>

                    <SelectContent>
                      {#each llmProviders as provider}
                        <SelectItem value={provider}>{capitalize(provider)}</SelectItem>
                      {/each}
                    </SelectContent>
                  </Select>
                {/snippet}
              </FieldWrapper>

              <div class="flex flex-row items-center gap-2 flex-wrap">
                {#each fieldArr.items as item, index (item)}
                  <Field of={form} path={['providers', index]}>
                    {#snippet children(provider)}
                      <Badge
                        class="cursor-pointer"
                        variant='secondary'
                        onclick={() => remove(form, { path: ['providers'], at: index })}
                        data-idx={index}
                        data-type="providers"
                        draggable
                        ondragover={e => e?.preventDefault()}
                        ondragstart={onDragStart}
                        ondragenter={onDragover}
                        ondragleave={e => onDragover(e, true)} 
                        ondrop={onDrop}
                      >
                        {#if provider.input?.length}
                          <span class="flex flex-row items-center gap-1">
                            {index + 1}
                            <Dot class="size-2" />
                            {capitalize(provider.input)}
                          </span>
                          <X data-icon="inline-end" />
                        {/if}
                      </Badge>
                    {/snippet}
                  </Field>
                {/each}
              </div>
            {/snippet}
          </FieldArray>

          <FieldArray of={form} path={['models']}>
            {#snippet children(fieldArr)}
              <FieldWrapper of={form} path={['models']} title="Models">
                <Select
                  value={getInput(form, { path: ['models']})}
                  onValueChange={(v) => setInput(form, { path: ['models'], input: v as LLM_MODELS[] })}
                  type="multiple"
                >
                  <SelectTrigger class="w-full">
                    Select Models
                  </SelectTrigger>

                  <SelectContent>
                    {#each llmModels as model}
                      <SelectItem value={model}>{model}</SelectItem>
                    {/each}
                  </SelectContent>
                </Select>
              </FieldWrapper>

              <div class="flex flex-row items-center gap-2 flex-wrap">
                {#each fieldArr.items as item, index (item)}
                  <Field of={form} path={['models', index]}>
                    {#snippet children(modelField)}
                      <Badge
                        class="cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                        variant={!modelField.isValid && (modelField?.isTouched || modelField?.isEdited) ? 'destructive' : 'secondary'}
                        onclick={() => remove(form, { path: ['models'], at: index })}
                        data-idx={index}
                        data-type="models"
                        draggable ondragover={e => e?.preventDefault()}
                        ondragstart={onDragStart}
                        ondragenter={onDragover}
                        ondragleave={e => onDragover(e, true)} 
                        ondrop={onDrop}
                      >
                        {#if modelField.input?.length}
                          <span class="flex flex-row items-center gap-1">
                            {index + 1}
                            <Dot class="size-2" />
                            {capitalize(modelField.input)}
                          </span>
                          <X data-icon="inline-end" />
                        {/if}
                      </Badge>
                    {/snippet}
                  </Field>
                {/each}
              </div>
            {/snippet}
          </FieldArray>

          <Separator />

          <FieldArray of={form} path={['inputs']}>
            {#snippet children(fieldArr)}
              <FieldLabel class="w-full flex flex-row items-center justify-between" onclick={() => addInput(fieldArr.items.length)}>
                <span class="text-lg">Inputs</span>

                <Button variant="ghost">
                  <Plus />
                </Button>
              </FieldLabel>

              {#each fieldArr.items as item, index (item)}
                <Collapsible>
                  <CollapsibleTrigger class="w-full flex flex-row items-center justify-between" data-input={index+1}>
                    <Avatar size="sm">
                      <AvatarFallback>
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>

                    <div class="grow flex flex-row items-center gap-1">
                      <span class="grow h-0.5 bg-gray-500"></span>
                      <span>{getInput(form, { path: ['inputs', index, 'key'] })}</span>
                      <span class="grow h-0.5 bg-gray-500"></span>
                    </div>

                    <Button variant="destructive" size="icon-sm" class="rounded-full">
                      <Trash data-icon="inline-end" />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent class="py-2">
                    <FieldWrapper title="Name" of={form} path={['inputs', index, 'key']}>
                      {#snippet children(field)}
                        <FieldGroup>
                          <Input {...field.props} type="text" value={field.input || 'Untitled'} />

                          <FieldWrapper title="Type" of={form} path={['inputs', index, 'kind']}>
                            {#snippet children(kind)}
                              <Select value={kind.input} type="single" onValueChange={(v) => kind.onInput(v as 'file' | 'text')}>
                                <SelectTrigger class="w-full flex flex-row items-center justify-between">
                                  <span>{kind.input?.length ? capitalize(kind.input) : 'Select a type'}</span>
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value="file">File</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                              </Select>

                              {#if kind.input === 'file'}
                                <Field of={form} path={['inputs', index, 'ref']}>
                                  {#snippet children(ref)}
                                    <FieldWrapper title="File Ref." of={form} path={['inputs', index, 'ref']}>
                                      {#snippet children()}
                                        .<Input {...ref.props} type="text" value={ref.input} />
                                      {/snippet}
                                    </FieldWrapper>
                                  {/snippet}
                                </Field>
                              {/if}

                              <FieldWrapper title="Content" of={form} path={['inputs', index, 'text']}>
                                {#snippet children(text)}
                                  {#if kind.input}
                                    <DraftSheet
                                      kind={kind.input as any}
                                      id={field.input!}
                                      title={field.input!}
                                      {...(kind.input === 'text'
                                        ? {content:text.input!, oncontent: text.onInput}
                                        : { path: getInput(form, { path: ['inputs', index, 'ref'] })!})
                                      }
                                    />
                                  {/if}
                                {/snippet}
                              </FieldWrapper>

                              <AppFieldError of={form} path={['inputs', index]} />
                            {/snippet}
                          </FieldWrapper>
                        </FieldGroup>
                      {/snippet}
                    </FieldWrapper>
                  </CollapsibleContent>
                </Collapsible>
              {/each}

              <span id="inputs-marker" class="pb-4"></span>
            {/snippet}
          </FieldArray>
        </div>
      </Form>
    {/if}
  </SheetContent>
</Sheet>
