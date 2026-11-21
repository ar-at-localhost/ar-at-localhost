---
title: "Lovely code of the week – 48/2026"
description: "Introducing my personal blog on ar-at-localhost!"
pubDate: "Nov 21 2026"
heroImage: "../../assets/blog.svg"
---

Happy weekend, programmers!

<p>I did a lot of stuff on the <code>ar-at-localhost</code> project this week.
Here&rsquo;s a lovely piece of code from this week.</p>

<b>TL;DR:</b> Objects make nice, lightweight maps. Paired with sensible fallbacks, they
offer a clean and elegant solution without the overhead of a <code>Map</code>.

## Problem

<p>I&rsquo;ve introduced keys where users may manage a set of keys used in their operations. We need
to allow users to update them as necessary. Since most of them are secret, users should see
them as passwords—but may turn on view to see them as plain values. The quirk is that we have several
keys, not just one.</p>

## Solution

<br />

<p>At first glance, I thought of a map to store the current state of the field, but a map can be too
noisy with its <code>set</code>, <code>get</code>, <code>has</code>, etc &ndash; so I turned to an
object as a map (indeed a Map is an object) and let missing keys be treated as hidden, as it would
be the default. Then I added a function to rotate them.</p>

<br />

```svelte
<script lang="ts">
  // ...
  const fieldTypes = $state<{ [key: string]: 'password' | 'text' }>({
  }); // notice empty {}

  const onview = (key: string) =>
    fieldTypes[key] = fieldTypes[key] === 'text'
      ? 'password'
      : 'text';
  // ...
</script>

{#each userKeys.values() as key,idx}
  <!-- ... -->
  <InputGroupButton onclick={() => onview(key)}>
    {#if fieldTypes[key] === 'text'}
      <EyeOff />
    {:else}
      <Eye />
    {/if}
  </InputGroupButton>
  <!-- ... -->
{/each}
```
