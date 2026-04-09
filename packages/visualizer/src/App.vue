<script setup lang="ts">
import ForceGraph from './components/ForceGraph.vue'
import { useConstellation } from './composables/useConstellation'

const constellation = useConstellation()
</script>

<template>
  <main class="app">
    <ForceGraph :data="constellation" />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a0f;
  color: #e0e0ff;
  font-family: monospace;
}

.app {
  width: 100vw;
  height: 100vh;
}
</style>
