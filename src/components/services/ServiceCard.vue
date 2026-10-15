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
  <article v-tilt="4" class="card">
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
      <button type="button" class="btn btn-primary btn-block" :aria-label="`Réserver : ${service.name}`" @click="book">Réserver <span class="arr" aria-hidden="true">→</span></button>
    </div>
  </article>
</template>

<style scoped>
.card { position: relative; display: flex; flex-direction: column; height: 100%; background: #fff; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px)); transition: transform 0.35s var(--ease), box-shadow 0.45s var(--ease); will-change: transform; }
.card:hover { --lift: -8px; box-shadow: 0 40px 60px -28px rgba(74, 54, 36, 0.6); }
/* Reflet qui suit le pointeur */
.card::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgba(228, 200, 120, 0.28), transparent 60%); transition: opacity 0.4s; }
.card:hover::after { opacity: 1; }
/* Détails qui apparaissent un à un quand la carte entre à l'écran */
.body > * { transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
.body > :nth-child(1) { transition-delay: 0.25s; }
.body > :nth-child(2) { transition-delay: 0.33s; }
.body > :nth-child(3) { transition-delay: 0.41s; }
.body > :nth-child(4) { transition-delay: 0.49s; }
:global(.reveal:not(.is-in)) .body > * { opacity: 0; transform: translate3d(0, 14px, 0); }
.media { position: relative; overflow: hidden; }
.media :deep(img) { transition: transform 0.9s var(--ease); }
.card:hover .media :deep(img) { transform: scale(1.06); }
.card:hover .chip { transform: translateX(4px); }
.chip { transition: transform 0.4s var(--ease); position: absolute; left: 0.9rem; top: 0.9rem; padding: 0.3rem 0.8rem; border-radius: 999px; background: rgba(255, 255, 255, 0.92); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--copper); }
.body { display: flex; flex-direction: column; gap: 0.8rem; padding: 1.4rem 1.4rem 1.5rem; flex: 1; }
.desc { color: var(--muted); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; margin-top: auto; padding-top: 0.4rem; }
.pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: var(--paper); font-size: 0.85rem; font-weight: 700; }
.price { display: inline-block; transform-origin: left center; font-family: var(--font-display); font-size: 1.25rem; font-weight: 560; color: var(--copper); transition: transform 0.45s var(--ease); }
.card:hover .price { transform: scale(1.14); }
.arr { display: inline-block; transition: transform 0.35s var(--ease); }
.card:hover .arr, .btn:hover .arr { transform: translateX(5px); }
</style>
