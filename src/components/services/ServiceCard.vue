<script setup>
import { useRouter } from 'vue-router'

import ApiImage from '@/components/ui/ApiImage.vue'
import { preselectService } from '@/composables/useBooking'
import { formatDuration, formatPrice } from '@/utils/format'

const props = defineProps({ service: { type: Object, required: true } })
const router = useRouter()

const book = () => {
  preselectService(props.service)
  router.push({ name: 'booking', query: { prestation: props.service.slug } })
}
</script>

<template>
  <article class="card">
    <div class="media">
      <ApiImage :src="service.imageUrl" :alt="service.name" ratio="4 / 3" />
      <span v-if="service.category?.name" class="chip">{{ service.category.name }}</span>
    </div>
    <div class="body">
      <h3>{{ service.name }}</h3>
      <p v-if="service.description" class="desc">{{ service.description }}</p>
      <div class="meta">
        <span v-if="service.durationMinutes" class="pill"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>{{ formatDuration(service.durationMinutes) }}</span>
        <span class="price">{{ formatPrice(service.price, service.currency) }}</span>
      </div>
      <button type="button" class="btn btn-primary btn-block" :aria-label="`Réserver : ${service.name}`" @click="book">Réserver</button>
    </div>
  </article>
</template>

<style scoped>
.card { display: flex; flex-direction: column; height: 100%; background: #fff; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease); }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lift); }
.media { position: relative; overflow: hidden; }
.media :deep(img) { transition: transform 0.8s var(--ease); }
.card:hover .media :deep(img) { transform: scale(1.06); }
.chip { position: absolute; left: 0.9rem; top: 0.9rem; padding: 0.3rem 0.8rem; border-radius: 999px; background: rgba(255, 255, 255, 0.92); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--copper); }
.body { display: flex; flex-direction: column; gap: 0.8rem; padding: 1.4rem 1.4rem 1.5rem; flex: 1; }
.desc { color: var(--muted); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; margin-top: auto; padding-top: 0.4rem; }
.pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: var(--paper); font-size: 0.85rem; font-weight: 700; }
.price { font-family: var(--font-display); font-size: 1.25rem; font-weight: 560; color: var(--copper); }
</style>
