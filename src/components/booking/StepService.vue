<script setup>
import { computed } from 'vue'

import DataState from '@/components/ui/DataState.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchServiceCategories, fetchServices } from '@/services/api'
import { formatDuration, formatPrice } from '@/utils/format'

defineProps({ selected: { type: Object, default: null } })
defineEmits(['select'])

const load = async () => {
  const [categories, services] = await Promise.all([fetchServiceCategories(), fetchServices()])
  return { categories, services }
}
const { data, loading, error, reload } = useApiData(load, { categories: [], services: [] })

const groups = computed(() => {
  const { categories, services } = data.value
  const known = new Set(categories.map((c) => c.slug))
  const list = categories
    .map((c) => ({ key: c.slug, name: c.name, items: services.filter((s) => s.category?.slug === c.slug) }))
    .filter((g) => g.items.length)
  const others = services.filter((s) => !s.category?.slug || !known.has(s.category.slug))
  if (others.length) list.push({ key: 'autres', name: 'Autres prestations', items: others })
  return list
})
</script>

<template>
  <DataState :loading="loading" :error="error" :empty="!groups.length" loading-label="Chargement des prestations…" empty-label="Aucune prestation n’est disponible pour le moment." min-height="18rem" @retry="reload">
    <div class="groups">
      <fieldset v-for="g in groups" :key="g.key" class="group">
        <legend>{{ g.name }}</legend>
        <label v-for="s in g.items" :key="s.slug" class="opt" :class="{ on: selected?.slug === s.slug }">
          <input type="radio" name="service" :value="s.slug" :checked="selected?.slug === s.slug" @change="$emit('select', s)" />
          <span class="dot" aria-hidden="true" />
          <span class="txt">
            <span class="name">{{ s.name }}</span>
            <span v-if="s.description" class="d">{{ s.description }}</span>
          </span>
          <span class="meta">
            <span class="price">{{ formatPrice(s.price, s.currency) }}</span>
            <span v-if="s.durationMinutes">{{ formatDuration(s.durationMinutes) }}</span>
          </span>
        </label>
      </fieldset>
    </div>
  </DataState>
</template>

<style scoped>
.groups { display: grid; gap: 2rem; }
.group { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: 0.6rem; }
legend { padding: 0; margin-bottom: 0.6rem; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; }
.opt { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 0.9rem; align-items: start; padding: 1rem 1.2rem; min-height: 64px; background: #fff; border: 1.5px solid var(--line); border-radius: 20px; cursor: pointer; transition: border-color 0.2s, background-color 0.2s; }
.opt:hover { border-color: var(--copper); transform: translateY(-1px); }
.opt.on { border-color: var(--copper); background: var(--grad-soft); box-shadow: 0 0 0 1px var(--copper); }
.opt input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
.opt:has(input:focus-visible) { outline: 2px solid var(--copper-bright); outline-offset: 3px; }
.dot { width: 20px; height: 20px; margin-top: 0.15rem; border: 1.5px solid var(--copper); border-radius: 50%; display: grid; background: #fff; place-items: center; }
.opt.on .dot { border-color: var(--copper); }
.opt.on .dot::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: var(--copper); }
.txt { display: grid; gap: 0.2rem; min-width: 0; }
.name { font-weight: 600; }
.d { color: var(--muted); font-size: 0.92rem; }
.meta { grid-column: 2; display: flex; flex-wrap: wrap; gap: 0.2rem 1rem; font-size: 0.9rem; font-weight: 600; color: var(--muted); }
.price { color: var(--copper); }
@media (min-width: 640px) {
  .opt { grid-template-columns: auto 1fr auto; align-items: center; }
  .meta { grid-column: 3; flex-direction: column; text-align: right; gap: 0.1rem; }
}
</style>
