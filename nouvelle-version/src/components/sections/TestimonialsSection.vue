<script setup>
import { computed } from 'vue'

import { useApiData } from '@/composables/useApiData'
import { fetchTestimonials } from '@/services/api'
import { formatDateShort } from '@/utils/format'

/* Uniquement les avis réellement publiés par l'API. Aucun avis (ou erreur) : la section n'existe pas. */
const { data } = useApiData(fetchTestimonials, { items: [], averageRating: 0 })
const items = computed(() => (data.value?.items ?? []).filter((t) => t.comment).slice(0, 3))
const average = computed(() => Number(data.value?.averageRating) || 0)
const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))
</script>

<template>
  <section v-if="items.length" class="section on-dark">
    <div class="container">
      <header class="head" v-reveal>
        <div>
          <p class="eyebrow">Avis de clientes</p>
          <h2>Elles en parlent <em>mieux que nous</em></h2>
        </div>
        <p v-if="average" class="avg"><span class="numeral">{{ average.toFixed(1).replace('.', ',') }}</span> / 5 <span class="sr-only">de moyenne</span></p>
      </header>
      <ul class="quotes">
        <li v-for="(t, i) in items" :key="t.id || i" v-reveal="i * 90">
          <blockquote>« {{ t.comment }} »</blockquote>
          <footer>
            <strong>{{ t.firstName }}</strong>
            <span v-if="t.serviceName"> · {{ t.serviceName }}</span>
            <span v-if="t.rating" class="stars" :aria-label="`Note : ${t.rating} sur 5`">{{ stars(t.rating) }}</span>
            <span v-if="t.reviewedOn" class="date">{{ formatDateShort(t.reviewedOn) }}</span>
          </footer>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 2.5rem; }
.head > div { display: grid; gap: 1rem; }
.avg { font-size: 1.1rem; }
.avg .numeral { font-size: 2.8rem; }
.quotes { display: grid; gap: 1.2rem; }
.quotes li { padding: 1.8rem; display: grid; gap: 1.2rem; align-content: space-between; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: var(--radius-lg); backdrop-filter: blur(6px); }
blockquote { margin: 0; font-family: var(--font-display); font-size: clamp(1.2rem, 2vw, 1.45rem); line-height: 1.35; font-style: italic; font-variation-settings: 'opsz' 48; }
footer { display: flex; flex-wrap: wrap; gap: 0.2rem 0.6rem; font-size: 0.92rem; color: rgba(255, 243, 236, 0.88); }
.stars { color: var(--caramel); letter-spacing: 0.1em; }
.date { opacity: 0.8; }
@media (min-width: 900px) { .quotes { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; } }
</style>
