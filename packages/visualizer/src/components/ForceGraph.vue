<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import type { Constellation, ConstellationNode } from '../types/constellation'

const props = defineProps<{ data: Constellation }>()

const svgRef = ref<SVGSVGElement | null>(null)

type SimNode = ConstellationNode & d3.SimulationNodeDatum
type SimLink = d3.SimulationLinkDatum<SimNode> & { type: string }

const NODE_COLORS: Record<string, string> = {
  component: '#4a9eff',
  store:     '#b06aff',
  method:    '#ffcc44',
  endpoint:  '#44ffaa',
}

let simulation: d3.Simulation<SimNode, SimLink> | null = null

onMounted(() => {
  if (!svgRef.value) return

  const width  = svgRef.value.clientWidth
  const height = svgRef.value.clientHeight

  const nodes: SimNode[] = props.data.nodes.map(n => ({ ...n }))
  const links: SimLink[] = props.data.links.map(l => ({ ...l, type: l.type }))

  const svg = d3.select(svgRef.value)

  simulation = d3.forceSimulation<SimNode, SimLink>(nodes)
    .force('link',   d3.forceLink<SimNode, SimLink>(links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide<SimNode>(d => nodeRadius(d) + 4))

  const linkEl = svg.append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(links)
    .join('line')
    .attr('stroke', '#2a2a4a')
    .attr('stroke-width', 1.5)

  const nodeEl = svg.append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(nodes)
    .join('circle')
    .attr('r', nodeRadius)
    .attr('fill', d => NODE_COLORS[d.type] ?? '#888')
    .attr('stroke', '#0a0a1a')
    .attr('stroke-width', 1.5)
    .call(drag(simulation))

  const labelEl = svg.append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(nodes)
    .join('text')
    .text(d => d.id)
    .attr('font-size', 10)
    .attr('fill', '#aaaacc')
    .attr('pointer-events', 'none')

  simulation.on('tick', () => {
    linkEl
      .attr('x1', d => (d.source as SimNode).x ?? 0)
      .attr('y1', d => (d.source as SimNode).y ?? 0)
      .attr('x2', d => (d.target as SimNode).x ?? 0)
      .attr('y2', d => (d.target as SimNode).y ?? 0)

    nodeEl
      .attr('cx', d => d.x ?? 0)
      .attr('cy', d => d.y ?? 0)

    labelEl
      .attr('x', d => (d.x ?? 0) + nodeRadius(d) + 3)
      .attr('y', d => (d.y ?? 0) + 4)
  })
})

onUnmounted(() => {
  simulation?.stop()
})

function nodeRadius(d: SimNode): number {
  return Math.sqrt(d.mass ?? 20) * 1.8
}

function drag(sim: d3.Simulation<SimNode, SimLink>) {
  return d3.drag<SVGCircleElement, SimNode>()
    .on('start', (event) => {
      if (!event.active) sim.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    })
    .on('drag', (event) => {
      event.subject.fx = event.x
      event.subject.fy = event.y
    })
    .on('end', (event) => {
      if (!event.active) sim.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    })
}
</script>

<template>
  <svg ref="svgRef" class="force-graph" />
</template>

<style scoped>
.force-graph {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
