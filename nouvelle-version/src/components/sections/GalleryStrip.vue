<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ApiImage from '@/components/ui/ApiImage.vue'
import DataState from '@/components/ui/DataState.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchGalleryItems } from '@/services/api'

const router = useRouter()
const { data, loading, error, reload } = useApiData(async () => {
  const featured = await fetchGalleryItems({ featured: true })
  return featured.length >= 3 ? featured : await fetchGalleryItems()
}, [])
const items = computed(() => (data.value ?? []).filter((i) => i.imageUrl).slice(0, 5))
const ratios = ['4 / 5.2', '1 / 1', '4 / 4.8', '4 / 5', '1 / 1.1']
const open = (item) => router.push({ name: 'gallery', query: { photo: item.id } })
</script>

<template>
  <section class="gal on-dark">
    <svg class="wave top" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,0 L0,0 Z" fill="#fff8f1" /></svg>
    <div class="container inner">
      <header class="head" v-reveal>
        <div>
          <p class="eyebrow">Nos coiffures</p>
          <h2>Des réalisations qui <em>parlent d’elles-mêmes</em></h2>
        </div>
        <RouterLink :to="{ name: 'gallery' }" class="link-arrow">Toutes les coiffures <span class="arrow" aria-hidden="true">→</span></RouterLink>
      </header>
      <DataState :loading="loading" :error="error" :empty="!items.length" loading-label="Chargement des coiffures…" empty-label="Les photos seront bientôt en ligne." @retry="reload">
        <ul class="strip">
          <li v-for="(item, i) in items" :key="item.id" v-reveal="i * 70" :class="`c${i}`">
            <button type="button" :aria-label="`Voir la coiffure : ${item.title}`" @click="open(item)">
              <ApiImage :src="item.imageUrl" :alt="item.title" :ratio="ratios[i % ratios.length]" />
              <span class="cap">{{ item.title }}</span>
            </button>
          </li>
        </ul>
      </DataState>
    </div>
    <svg class="wave bottom" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" fill="#fff8f1" /></svg>
  </section>
</template>

<style scoped>
.gal { position: relative; }
.inner { padding-block: clamp(2rem, 5vw, 4rem); }
.wave { position: absolute; left: 0; right: 0; }
.wave.top { top: -1px; }
.wave.bottom { bottom: -1px; }
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 2.5rem; }
.head > div { display: grid; gap: 1rem; }
.strip { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; align-items: start; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
.strip button { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: left; border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 20px 40px -24px rgba(0, 0, 0, 0.7); }
.strip :deep(img) { transition: transform 0.8s var(--ease); }
.strip button:hover :deep(img) { transform: scale(1.06); }
.cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.5rem 1rem 0.9rem; font-size: 0.9rem; font-weight: 500; color: #fff; background: linear-gradient(transparent, rgba(42, 21, 32, 0.88)); }
.c0 { grid-column: span 2; }
@media (min-width: 900px) {
  .strip { grid-template-columns: repeat(12, 1fr); gap: 1.2rem; }
  .c0 { grid-column: span 5; }
  .c1 { grid-column: span 4; margin-top: 3rem; }
  .c2 { grid-column: span 3; }
  .c3 { grid-column: 3 / span 4; }
  .c4 { grid-column: span 4; margin-top: 2rem; }
}
</style>
