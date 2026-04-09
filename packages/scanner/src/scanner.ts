import * as fs from 'fs'
import * as path from 'path'
import { parseVueFile } from './parsers/vue.js'
import { parsePhpFile } from './parsers/php.js'
import type { Constellation, ConstellationNode, ConstellationLink } from './types.js'

export function scan(targetDir: string): Constellation {
  const files = walkDir(targetDir, ['.vue', '.php'])

  const nodes: ConstellationNode[] = []
  const links: ConstellationLink[] = []

  const phpNodeIds = new Set<string>()

  // first pass: collect php nodes so we can resolve wormhole targets
  for (const file of files) {
    if (!file.endsWith('.php')) continue
    const content = fs.readFileSync(file, 'utf-8')
    const node = parsePhpFile(file, content, targetDir)
    nodes.push(node)
    phpNodeIds.add(node.id)
  }

  // second pass: parse vue files
  for (const file of files) {
    if (!file.endsWith('.vue')) continue
    const content = fs.readFileSync(file, 'utf-8')
    const result = parseVueFile(file, content, targetDir)

    nodes.push(result.node)
    nodes.push(...result.childNodes)

    for (const link of result.links) {
      // only keep wormhole links if the target php file was found
      if (link.type === 'wormhole') {
        const targetId = link.target.startsWith('/') ? link.target.slice(1) : link.target
        const matchedPhp = [...phpNodeIds].find(id => id.endsWith(targetId))
        if (matchedPhp) {
          links.push({ ...link, target: matchedPhp })
        }
      } else {
        links.push(link)
      }
    }
  }

  return { nodes, links }
}

function walkDir(dir: string, extensions: string[]): string[] {
  const results: string[] = []

  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue
      results.push(...walkDir(fullPath, extensions))
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath)
    }
  }

  return results
}

function shouldSkipDir(name: string): boolean {
  return ['node_modules', '.git', 'dist', 'vendor', '.nuxt', '.output'].includes(name)
}
