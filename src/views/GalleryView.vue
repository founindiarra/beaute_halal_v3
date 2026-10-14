<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GalleryLightbox from '@/components/gallery/GalleryLightbox.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import ApiImage from '@/components/ui/ApiImage.vue'
import DataState from '@/components/ui/DataState.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { preselectFromGallery } from '@/composables/useBooking'
import { useApiData } from '@/composables/useApiData'
import { heroImages } from '@/data/heroImages'
import { fetchGalleryCategories, fetchGalleryItems } from '@/services/api'

const route = useRoute()
const router = useRouter()

const { data: cats } = useApiData(fetchGalleryCategories, [])
/** Les catégories viennent de l'API ; « Toutes » n'est proposée que si l'API ne la fournit pas. */
const categories = computed(() => {
  const list = cats.value ?? []
  return list.some((c) => c.slug === 'all') ? list : [{ slug: 'all', name: 'Toutes' }, ...list]
})

const active = ref('all')
const { data, loading, error, reload } = useApiData((slug) => fetchGalleryItems({ category: slug }), [], { immediate: false })
const items = computed(() => (data.value ?? []).filter((i) => i.imageUrl))

const load = () => reload(active.value)
load()
watch(active, load)

const current = ref(-1)
const open = (i) => (current.value = i)
const close = () => {
  current.value = -1
  if (route.query.photo) router.replace({ query: { ...route.query, photo: undefined } })
}

/* Arrivée depuis l'accueil (?photo=<id>) : ouvre la visionneuse sur cette coiffure. */
watch(
  [items, () => route.query.photo],
  ([list, photo]) => {
    if (!photo || !list.length || current.value !== -1) return
    const idx = list.findIndex((i) => String(i.id) === String(photo))
    if (idx >= 0) current.value = idx
  },
  { immediate: true },
)

const book = (item) => {
  preselectFromGallery(item)
  router.push({ name: 'booking', query: { coiffure: item.id } })
}
</script>

<template>
  <div>
    <PageHero :image="heroImages.gallery" eyebrow="Nos coiffures" title="Les coiffures du salon." lede="Ouvrez une photo en grand, puis réservez directement la coiffure qui vous plaît.">
      <template #title>Les <em>coiffures</em> du salon.</template>
    </PageHero>

    <section class="section-tight">
      <div class="container">
        <div v-if="categories.length > 2" class="filters" role="group" aria-label="Filtrer par catégorie">
          <button
            v-for="c in categories"
            :key="c.slug"
            type="button"
            class="chip"
            :aria-pressed="active === c.slug"
            @click="active = c.slug"
          >
            {{ c.name }}
          </button>
        </div>

        <DataState
          :loading="loading"
          :error="error"
          :empty="!items.length"
          loading-label="Chargement des coiffures…"
          empty-label="Aucune coiffure dans cette catégorie pour le moment."
          min-height="24rem"
          @retry="load"
        >
          <ul class="cards">
            <li v-for="(item, i) in items" :key="item.id" v-reveal="(i % 4) * 70">
              <button type="button" class="card" :aria-label="`Agrandir la photo : ${item.title}`" @click="open(i)">
                <span class="media">
                  <ApiImage :src="item.imageUrl" :alt="item.title" ratio="4 / 5" />
                  <span v-if="item.category?.name" class="tag">{{ item.category.name }}</span>
                  <span class="zoom" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M11 5v12M5 11h12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
                  </span>
                </span>
                <span class="body">
                  <span class="name">{{ item.title }}</span>
                  <span class="more">Voir en grand <span aria-hidden="true">→</span></span>
                </span>
              </button>
            </li>
          </ul>
        </DataState>
      </div>
    </section>

    <VisitBlock title="Une coiffure vous inspire ?" text="Ouvrez la photo, choisissez « Réserver cette coiffure » : son nom accompagne votre demande jusqu’au salon." />

    <GalleryLightbox v-if="current >= 0 && items[current]" v-model:index="current" :items="items" @close="close" @book="book" />
  </div>
</template>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.chip { min-height: 44px; padding: 0.4rem 1.2rem; font-weight: 700; font-size: 0.9rem; background: #fff; color: var(--ink); border: 1.5px solid rgba(42, 21, 32, 0.15); border-radius: 999px; cursor: pointer; transition: all 0.25s var(--ease); }
.chip:hover { border-color: var(--copper); color: var(--copper); }
.chip[aria-pressed='true'] { background: var(--grad-btn); border-color: transparent; color: #fff; }
.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.card { display: flex; flex-direction: column; width: 100%; height: 100%; padding: 0.45rem; text-align: left; font: inherit; color: inherit; background: #fff; border: 0; border-radius: 28px; cursor: pointer; box-shadow: var(--shadow); transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease); }
.card:hover, .card:focus-visible { transform: translateY(-6px); box-shadow: var(--shadow-lift); }
.media { position: relative; display: block; border-radius: 22px; overflow: hidden; }
.media :deep(img) { transition: transform 0.9s var(--ease); }
.card:hover .media :deep(img), .card:focus-visible .media :deep(img) { transform: scale(1.07); }
.tag { position: absolute; left: 0.6rem; top: 0.6rem; padding: 0.3rem 0.75rem; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); background: rgba(255, 255, 255, 0.92); border-radius: 999px; backdrop-filter: blur(6px); }
.zoom { position: absolute; right: 0.6rem; bottom: 0.6rem; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; color: #fff; background: var(--grad-btn); box-shadow: var(--shadow); transform: scale(0.85); opacity: 0.9; transition: transform 0.35s var(--ease); }
.card:hover .zoom, .card:focus-visible .zoom { transform: scale(1.08) rotate(90deg); }
.body { display: grid; gap: 0.25rem; padding: 0.85rem 0.7rem 0.8rem; }
.name { font-family: var(--font-display); font-size: 1.12rem; font-weight: 600; line-height: 1.2; font-variation-settings: 'opsz' 36; }
.more { font-size: 0.82rem; font-weight: 700; color: var(--copper); }
@media (min-width: 760px) { .cards { grid-template-columns: repeat(3, 1fr); gap: 1.4rem; } }
@media (min-width: 1100px) { .cards { grid-template-columns: repeat(4, 1fr); } }
</style>
