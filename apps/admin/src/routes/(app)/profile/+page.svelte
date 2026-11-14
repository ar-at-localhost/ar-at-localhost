<script lang="ts">
  import { CircleUser } from '@lucide/svelte';
  import { UTCDate } from '@date-fns/utc';
  import { Input } from 'ui/svelte/input/index';
  const { data } = $props()
</script>.

<div class="flex flex-col gap-8">
  <div class="data flex flex-col text-sm px-2">
    <div class="flex flex-row items-center justify-between border-b p-1">
      <span>{data.first_name}</span>
      <span class="font-semibold">First Name</span>
    </div>

    <div class="flex flex-row items-center justify-between border-b p-1">
      <span>{data.last_name}</span>
      <span class="font-semibold">Last Name</span>
    </div>

    <div class="flex flex-row items-center justify-between border-b p-1">
      <span>{data.email}</span>
      <span class="font-semibold">Email</span>
    </div>

    <div class="flex flex-row items-center justify-between border-b p-1">
      <span>{new UTCDate(data.updated_at || data.created_at).toLocaleString()}</span>
      <span class="font-semibold">Last updated</span>
    </div>

    <div class="flex flex-row items-center justify-between border-b p-1">
      <span>{new UTCDate(data.created_at).toLocaleString()}</span>
      <span class="font-semibold">Member since</span>
    </div>
  </div>

  <div class="flex flex-col text-sm px-2">
    <h1 class="flex flex-row items-center px-2 pt-1 gap-2 text-lg font-medium">
      <CircleUser data-icon="inline-start" />
      <span class="pt-1">Assitants</span>
    </h1>

    <div class="flex flex-col text-sm px-2">
      <div class="flex flex-row items-center justify-between border-b p-1">
        <Input type="password" class="max-w-1/3" placeholder="Claude API Key" value={data.assistantsFlat?.claude?.key}></Input>
        <span class="font-semibold">Claude</span>
      </div>

      <div class="flex flex-row items-center justify-between border-b p-1">
        <Input type="password" class="max-w-1/3" placeholder="Gemini API Key" value={data.assistantsFlat?.gemini?.key || ''}></Input>
        <span class="font-semibold">Gemini</span>
      </div>

      <div class="flex flex-row items-center justify-between border-b p-1">
        <Input type="password" class="max-w-1/3" placeholder="OpenAPI API Key" value={data.assistantsFlat?.openapi?.key || ''}></Input>
        <span class="font-semibold">OpenAPI</span>
      </div>
    </div>
  </div>
</div>

<style>
  .data div {
    padding-block: 8px;
  }

  .data div:hover {
    background-color: var(--color-neutral-100);
  }

  .data div:nth-child(even) {
    background-color: var(--color-neutral-50);
  }
</style>
