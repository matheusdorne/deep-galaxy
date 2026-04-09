<script setup lang="ts">
import { computed } from 'vue'
import type { Constellation, ConstellationNode, ConstellationLink } from '../types/constellation'

const props = defineProps<{
  selectedId: string | null
  data: Constellation
}>()

const emit = defineEmits<{ close: [] }>()

const node = computed<ConstellationNode | null>(() =>
  props.selectedId
    ? (props.data.nodes.find(n => n.id === props.selectedId) ?? null)
    : null
)

const outgoing = computed<ConstellationLink[]>(() =>
  props.data.links.filter(l => l.source === props.selectedId)
)

const incoming = computed<ConstellationLink[]>(() =>
  props.data.links.filter(l => l.target === props.selectedId)
)

const LINK_LABELS: Record<string, string> = {
  static_import:     'static import',
  state_consumption: 'state consumption',
  wormhole:          'wormhole',
}

const LINK_COLORS: Record<string, string> = {
  static_import:     '#5a7aaa',
  state_consumption: '#8a5aaa',
  wormhole:          '#44ffaa',
}
</script>

<template>
  <Transition name="panel">
    <aside v-if="node" class="node-panel">
      <button class="close" @click="emit('close')">✕</button>

      <div class="panel-header">
        <span class="badge" :class="node.type">{{ node.type }}</span>
        <span v-if="node.group" class="group">{{ node.group }}</span>
      </div>

      <h2 class="panel-id">{{ node.id }}</h2>

      <dl class="panel-meta">
        <template v-if="node.mass">
          <dt>Mass</dt>
          <dd>{{ node.mass }}</dd>
        </template>
        <template v-if="node.parent">
          <dt>Parent</dt>
          <dd>{{ node.parent }}</dd>
        </template>
      </dl>

      <section v-if="outgoing.length" class="connections">
        <h3>Outgoing <span class="count">{{ outgoing.length }}</span></h3>
        <ul>
          <li v-for="link in outgoing" :key="link.target">
            <span class="link-dot" :style="{ background: LINK_COLORS[link.type] }" />
            <span class="link-target">{{ link.target }}</span>
            <span class="link-type">{{ LINK_LABELS[link.type] }}</span>
          </li>
        </ul>
      </section>

      <section v-if="incoming.length" class="connections">
        <h3>Incoming <span class="count">{{ incoming.length }}</span></h3>
        <ul>
          <li v-for="link in incoming" :key="link.source">
            <span class="link-dot" :style="{ background: LINK_COLORS[link.type] }" />
            <span class="link-target">{{ link.source }}</span>
            <span class="link-type">{{ LINK_LABELS[link.type] }}</span>
          </li>
        </ul>
      </section>
    </aside>
  </Transition>
</template>

<style scoped>
.node-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 260px;
  background: #0e0e22;
  border-left: 1px solid #2a2a5a;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  z-index: 5;
}

.close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: #5050aa;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.15s;
}

.close:hover { color: #e0e0ff; }

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 24px;
}

.badge {
  font-size: 10px;
  padding: 2px 7px;
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
  color: #5050aa;
}

.panel-id {
  font-size: 13px;
  font-weight: bold;
  color: #e0e0ff;
  word-break: break-all;
  line-height: 1.4;
}

.panel-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 11px;
}

dt { color: #5050aa; }
dd { color: #aaaacc; }

.connections h3 {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5050aa;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.count {
  background: #1e1e40;
  color: #6060aa;
  font-size: 10px;
  padding: 0 5px;
  border-radius: 3px;
}

.connections ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connections li {
  display: grid;
  grid-template-columns: 8px 1fr;
  grid-template-rows: auto auto;
  column-gap: 8px;
  row-gap: 2px;
}

.link-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 3px;
  grid-row: 1 / 3;
  align-self: start;
}

.link-target {
  font-size: 11px;
  color: #ccccee;
  word-break: break-all;
}

.link-type {
  font-size: 10px;
  color: #5050aa;
}

/* transition */
.panel-enter-active,
.panel-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
