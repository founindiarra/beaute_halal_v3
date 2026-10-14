<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useApiData } from '@/composables/useApiData'
import { fetchTestimonials } from '@/services/api'
import { formatDateShort } from '@/utils/format'

/* Uniquement les avis réellement publiés par l'API. Aucun avis (ou erreur) : la section n'existe pas. */
const { data } = useApiData(fetchTestimonials, { items: [], averageRating: 0 })
const items = computed(() => (data.value?.items ?? []).filter((t) => t.comment).slice(0, 12))
const average = computed(() => Number(data.value?.averageRating) || 0)
const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

/* Carrousel : flèches précédent / suivant, défilement tactile, ancrage carte par carte. */
const track = ref(null)
const atStart = ref(true)
const atEnd = ref(false)
const update = () => {
  const el = track.value
  if (!el) return
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}
const scrollByCard = (dir) => {
  const el = track.value
  if (!el) return
  const card = el.querySelector('li')
  const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + 16
  el.scrollBy({ left: dir * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
onMounted(() => setTimeout(update, 50))
watch(items, () => nextTick(update))
</script>

<template>
  <section v-if="items.length" class="avis on-dark">
    <div class="container">
      <header class="head" v-reveal>
        <div>
          <p class="eyebrow">Avis de clientes</p>
          <h2>Elles en parlent <em>mieux que nous</em></h2>
        </div>
        <div class="tools">
          <p v-if="average" class="avg"><span class="numeral">{{ average.toFixed(1).replace('.', ',') }}</span> / 5 <span class="sr-only">de moyenne</span></p>
          <div v-if="items.length > 1" class="arrows">
            <button type="button" class="arrow-btn" aria-label="Avis précédents" :disabled="atStart" @click="scrollByCard(-1)">←</button>
            <button type="button" class="arrow-btn" aria-label="Avis suivants" :disabled="atEnd" @click="scrollByCard(1)">→</button>
          </div>
        </div>
      </header>
    </div>
    <div class="container">
      <ul ref="track" class="quotes" tabindex="0" aria-label="Avis de clientes, faites défiler pour en voir d’autres" @scroll.passive="update">
        <li v-for="(t, i) in items" :key="t.id || i">
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
.avis { padding-block: clamp(2.2rem, 4.5vw, 3.5rem); }
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
.head > div:first-child { display: grid; gap: 0.8rem; }
.tools { display: flex; align-items: center; gap: 1.4rem; }
.avg { font-size: 1.05rem; }
.avg .numeral { font-size: 2.4rem; }
.arrows { display: flex; gap: 0.6rem; }
.arrow-btn { width: 48px; height: 48px; display: grid; place-items: center; font-size: 1.25rem; color: #fff; background: rgba(255, 255, 255, 0.1); border: 1.5px solid rgba(255, 255, 255, 0.4); border-radius: 50%; cursor: pointer; transition: all 0.25s var(--ease); }
.arrow-btn:hover:not(:disabled) { background: var(--grad); border-color: transparent; transform: scale(1.06); }
.arrow-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.quotes { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 0.4rem; scrollbar-width: none; border-radius: var(--radius-lg); }
.quotes::-webkit-scrollbar { display: none; }
.quotes li { flex: none; width: min(86%, 380px); scroll-snap-align: start; padding: 1.4rem 1.5rem; display: grid; gap: 1rem; align-content: space-between; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: var(--radius-lg); backdrop-filter: blur(6px); }
blockquote { margin: 0; font-family: var(--font-display); font-size: clamp(1.1rem, 1.8vw, 1.3rem); line-height: 1.35; font-style: italic; font-variation-settings: 'opsz' 48; }
footer { display: flex; flex-wrap: wrap; gap: 0.2rem 0.6rem; font-size: 0.9rem; color: rgba(255, 243, 236, 0.88); }
.stars { color: var(--caramel); letter-spacing: 0.1em; }
.date { opacity: 0.8; }
@media (min-width: 900px) { .quotes li { width: calc((100% - 2rem) / 3); } }
</style>
