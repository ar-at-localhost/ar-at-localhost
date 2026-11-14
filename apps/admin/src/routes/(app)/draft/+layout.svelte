<script>
  const { children } = $props();
  import 'ui/svelte/crepe/crepe.css';
</script>


<div class="w-full h-full overflow-hidden">
  {@render children()}
</div>
