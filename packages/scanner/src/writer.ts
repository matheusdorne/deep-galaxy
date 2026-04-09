import * as fs from 'fs'
import type { Constellation } from './types.js'

export function writeConstellation(constellation: Constellation, outputPath: string): void {
  const json = JSON.stringify(constellation, null, 2)
  fs.writeFileSync(outputPath, json, 'utf-8')
}
