export type NodeType = 'component' | 'store' | 'method' | 'endpoint'
export type LinkType = 'state_consumption' | 'static_import' | 'wormhole'

export interface ConstellationNode {
  id: string
  type: NodeType
  mass?: number
  group?: string
  parent?: string
}

export interface ConstellationLink {
  source: string
  target: string
  type: LinkType
}

export interface Constellation {
  nodes: ConstellationNode[]
  links: ConstellationLink[]
}
