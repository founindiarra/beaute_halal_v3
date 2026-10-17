<script setup>
import { computed } from 'vue'

import { setDesiredDate, useBooking } from '@/composables/useBooking'
import { formatDateLong } from '@/utils/format'

/** Le jour souhaité se choisit dans le formulaire de besoin. Pas d'heure : le salon la confirme. */
defineProps({ n: { type: Number, required: true } })
const { state } = useBooking()
const demain = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const label = computed(() => (state.customer.desiredDate ? formatDateLong(state.customer.desiredDate) : ''))
</script>

<template>
  <div class="day">
    <label class="q" for="desired-day">{{ n }}. Quel jour souhaitez-vous venir ?</label>
    <div class="field">
      <input id="desired-day" type="date" :min="demain" :value="state.customer.desiredDate" required @input="setDesiredDate($event.target.value)" />
      <p v-if="label" class="picked">{{ label }}</p>
    </div>
    <p class="hint">Aucune heure à choisir : le salon vous confirme le jour et l’heure par téléphone ou WhatsApp.</p>
  </div>
</template>

<style scoped>
.day { display: grid; gap: 0.5rem; }
.field { display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem 1.2rem; }
input { min-height: 52px; padding: 0.6rem 1rem; font: inherit; font-weight: 600; color: var(--ink); background: #fff; border: 1.5px solid rgba(24, 19, 16, 0.18); border-radius: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
input:focus-visible { outline: none; border-color: var(--copper); box-shadow: 0 0 0 4px rgba(184, 138, 58, 0.22); }
.picked { font-family: var(--font-display); font-size: 1.15rem; color: var(--copper); }
</style>
