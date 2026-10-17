<script setup>
import ApiImage from '@/components/ui/ApiImage.vue'
import { PRESTATIONS } from '@/data/tarifs'

/** La coiffure choisie dans « Nos coiffures » accompagne la demande jusqu'au salon. */
defineProps({ inspiration: { type: Object, required: true } })
defineEmits(['clear'])
</script>

<template>
  <aside class="insp" aria-label="Coiffure choisie">
    <ApiImage :src="inspiration.imageUrl" :alt="inspiration.title" ratio="4 / 3" class="pic" />
    <div class="txt">
      <p class="eyebrow">Votre choix</p>
      <h2>{{ inspiration.title }}</h2>
      <p v-if="inspiration.description" class="desc">{{ inspiration.description }}</p>
      <p class="avail">Prestations : <span v-for="(p, i) in PRESTATIONS" :key="p.id">{{ p.name }}<template v-if="i < PRESTATIONS.length - 1"> · </template></span></p>
      <button type="button" class="linkish" @click="$emit('clear')">Retirer cette coiffure</button>
    </div>
  </aside>
</template>

<style scoped>
/* Même gabarit que la carte du type de locks : une seule grande carte, jamais deux empilées. */
.insp { display: grid; overflow: hidden; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lift); }
.pic { min-height: 15rem; }
.pic :deep(img), .pic :deep(div) { height: 100%; }
.txt { display: grid; gap: 0.55rem; align-content: center; min-width: 0; padding: clamp(1.4rem, 3.5vw, 2.4rem); }
.txt h2 { font-size: clamp(1.9rem, 4vw, 2.8rem); line-height: 1.05; }
.desc { color: var(--muted); font-size: 1.02rem; max-width: 44ch; }
.avail { font-size: 0.9rem; font-weight: 700; color: var(--copper); }
.linkish { justify-self: start; background: none; border: 0; padding: 0; min-height: 44px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font-weight: 600; }
@media (min-width: 720px) { .insp { grid-template-columns: minmax(16rem, 2fr) 3fr; min-height: 22rem; } .pic { min-height: 100%; } }
</style>
