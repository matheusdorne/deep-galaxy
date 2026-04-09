<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import Tooltip from './Tooltip.vue'
import Legend from './Legend.vue'
import NodePanel from './NodePanel.vue'
import type { Constellation, ConstellationNode } from '../types/constellation'

const props = defineProps<{ data: Constellation }>()

const svgRef = ref<SVGSVGElement | null>(null)
const hoveredNode    = ref<ConstellationNode | null>(null)
const selectedNodeId = ref<string | null>(null)
const mousePos = ref({ x: 0, y: 0 })

type SimNode = ConstellationNode & d3.SimulationNodeDatum
type SimLink = d3.SimulationLinkDatum<SimNode> & { type: string }

const NODE_COLORS: Record<string, string> = {
  component: '#4a9eff',
  store:     '#b06aff',
  method:    '#ffcc44',
  endpoint:  '#44ffaa',
}

const LINK_COLORS: Record<string, string> = {
  static_import:     '#5a7aaa',
  state_consumption: '#8a5aaa',
  wormhole:          '#44ffaa',
}

const LINK_DASH: Record<string, string> = {
  static_import:     '0',
  state_consumption: '5,3',
  wormhole:          '2,4',
}

let simulation: d3.Simulation<SimNode, SimLink> | null = null
let nodeEl:  d3.Selection<SVGCircleElement, SimNode, SVGGElement, unknown> | null = null
let linkEl:  d3.Selection<SVGLineElement,   SimLink,  SVGGElement, unknown> | null = null
let labelEl: d3.Selection<SVGTextElement,   SimNode,  SVGGElement, unknown> | null = null
let simLinks: SimLink[] = []
let zoomTransform = d3.zoomIdentity
let svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

function resetZoom() {
  if (!svgSelection || !zoomBehavior) return
  svgSelection.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity)
}

onMounted(() => {
  if (!svgRef.value) return

  const width  = svgRef.value.clientWidth
  const height = svgRef.value.clientHeight

  const nodes: SimNode[] = props.data.nodes.map(n => ({ ...n }))
  simLinks = props.data.links.map(l => ({ ...l, type: l.type }))

  const svg = d3.select(svgRef.value)
  svgSelection = svg

  // zoom/pan
  let isPanning = false
  const zoom = d3.zoom<SVGSVGElement, unknown>()
  zoomBehavior = zoom
    .scaleExtent([0.1, 8])
    .on('start', () => { isPanning = false })
    .on('zoom', (event) => {
      isPanning = true
      zoomTransform = event.transform
      zoomContainer.attr('transform', event.transform.toString())
    })

  svg.call(zoom).on('dblclick.zoom', null)

  // deselect on background click (not after a pan)
  svg.on('click', () => {
    if (!isPanning) selectedNodeId.value = null
    isPanning = false
  })

  // all graph elements live in this group so zoom applies to them
  const zoomContainer = svg.append('g').attr('class', 'zoom-container')

  simulation = d3.forceSimulation<SimNode, SimLink>(nodes)
    .force('link',    d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(120))
    .force('charge',  d3.forceManyBody().strength(-400))
    .force('center',  d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide<SimNode>(d => nodeRadius(d) + 4))

  linkEl = zoomContainer.append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(simLinks)
    .join('line')
    .attr('stroke', d => LINK_COLORS[d.type] ?? '#3a3a6a')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', d => LINK_DASH[d.type] ?? '0')

  nodeEl = zoomContainer.append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(nodes)
    .join('circle')
    .attr('r', nodeRadius)
    .attr('fill', d => NODE_COLORS[d.type] ?? '#888')
    .attr('stroke', '#0a0a1a')
    .attr('stroke-width', 1.5)
    .attr('cursor', 'pointer')
    .call(drag(simulation))
    .on('mouseover', (event: MouseEvent, d) => {
      hoveredNode.value = d
      mousePos.value = { x: event.offsetX, y: event.offsetY }
    })
    .on('mousemove', (event: MouseEvent) => {
      mousePos.value = { x: event.offsetX, y: event.offsetY }
    })
    .on('mouseout', () => { hoveredNode.value = null })
    .on('click', (event: MouseEvent, d) => {
      event.stopPropagation()
      isPanning = false
      selectedNodeId.value = selectedNodeId.value === d.id ? null : d.id
    })

  labelEl = zoomContainer.append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(nodes)
    .join('text')
    .text(d => d.id)
    .attr('font-size', 10)
    .attr('fill', '#aaaacc')
    .attr('pointer-events', 'none')

  simulation.on('tick', () => {
    linkEl!
      .attr('x1', d => (d.source as SimNode).x ?? 0)
      .attr('y1', d => (d.source as SimNode).y ?? 0)
      .attr('x2', d => (d.target as SimNode).x ?? 0)
      .attr('y2', d => (d.target as SimNode).y ?? 0)

    nodeEl!
      .attr('cx', d => d.x ?? 0)
      .attr('cy', d => d.y ?? 0)

    labelEl!
      .attr('x', d => (d.x ?? 0) + nodeRadius(d) + 3)
      .attr('y', d => (d.y ?? 0) + 4)
  })
})

watch(selectedNodeId, (id) => {
  if (!nodeEl || !linkEl || !labelEl) return

  if (!id) {
    nodeEl.attr('opacity', 1)
    linkEl.attr('opacity', 1).attr('stroke', d => LINK_COLORS[d.type] ?? '#3a3a6a')
    labelEl.attr('opacity', 1)
    return
  }

  const connected = new Set<string>([id])
  simLinks.forEach(l => {
    const src = (l.source as SimNode).id
    const tgt = (l.target as SimNode).id
    if (src === id) connected.add(tgt)
    if (tgt === id) connected.add(src)
  })

  nodeEl.attr('opacity',  d => connected.has(d.id) ? 1 : 0.12)
  labelEl.attr('opacity', d => connected.has(d.id) ? 1 : 0.12)
  linkEl
    .attr('opacity', l => {
      const src = (l.source as SimNode).id
      const tgt = (l.target as SimNode).id
      return src === id || tgt === id ? 1 : 0.06
    })
    .attr('stroke', l => {
      const src = (l.source as SimNode).id
      const tgt = (l.target as SimNode).id
      return src === id || tgt === id ? (LINK_COLORS[l.type] ?? '#3a3a6a') : '#2a2a4a'
    })
})

onUnmounted(() => { simulation?.stop() })

function nodeRadius(d: SimNode): number {
  return Math.sqrt(d.mass ?? 20) * 1.8
}

function drag(sim: d3.Simulation<SimNode, SimLink>) {
  return d3.drag<SVGCircleElement, SimNode>()
    .on('start', (event) => {
      if (!event.active) sim.alphaTarget(0.3).restart()
      const [fx, fy] = zoomTransform.invert([event.x, event.y])
      event.subject.fx = fx
      event.subject.fy = fy
    })
    .on('drag', (event) => {
      const [fx, fy] = zoomTransform.invert([event.x, event.y])
      event.subject.fx = fx
      event.subject.fy = fy
    })
    .on('end', (event) => {
      if (!event.active) sim.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    })
}
</script>

<template>
  <div class="graph-wrapper">
    <svg ref="svgRef" class="force-graph" />
    <Tooltip
      v-if="hoveredNode"
      :node="hoveredNode"
      :x="mousePos.x"
      :y="mousePos.y"
    />
    <Legend />
    <button class="reset-btn" title="Reset zoom" @click="resetZoom">⌖</button>
    <NodePanel
      :selected-id="selectedNodeId"
      :data="props.data"
      @close="selectedNodeId = null"
    />
  </div>
</template>

<style scoped>
.graph-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.force-graph {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.force-graph:active {
  cursor: grabbing;
}

.reset-btn {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: #12122a;
  border: 1px solid #2a2a5a;
  border-radius: 6px;
  color: #aaaacc;
  font-size: 18px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.reset-btn:hover {
  background: #1e1e40;
  color: #e0e0ff;
}
</style>
