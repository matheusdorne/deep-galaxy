import * as path from 'path'
import type { ConstellationNode, ConstellationLink } from '../types.js'

export interface VueParseResult {
  node: ConstellationNode
  links: ConstellationLink[]
  childNodes: ConstellationNode[]
}

export function parseVueFile(filePath: string, content: string, rootDir: string): VueParseResult {
  const id = path.relative(rootDir, filePath).replace(/\\/g, '/')
  const group = path.dirname(id).replace(/\\/g, '/')

  const scriptContent = extractScriptBlock(content)
  const mass = scriptContent.split('\n').length

  const node: ConstellationNode = {
    id,
    type: isStoreFile(id, scriptContent) ? 'store' : 'component',
    mass,
    group: group === '.' ? 'root' : group,
  }

  const links: ConstellationLink[] = []
  const childNodes: ConstellationNode[] = []

  if (scriptContent) {
    // static imports of other .vue files
    const importRegex = /import\s+\w+\s+from\s+['"]([^'"]+\.vue)['"]/g
    let match: RegExpExecArray | null
    while ((match = importRegex.exec(scriptContent)) !== null) {
      const importedPath = resolveImportPath(filePath, match[1], rootDir)
      if (importedPath) {
        links.push({ source: id, target: importedPath, type: 'static_import' })
      }
    }

    // store usage: useXxxStore()
    const storeRegex = /\buse(\w+Store)\s*\(/g
    const seenStores = new Set<string>()
    while ((match = storeRegex.exec(scriptContent)) !== null) {
      const storeName = `use${match[1]}`
      if (!seenStores.has(storeName)) {
        seenStores.add(storeName)
        links.push({ source: id, target: storeName, type: 'state_consumption' })
      }
    }

    // fetch/axios calls pointing to .php files
    const fetchRegex = /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*['"`]([^'"`]+\.php[^'"`]*)['"` ]/g
    while ((match = fetchRegex.exec(scriptContent)) !== null) {
      const endpoint = match[1].split('?')[0]
      links.push({ source: id, target: endpoint, type: 'wormhole' })
    }

    // method/function definitions
    const fnRegex = /(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\()/g
    while ((match = fnRegex.exec(scriptContent)) !== null) {
      const fnName = match[1] ?? match[2]
      if (fnName && !fnName.startsWith('use')) {
        childNodes.push({
          id: `${fnName}()`,
          type: 'method',
          parent: id,
        })
      }
    }
  }

  return { node, links, childNodes }
}

function extractScriptBlock(content: string): string {
  const match = content.match(/<script(?:\s[^>]*)?>([^]*?)<\/script>/i)
  return match ? match[1] : ''
}

function isStoreFile(id: string, scriptContent: string): boolean {
  return (
    id.toLowerCase().includes('store') ||
    scriptContent.includes('defineStore')
  )
}

function resolveImportPath(fromFile: string, importPath: string, rootDir: string): string | null {
  try {
    let resolved: string
    if (importPath.startsWith('@/')) {
      resolved = path.resolve(rootDir, 'src', importPath.slice(2))
    } else if (importPath.startsWith('~/')) {
      resolved = path.resolve(rootDir, 'src', importPath.slice(2))
    } else {
      resolved = path.resolve(path.dirname(fromFile), importPath)
    }
    return path.relative(rootDir, resolved).replace(/\\/g, '/')
  } catch {
    return null
  }
}
