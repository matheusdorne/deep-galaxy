#!/usr/bin/env node
import * as path from 'path'
import { scan } from './scanner.js'
import { writeConstellation } from './writer.js'

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: deep-galaxy-scan <target-dir> [options]

Options:
  --output <path>   Output file path (default: ./constellation.json)
  -h, --help        Show this help message
`)
  process.exit(0)
}

const targetDir  = path.resolve(args[0])
const outputFlag = args.indexOf('--output')
const outputPath = outputFlag !== -1 && args[outputFlag + 1]
  ? path.resolve(args[outputFlag + 1])
  : path.resolve('constellation.json')

console.log(`Scanning: ${targetDir}`)

const constellation = scan(targetDir)

writeConstellation(constellation, outputPath)

console.log(`Done. ${constellation.nodes.length} nodes, ${constellation.links.length} links → ${outputPath}`)
