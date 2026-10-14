<script setup>
import { computed } from 'vue'

import ApiImage from '@/components/ui/ApiImage.vue'
import { formatDuration, formatPrice } from '@/utils/format'

/**
 * Rappel de ce qui a été choisi, affiché au-dessus des étapes 2 à 4 (comme sur les sites 1 et 2) :
 * visuel de la prestation, nom, catégorie, description, durée, tarif indicatif.
 * Si la cliente vient de « Nos coiffures », la coiffure choisie est rappelée dessous.
 */
const props = defineProps({
  service: { type: Object, required: true },
  inspiration: { type: Object, default: null },
})
defineEmits(['change', 'clear-inspiration'])

/** Visuel : celui de la prestation, sinon la photo de la coiffure choisie. */
const image = computed(() => props.service.imageUrl || props.inspiration?.imageUrl || '')
</script>

<template>
  <section class="picked" aria-labelledby="picked-title">
    <div class="visual">
      <ApiImage :src="image" :alt="`${service.name} — Beauté Halal`" ratio="4 / 3" eager />
      <span v-if="service.category?.name" class="chip">{{ service.category.name }}</span>
    </div>

    <div class="info">
      <p id="picked-title" class="eyebrow">Votre prestation</p>
      <h2>{{ service.name }}</h2>
      <p v-if="service.description" class="desc">{{ service.description }}</p>

      <dl class="facts">
        <div v-if="service.durationMinutes">
          <dt>Durée</dt>
          <dd>{{ formatDuration(service.durationMinutes) }}</dd>
        </div>
        <div>
          <dt>Tarif indicatif</dt>
          <dd class="price">{{ formatPrice(service.price, service.currency) }}</dd>
        </div>
      </dl>

      <div v-if="inspiration" class="style">
        <img v-if="inspiration.imageUrl" :src="inspiration.imageUrl" :alt="inspiration.title" width="48" height="48" />
        <p><span class="k">Coiffure choisie</span><strong>{{ inspiration.title }}</strong></p>
        <button type="button" class="linkish" @click="$emit('clear-inspiration')">Retirer</button>
      </div>

      <button type="button" class="btn btn-outline btn-sm change" @click="$emit('change')">← Changer de prestation</button>
    </div>
  </section>
</template>

<style scoped>
.picked { display: grid; overflow: hidden; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.visual { position: relative; }
.chip { position: absolute; left: 0.8rem; top: 0.8rem; padding: 0.3rem 0.8rem; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); background: rgba(255, 255, 255, 0.92); border-radius: 999px; }
.info { display: grid; gap: 0.7rem; align-content: start; padding: clamp(1.2rem, 3vw, 1.8rem); min-width: 0; }
h2 { font-size: clamp(1.5rem, 3vw, 1.9rem); }
.desc { color: var(--muted); font-size: 0.95rem; }
.facts { display: flex; flex-wrap: wrap; gap: 0.6rem 2.2rem; margin: 0.3rem 0 0; padding-top: 0.9rem; border-top: 1px solid var(--line); }
.facts dt { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.facts dd { margin: 0.1rem 0 0; font-weight: 600; }
.price { font-family: var(--font-display); font-size: 1.3rem; color: var(--copper); }
.style { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.8rem; padding: 0.6rem 0.8rem; background: var(--grad-soft); border-radius: 16px; }
.style img { width: 48px; height: 48px; object-fit: cover; border-radius: 12px; }
.style p { display: grid; min-width: 0; font-size: 0.92rem; }
.k { font-size: 0.66rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
.linkish { background: none; border: 0; min-height: 44px; padding: 0 0.3rem; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font-weight: 600; }
.change { justify-self: start; margin-top: 0.3rem; }
@media (min-width: 700px) { .picked { grid-template-columns: 15rem 1fr; } .visual :deep(.aimg) { height: 100%; aspect-ratio: auto !important; min-height: 100%; } }
@media (min-width: 1000px) { .picked { grid-template-columns: 17rem 1fr; } }
</style>
