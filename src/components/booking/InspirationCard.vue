<script setup>
import ApiImage from '@/components/ui/ApiImage.vue'
import { PRESTATIONS } from '@/data/tarifs'

/** La coiffure choisie dans « Nos coiffures » accompagne la demande jusqu'au salon. */
defineProps({ inspiration: { type: Object, required: true } })
defineEmits(['clear'])
</script>

<template>
  <aside class="insp" aria-label="Coiffure choisie">
    <ApiImage :src="inspiration.imageUrl" :alt="inspiration.title" ratio="4 / 5" class="pic" />
    <div class="txt">
      <p class="eyebrow">Coiffure choisie</p>
      <h2>{{ inspiration.title }}</h2>
      <p v-if="inspiration.description" class="desc">{{ inspiration.description }}</p>
      <p class="avail">Prestations : <span v-for="(p, i) in PRESTATIONS" :key="p.id">{{ p.name }}<template v-if="i < PRESTATIONS.length - 1"> · </template></span></p>
      <button type="button" class="linkish" @click="$emit('clear')">Retirer cette coiffure</button>
    </div>
  </aside>
</template>

<style scoped>
.insp { display: grid; grid-template-columns: 7.5rem 1fr; gap: 1.1rem; align-items: center; padding: 0.9rem; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.pic { border-radius: 18px; overflow: hidden; }
.txt { display: grid; gap: 0.35rem; min-width: 0; }
.txt h2 { font-size: clamp(1.25rem, 2.6vw, 1.7rem); }
.desc { color: var(--muted); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.avail { font-size: 0.82rem; font-weight: 700; color: var(--copper); }
.linkish { justify-self: start; background: none; border: 0; padding: 0; min-height: 44px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font-weight: 600; }
@media (min-width: 640px) { .insp { grid-template-columns: 11rem 1fr; } }
</style>
