<script lang="ts">
  import { UTCDate } from '@date-fns/utc';
  const { data } = $props()
</script>.

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
