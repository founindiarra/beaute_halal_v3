<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ApiImage from '@/components/ui/ApiImage.vue'
import DataState from '@/components/ui/DataState.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchGalleryItems } from '@/services/api'

const router = useRouter()
/* Les mêmes coiffures que la page « Nos coiffures ». */
const { data, loading, error, reload } = useApiData(() => fetchGalleryItems(), [])
const items = computed(() => (data.value ?? []).filter((i) => i.imageUrl))
/* Une seule ligne qui défile : la liste est répétée pour remplir la largeur, puis le groupe est dupliqué
   (copie masquée aux lecteurs d'écran) pour une boucle sans saut. */
const group = computed(() => {
  const base = items.value
  if (!base.length) return []
  const reps = Math.max(1, Math.ceil(8 / base.length))
  return Array.from({ length: reps }, () => base).flat()
})
const open = (item) => router.push({ name: 'gallery', query: { photo: item.id } })
</script>

<template>
  <section class="gal on-dark">
    <svg class="wave top" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,0 L0,0 Z" fill="#faf8f4" /></svg>
    <div class="container inner">
      <header class="head" v-reveal>
        <div>
          <p class="eyebrow">Nos coiffures</p>
          <h2>Des réalisations qui <em>parlent d’elles-mêmes</em></h2>
        </div>
        <RouterLink :to="{ name: 'gallery' }" class="link-arrow">Toutes les coiffures <span class="arrow" aria-hidden="true">→</span></RouterLink>
      </header>
    </div>
    <DataState :loading="loading" :error="error" :empty="!items.length" loading-label="Chargement des coiffures…" empty-label="Les photos seront bientôt en ligne." @retry="reload">
      <div class="marquee" aria-label="Défilement des coiffures du salon" role="group">
        <div class="track">
          <ul v-for="copy in 2" :key="copy" class="row" :aria-hidden="copy === 2 ? 'true' : undefined">
            <li v-for="(item, i) in group" :key="`${copy}-${i}-${item.id}`">
              <button type="button" :tabindex="copy === 2 ? -1 : 0" :aria-label="`Voir la coiffure : ${item.title}`" @click="open(item)">
                <ApiImage :src="item.imageUrl" :alt="copy === 2 ? '' : item.title" ratio="4 / 5" />
                <span class="cap">{{ item.title }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </DataState>
    <svg class="wave bottom" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" fill="#faf8f4" /></svg>
  </section>
</template>

<style scoped>
.gal { position: relative; padding-bottom: clamp(3rem, 6vw, 4.5rem); }
.inner { padding-top: clamp(3.5rem, 7vw, 5.5rem); }
.wave { position: absolute; left: 0; right: 0; }
.wave.top { top: -1px; }
.wave.bottom { bottom: -1px; }
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.2rem; margin-bottom: 1.6rem; }
.head > div { display: grid; gap: 0.8rem; }
.marquee { overflow: hidden; padding-block: 0.6rem; mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.track { display: flex; width: max-content; animation: slide 55s linear infinite; }
.marquee:hover .track, .marquee:focus-within .track { animation-play-state: paused; }
.row { display: flex; gap: 1rem; padding-right: 1rem; flex: none; }
.row li { flex: none; width: clamp(150px, 19vw, 240px); }
.row button { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; text-align: left; border-radius: 22px; overflow: hidden; position: relative; box-shadow: 0 18px 36px -22px rgba(0, 0, 0, 0.7); }
.row :deep(img) { transition: transform 0.8s var(--ease); }
.row button:hover :deep(img) { transform: scale(1.06); }
.cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 2rem 0.8rem 0.7rem; font-size: 0.82rem; font-weight: 500; color: #fff; background: linear-gradient(transparent, rgba(24, 19, 16, 0.88)); }
@keyframes slide { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .track { animation: none; }
  .marquee { overflow-x: auto; mask-image: none; }
}
</style>
