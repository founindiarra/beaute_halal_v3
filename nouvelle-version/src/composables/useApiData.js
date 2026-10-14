import { onMounted, ref, shallowRef } from 'vue'

/**
 * Charge une donnée de l'API et expose chargement / erreur / données.
 * Une réponse tardive d'un appel périmé est ignorée (pas de course entre deux reload).
 */
export function useApiData(loader, initialValue = null, { immediate = true } = {}) {
  const data = shallowRef(initialValue)
  const loading = ref(false)
  const error = ref(null)
  const loaded = ref(false)
  let ticket = 0

  const reload = async (...args) => {
    const mine = ++ticket
    loading.value = true
    error.value = null
    try {
      const result = await loader(...args)
      if (mine !== ticket) return null
      data.value = result
      loaded.value = true
      return result
    } catch (caught) {
      if (mine !== ticket) return null
      error.value = caught?.message || 'Une erreur est survenue.'
      data.value = initialValue
      return null
    } finally {
      if (mine === ticket) loading.value = false
    }
  }

  if (immediate) onMounted(() => reload())
  return { data, loading, error, loaded, reload }
}
