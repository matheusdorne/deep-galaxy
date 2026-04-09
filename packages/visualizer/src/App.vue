<script setup lang="ts">
import ForceGraph from './components/ForceGraph.vue'
import { useConstellation } from './composables/useConstellation'

const { constellation, error } = useConstellation()
</script>

<template>
  <main class="app">
    <ForceGraph v-if="constellation" :data="constellation" />
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else class="status">Loading constellation.json…</div>
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

.status {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: #5050aa;
}

.status.error {
  color: #ff6a6a;
}
</style>
