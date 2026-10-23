<script setup>
import { computed } from 'vue'

import { METHODE_CONSEIL, methodesDuType } from '@/data/methodes'
import { findType } from '@/data/tarifs'
import { setMethode, useBooking } from '@/composables/useBooking'

const { state } = useBooking()
const typeId = computed(() => state.creation.type)
const type = computed(() => findType(typeId.value))
const bloc = computed(() => methodesDuType(typeId.value))
const choisie = computed(() => state.creation.methode)
</script>

<template>
  <fieldset class="crit">
    <legend>
      {{ type ? `Quelle méthode pour vos ${type.name} ?` : 'Quelle méthode de pose souhaitez-vous ?' }}
    </legend>
    <p class="sub">{{ bloc.intro }}</p>

    <div class="grid" role="radiogroup" aria-label="Méthode de pose">
      <button v-for="m in bloc.methodes" :key="m.id" type="button" role="radio" class="pick" :aria-checked="choisie === m.id" @click="setMethode(m.id)">
        <strong>{{ m.label }}</strong>
        <small>{{ m.conseil }}</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
      <button type="button" role="radio" class="pick none" :aria-checked="choisie === METHODE_CONSEIL" @click="setMethode(METHODE_CONSEIL)">
        <strong>Je ne sais pas</strong>
        <small>Le salon me conseille la méthode la mieux adaptée à mes cheveux.</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
    </div>
    <p class="hint">Le salon confirme la méthode avec vous avant la prestation.</p>
  </fieldset>
</template>

<style scoped>
.grid { display: grid; gap: 0.8rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
.pick { position: relative; display: grid; align-content: start; gap: 0.35rem; text-align: left; padding: 1.1rem 3rem 1.1rem 1.3rem; font: inherit; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.25s var(--ease); animation: cardIn 0.75s var(--ease) both; }
.pick:nth-child(2) { animation-delay: 70ms; } .pick:nth-child(3) { animation-delay: 140ms; } .pick:nth-child(4) { animation-delay: 210ms; } .pick:nth-child(5) { animation-delay: 280ms; }
.pick:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.pick:focus-visible { outline: 3px solid rgba(229, 197, 107, 0.7); outline-offset: 2px; }
.pick[aria-checked='true'] { border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); background: var(--grad-soft); }
.pick strong { font-family: var(--font-display); font-size: 1.35rem; line-height: 1.1; }
.pick small { color: var(--muted); font-size: 0.88rem; line-height: 1.45; }
.check { position: absolute; top: 0.9rem; right: 0.9rem; width: 1.6rem; height: 1.6rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; font-weight: 700; color: #fff; background: var(--grad-btn); opacity: 0; transform: scale(0.5); transition: all 0.3s var(--ease); }
.pick[aria-checked='true'] .check { opacity: 1; transform: none; }
</style>
