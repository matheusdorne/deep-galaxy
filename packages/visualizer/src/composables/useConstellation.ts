import type { Constellation } from '../types/constellation'
import data from '../../../../constellation.json'

export function useConstellation(): Constellation {
  return data as Constellation
}
