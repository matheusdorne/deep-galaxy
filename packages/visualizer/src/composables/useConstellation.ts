import { ref, onMounted } from 'vue'
import type { Constellation } from '../types/constellation'

export function useConstellation() {
  const constellation = ref<Constellation | null>(null)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch('/constellation.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      constellation.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load constellation.json'
    }
  })

  return { constellation, error }
}
