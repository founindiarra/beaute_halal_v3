<script setup>
import { computed, ref } from 'vue'

import ServiceCard from '@/components/services/ServiceCard.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import DataState from '@/components/ui/DataState.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useApiData } from '@/composables/useApiData'
import { heroImages } from '@/data/heroImages'
import { fetchServiceCategories, fetchServices } from '@/services/api'

const load = async () => {
  const [categories, services] = await Promise.all([fetchServiceCategories(), fetchServices()])
  return { categories, services }
}
const { data, loading, error, reload } = useApiData(load, { categories: [], services: [] })

const active = ref('all')
const chips = computed(() => {
  const { categories, services } = data.value
  return categories.filter((c) => services.some((s) => s.category?.slug === c.slug))
})
const list = computed(() => {
  const { services } = data.value
  return active.value === 'all' ? services : services.filter((s) => s.category?.slug === active.value)
})
</script>

<template>
  <div>
    <PageHero
      :image="heroImages.services"
      eyebrow="Nos services"
      title="Chaque étape de la vie de vos locks."
      lede="Durées et tarifs sont ceux enregistrés par le salon. Choisissez un service pour ouvrir directement le choix de la date."
    >
      <template #title>Chaque étape de la vie de <em>vos locks</em>.</template>
    </PageHero>

    <section class="section-tight">
      <div class="container">
        <div v-if="chips.length > 1" class="filters" role="group" aria-label="Filtrer par catégorie">
          <button type="button" class="pill-btn" :aria-pressed="active === 'all'" @click="active = 'all'">Tous</button>
          <button v-for="c in chips" :key="c.slug" type="button" class="pill-btn" :aria-pressed="active === c.slug" @click="active = c.slug">{{ c.name }}</button>
        </div>
        <DataState :loading="loading" :error="error" :empty="!list.length" loading-label="Chargement des services…" empty-label="Aucun service n’est disponible pour le moment." min-height="24rem" @retry="reload">
          <ul class="grid">
            <li v-for="(s, i) in list" :key="s.id || s.slug" v-reveal="(i % 3) * 80"><ServiceCard :service="s" /></li>
          </ul>
        </DataState>
      </div>
    </section>

    <VisitBlock />
  </div>
</template>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.pill-btn { min-height: 44px; padding: 0.4rem 1.2rem; font-weight: 700; font-size: 0.9rem; background: #fff; color: var(--ink); border: 1.5px solid rgba(24, 19, 16, 0.15); border-radius: 999px; cursor: pointer; transition: all 0.25s var(--ease); }
.pill-btn:hover { border-color: var(--copper); color: var(--copper); }
.pill-btn[aria-pressed='true'] { background: var(--grad-btn); border-color: transparent; color: #fff; }
.grid { display: grid; gap: 1.5rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 1.8rem; } }
</style>
