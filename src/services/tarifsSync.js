import { applyCatalogue } from '@/data/tarifs'

import { fetchTarifs } from './api'

/**
 * Charge le catalogue tarifaire du salon avant l'affichage, avec un délai
 * court : si l'API est lente, absente (backend plus ancien) ou en panne, le
 * site démarre avec la grille embarquée, sans message d'erreur. Le serveur
 * recalcule de toute façon chaque estimation à partir du catalogue en base.
 */
export async function syncTarifs(timeoutMs = 2500) {
  try {
    const catalogue = await Promise.race([
      fetchTarifs(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ])
    return applyCatalogue(catalogue)
  } catch {
    return false
  }
}
