<script setup>
import { computed, ref } from 'vue'

import { VOLUMES, volumeImage } from '@/data/tarifs'
import { setVolume, useBooking } from '@/composables/useBooking'

const { state } = useBooking()
const volume = computed(() => state.creation.volume)
const skipped = ref(false)
const hint = computed(() => VOLUMES.find((v) => v.id === volume.value)?.hint)
</script>

<template>
  <fieldset class="crit">
    <legend>Quel est votre volume de cheveux ?</legend>
    <p class="sub">Choisissez l’image qui ressemble le plus à votre chevelure. Le salon confirme avec vous sur place.</p>
    <div class="grid" role="radiogroup" aria-label="Volume de cheveux">
      <button v-for="v in VOLUMES" :key="v.id" type="button" role="radio" class="pick" :aria-checked="volume === v.id" @click="skipped = false; setVolume(v.id)">
        <img :src="volumeImage(v.id)" :alt="''" loading="lazy" />
        <strong>{{ v.id }}</strong>
        <small>{{ v.label }}</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
      <button type="button" role="radio" class="pick none" :aria-checked="skipped" @click="skipped = true; setVolume('')">
        <span class="qm" aria-hidden="true">?</span>
        <strong>Je ne sais pas</strong>
        <small>À évaluer sur place</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
    </div>
    <p class="hint">{{ hint ?? 'De XS (très peu de cheveux) à XL (volume très important).' }}</p>
  </fieldset>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); } }
.pick { position: relative; display: grid; align-content: start; justify-items: center; gap: 0.15rem; padding: 0.5rem 0.5rem 0.9rem; font: inherit; text-align: center; color: var(--ink); background: #fff; border: 1.5px solid rgba(87, 42, 19, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.25s var(--ease); animation: cardIn 0.75s var(--ease) both; }
.pick:nth-child(2) { animation-delay: 70ms; } .pick:nth-child(3) { animation-delay: 140ms; } .pick:nth-child(4) { animation-delay: 210ms; } .pick:nth-child(5) { animation-delay: 280ms; } .pick:nth-child(6) { animation-delay: 340ms; }
.pick:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.pick:focus-visible { outline: 3px solid rgba(203, 172, 129, 0.7); outline-offset: 2px; }
.pick[aria-checked='true'] { border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); background: var(--grad-soft); }
.pick img, .qm { width: 100%; aspect-ratio: 1 / 1.05; object-fit: cover; border-radius: 12px; background: var(--peach); }
.qm { display: grid; place-items: center; font-family: var(--font-display); font-size: 3.4rem; color: var(--copper); }
.pick strong { margin-top: 0.4rem; font-family: var(--font-display); font-size: 1.5rem; line-height: 1; }
.pick small { color: var(--muted); font-size: 0.8rem; }
.check { position: absolute; top: 0.9rem; right: 0.9rem; width: 1.6rem; height: 1.6rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; font-weight: 700; color: #fff; background: var(--grad-btn); opacity: 0; transform: scale(0.5); transition: all 0.3s var(--ease); }
.pick[aria-checked='true'] .check { opacity: 1; transform: none; }
</style>
