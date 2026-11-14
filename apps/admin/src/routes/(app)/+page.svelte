<script lang="ts">
  import { PUBLIC_SRV_AUTH_URL } from '$app/env/public';
  import logo from '../../lib/assets/logo/logo-64.png';
  import { Separator } from "ui/svelte/separator/index";
  import Card from "./card.svelte";
  import { getStatementQuerySv } from 'lib/svelte';
  import { mkOpts } from '#lib';
  import { Contact, Star } from '@lucide/svelte';

  const { data } = $props()

  const result = getStatementQuerySv({
    srvArgs: mkOpts({
      baseURL: PUBLIC_SRV_AUTH_URL,
    }),

    opts: {
      refetchInterval: 60_000
    }
  })

  const statement = $derived({
    connects: {
      link: '/connects',
      title: 'Connects',
      icon: Contact,
      stats: {
        Inbound: result.data?.connects.inbound || 0,
        Outbound: result.data?.connects.outbound || 0,
        total: result.data?.connects.total || 0
      }
    },
    testimonials: {
      icon: Star,
      link: '/testimonials',
      title: 'Testimonials',
      stats: {
        Received: result.data?.testimonials.received || 0,
        Requested: result.data?.testimonials.requested || 0,
        total: result.data?.testimonials.total || 0
      }
    }
  })
</script>

<div class="flex flex-col gap-4 pt-4 pb-16 px-8">
  <div class="flex flex-col gap-2 md:gap-0 md:flex-row items-start justify-start md:items-end md:justify-between">
    <div class="flex flex-row items-center gap-4">
      <img src={logo} alt="Logo" class="size-6 md:size-12" />
      <div class="flex flex-col gap-1 text-sm">
        <b>👋 Hi, {data.first_name}</b>
        <span class="hidden md:inline-block">This is how things look currently.</span>
      </div>
    </div>

    <div class="block md:flex flex-col gap-1 items-start text-sm md:text-right">
      <span class="inline-block md:hidden ">This is how things look currently.</span>
      <span>Data will update automatically every minute.</span>
    </div>
  </div>

  <Separator />

  <div class="
    flex flex-row flex-wrap items-center justify-start gap-4
  ">
     <Card data={statement.connects} /> 
     <Card data={statement.testimonials} /> 
  </div>
</div>
