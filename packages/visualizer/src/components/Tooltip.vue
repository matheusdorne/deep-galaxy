<script setup lang="ts">
import type { ConstellationNode } from '../types/constellation'

defineProps<{
  node: ConstellationNode
  x: number
  y: number
}>()
</script>

<template>
  <div class="tooltip" :style="{ left: `${x + 14}px`, top: `${y - 10}px` }">
    <div class="tooltip-id">{{ node.id }}</div>
    <div class="tooltip-meta">
      <span class="badge" :class="node.type">{{ node.type }}</span>
      <span v-if="node.group" class="group">{{ node.group }}</span>
    </div>
    <div v-if="node.mass" class="tooltip-mass">mass {{ node.mass }}</div>
    <div v-if="node.parent" class="tooltip-parent">↳ {{ node.parent }}</div>
  </div>
</template>

<style scoped>
.tooltip {
  position: absolute;
  pointer-events: none;
  background: #12122a;
  border: 1px solid #2a2a5a;
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 140px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.tooltip-id {
  font-size: 12px;
  font-weight: bold;
  color: #e0e0ff;
  margin-bottom: 6px;
  word-break: break-all;
}

.tooltip-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.component { background: #1a3a6a; color: #4a9eff; }
.badge.store     { background: #2a1a5a; color: #b06aff; }
.badge.method    { background: #3a3000; color: #ffcc44; }
.badge.endpoint  { background: #003a28; color: #44ffaa; }

.group {
  font-size: 10px;
  color: #6060aa;
}

.tooltip-mass {
  font-size: 10px;
  color: #5050aa;
}

.tooltip-parent {
  font-size: 10px;
  color: #5050aa;
  margin-top: 2px;
}
</style>
