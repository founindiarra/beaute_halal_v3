<script setup>
import { computed } from 'vue'

import { LOCK_TYPES, LONGUEURS, VOLUMES, consultation, findType, videoAdvice } from '@/data/tarifs'
import DayPicker from '@/components/booking/DayPicker.vue'
import { clearCreation, setCreation, useBooking } from '@/composables/useBooking'

const { state } = useBooking()
const c = computed(() => state.creation)
const type = computed(() => findType(c.value.type))
</script>

<template>
  <fieldset class="crit">
    <legend>Votre création complète <span class="opt">évaluée avec le salon</span></legend>
    <p class="sub">Dites-nous ce que vous imaginez : le salon confirme avec vous le type, le volume et la longueur, puis annonce le tarif avant la prestation.</p>

    <p class="q">1. Quel type de locks souhaitez-vous ?</p>
    <div class="bchips" role="radiogroup" aria-label="Type de locks">
      <button v-for="t in LOCK_TYPES" :key="t.id" type="button" role="radio" class="bchip" :aria-checked="c.type === t.id" @click="setCreation({ type: t.id })">{{ t.name }} <small>{{ t.size }}</small></button>
      <button type="button" role="radio" class="bchip" :aria-checked="c.type === 'inconnu'" @click="setCreation({ type: 'inconnu' })">Je ne sais pas</button>
    </div>
    <p v-if="type" class="hint">{{ type.description }} {{ type.rhythm }}.</p>
    <p v-else-if="c.type === 'inconnu'" class="hint">Pas de souci : le salon vous conseille selon vos cheveux et votre style de vie.</p>

    <template v-if="c.type">
      <p class="q">2. Quel est votre volume de cheveux ?</p>
      <div class="bchips" role="radiogroup" aria-label="Volume">
        <button v-for="v in VOLUMES" :key="v.id" type="button" role="radio" class="bchip vol" :aria-checked="c.volume === v.id" :title="v.hint" @click="setCreation({ volume: v.id })">{{ v.id }}</button>
        <button type="button" role="radio" class="bchip" :aria-checked="c.volume === ''" @click="setCreation({ volume: '' })">À évaluer sur place</button>
      </div>
      <p class="hint">{{ VOLUMES.find((v) => v.id === c.volume)?.hint ?? 'De XS (très peu de cheveux) à XL (volume très important).' }}</p>

      <p class="q">3. Quelle est la longueur de vos cheveux ?</p>
      <div class="bchips" role="radiogroup" aria-label="Longueur">
        <button v-for="l in LONGUEURS" :key="l.label" type="button" role="radio" class="bchip" :aria-checked="c.longueur === l.label" @click="setCreation({ longueur: l.label })">{{ l.label }} <small>{{ l.hint }}</small></button>
        <button type="button" role="radio" class="bchip" :aria-checked="c.longueur === ''" @click="setCreation({ longueur: '' })">À évaluer sur place</button>
      </div>
      <DayPicker :n="4" />
    </template>

    <p class="hint">{{ videoAdvice }}</p>
    <p class="hint">{{ consultation.nouvelle }} · {{ consultation.ancienne }}.</p>
    <button v-if="c.type" type="button" class="linkish" @click="clearCreation">Effacer ce choix</button>
  </fieldset>
</template>

<style scoped>
</style>
