<script setup>
import { useRouter } from 'vue-router'

import ApiImage from '@/components/ui/ApiImage.vue'
import { preselectService } from '@/composables/useBooking'
import { formatDuration, formatPrice, pad2 } from '@/utils/format'

defineProps({
  services: { type: Array, required: true },
  /** Numéro de départ de la liste (la numérotation continue d'une catégorie à l'autre). */
  start: { type: Number, default: 1 },
  withImages: { type: Boolean, default: true },
})

const router = useRouter()

const book = (service) => {
  preselectService(service)
  router.push({ name: 'booking', query: { prestation: service.slug } })
}
</script>

<template>
  <ol class="rows">
    <li v-for="(s, i) in services" :key="s.id || s.slug" v-reveal class="row">
      <span class="numeral n" aria-hidden="true">{{ pad2(start + i) }}</span>
      <div v-if="withImages" class="thumb">
        <ApiImage :src="s.imageUrl" :alt="s.name" ratio="1 / 1" />
      </div>
      <div class="body">
        <h3>{{ s.name }}</h3>
        <p v-if="s.description" class="desc">{{ s.description }}</p>
        <p class="meta">
          <span v-if="s.durationMinutes">{{ formatDuration(s.durationMinutes) }}</span>
          <span class="price">{{ formatPrice(s.price, s.currency) }}</span>
        </p>
      </div>
      <button type="button" class="btn btn-outline btn-sm book" :aria-label="`Réserver : ${s.name}`" @click="book(s)">
        Réserver <span aria-hidden="true">→</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.rows { border-top: 1px solid var(--line-strong); }
.row { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1.1rem; align-items: start; padding-block: 1.5rem; border-bottom: 1px solid var(--line); }
.n { font-size: 1.1rem; padding-top: 0.2rem; min-width: 2ch; }
.thumb { display: none; }
.body { grid-column: 2; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
.desc { color: var(--muted); font-size: 0.98rem; max-width: 52ch; }
.meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1.25rem; font-size: 0.92rem; font-weight: 600; color: var(--muted); }
.meta span + span::before { content: '·'; margin-right: 1.25rem; color: var(--caramel); }
.price { color: var(--copper); }
.book { grid-column: 2; justify-self: start; margin-top: 0.4rem; }

@media (min-width: 760px) {
  .row { grid-template-columns: 3.2rem 96px 1fr auto; align-items: center; gap: 1.5rem; padding-block: 1.6rem; }
  .n { font-size: 1.5rem; }
  .thumb { display: block; border-radius: var(--radius); overflow: hidden; }
  .body { grid-column: auto; }
  .book { grid-column: auto; margin: 0; justify-self: end; }
}
</style>
