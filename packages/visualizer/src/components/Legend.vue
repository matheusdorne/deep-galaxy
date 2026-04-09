<script setup lang="ts">
const nodeTypes = [
  { type: 'component', color: '#4a9eff', label: 'Component' },
  { type: 'store',     color: '#b06aff', label: 'Store'     },
  { type: 'method',    color: '#ffcc44', label: 'Method'    },
  { type: 'endpoint',  color: '#44ffaa', label: 'Endpoint'  },
]

const linkTypes = [
  { type: 'static_import',    color: '#2a2a4a', label: 'Static import'    },
  { type: 'state_consumption', color: '#2a2a4a', label: 'State consumption' },
  { type: 'wormhole',         color: '#2a2a4a', label: 'Wormhole'         },
]
</script>

<template>
  <aside class="legend">
    <section>
      <h3>Nodes</h3>
      <ul>
        <li v-for="item in nodeTypes" :key="item.type">
          <span class="dot" :style="{ background: item.color }" />
          {{ item.label }}
        </li>
      </ul>
    </section>

    <section>
      <h3>Links</h3>
      <ul>
        <li v-for="item in linkTypes" :key="item.type">
          <span class="line" />
          {{ item.label }}
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.legend {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: #12122a;
  border: 1px solid #2a2a5a;
  border-radius: 8px;
  padding: 14px 18px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h3 {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5050aa;
  margin-bottom: 8px;
}

ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #aaaacc;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.line {
  width: 18px;
  height: 2px;
  background: #3a3a6a;
  flex-shrink: 0;
  border-radius: 1px;
}
</style>
