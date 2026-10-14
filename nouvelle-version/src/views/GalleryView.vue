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
const ratios = ['4 / 5', '1 / 1', '4 / 5.6', '5 / 4.4', '4 / 5', '1 / 1.2']
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
          <ul class="masonry">
            <li v-for="(item, i) in items" :key="item.id">
              <button type="button" :aria-label="`Agrandir la photo : ${item.title}`" @click="open(i)">
                <ApiImage :src="item.imageUrl" :alt="item.title" :ratio="ratios[i % ratios.length]" />
                <span class="cap"><span>{{ item.title }}</span><span v-if="item.category?.name" class="cat">{{ item.category.name }}</span></span>
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
.masonry { columns: 2; column-gap: 0.8rem; }
.masonry li { break-inside: avoid; margin-bottom: 0.8rem; }
.masonry button { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 24px; overflow: hidden; text-align: left; box-shadow: var(--shadow); }
.masonry :deep(img) { transition: transform 0.8s var(--ease); }
.masonry button:hover :deep(img), .masonry button:focus-visible :deep(img) { transform: scale(1.05); }
.cap { position: absolute; inset: auto 0 0 0; display: grid; gap: 0.1rem; padding: 2.4rem 0.9rem 0.8rem; color: #fff; font-size: 0.88rem; font-weight: 500; background: linear-gradient(transparent, rgba(42, 21, 32, 0.9)); opacity: 0; transform: translateY(6px); transition: all 0.35s var(--ease); }
.cat { font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--caramel); }
.masonry button:hover .cap, .masonry button:focus-visible .cap { opacity: 1; transform: none; }
@media (hover: none) { .cap { opacity: 1; transform: none; font-size: 0.78rem; padding-top: 1.6rem; } }
@media (min-width: 760px) { .masonry { columns: 3; column-gap: 1.2rem; } .masonry li { margin-bottom: 1.2rem; } }
@media (min-width: 1100px) { .masonry { columns: 4; } }
</style>
