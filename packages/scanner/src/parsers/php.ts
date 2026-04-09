import * as path from 'path'
import type { ConstellationNode } from '../types.js'

export function parsePhpFile(filePath: string, content: string, rootDir: string): ConstellationNode {
  const id = path.relative(rootDir, filePath).replace(/\\/g, '/')
  const group = path.dirname(id).replace(/\\/g, '/')
  const mass = content.split('\n').length

  return {
    id,
    type: 'endpoint',
    mass,
    group: group === '.' ? 'root' : group,
  }
}
