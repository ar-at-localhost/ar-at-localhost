<script lang="ts">
  import { UTCDate } from '@date-fns/utc';
  import { Key } from '@lucide/svelte';
  import { userKeys } from 'lib';
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
      <Key data-icon="inline-start" />
      <span class="pt-1">Keys</span>
    </h1>

    <div class="flex flex-col text-sm px-2">
      {#each userKeys.values() as key}
        <div class="flex flex-row items-center justify-between border-b p-1">
          <Input type="password" class="max-w-1/3" placeholder={`${key} API Key`} value={data.keysFlat?.[key]}></Input>
          <span class="font-semibold">{key}</span>
        </div>
      {/each}
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
