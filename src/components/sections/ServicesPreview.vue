<script setup>
import { computed } from 'vue'

import ServiceCard from '@/components/services/ServiceCard.vue'
import DataState from '@/components/ui/DataState.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchServices } from '@/services/api'

/** Prestations mises en avant ; à défaut, les premières du catalogue. */
const load = async () => {
  const featured = await fetchServices({ featured: true })
  if (featured.length) return featured.slice(0, 6)
  return (await fetchServices()).slice(0, 3)
}
const { data, loading, error, reload } = useApiData(load, [])
const services = computed(() => data.value ?? [])
</script>

<template>
  <section class="section on-paper svc">
    <div class="container">
      <header class="head" v-reveal>
        <div>
          <p class="eyebrow">Nos services</p>
          <h2>Ce que nous <em>réalisons</em> pour vos locks</h2>
        </div>
        <RouterLink :to="{ name: 'services' }" class="link-arrow">Tous les services <span class="arrow" aria-hidden="true">→</span></RouterLink>
      </header>
      <DataState :loading="loading" :error="error" :empty="!services.length" loading-label="Chargement des services…" empty-label="Les services seront bientôt en ligne." @retry="reload">
        <ul class="grid">
          <li v-for="(s, i) in services" :key="s.id || s.slug" v-reveal="i * 80"><ServiceCard :service="s" /></li>
        </ul>
      </DataState>
    </div>
  </section>
</template>

<style scoped>
.svc { padding-top: clamp(1.5rem, 3vw, 2.5rem); }
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 2.5rem; }
.head > div { display: grid; gap: 1rem; }
.grid { display: grid; gap: 1.5rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 1.8rem; } }
</style>
