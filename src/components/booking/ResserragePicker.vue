<script setup>
import DayPicker from '@/components/booking/DayPicker.vue'
import { computed } from 'vue'

import { FORMULES, LOCK_TYPES, VOLUMES, consultation, estimate, findFormule, findType, videoAdvice } from '@/data/tarifs'
import { clearResserrage, setResserrage, useBooking } from '@/composables/useBooking'
import { formatPrice } from '@/utils/format'

const { state } = useBooking()
const r = computed(() => state.resserrage)
const type = computed(() => findType(r.value.type))
const formule = computed(() => findFormule(r.value.formule))
const isRepair = computed(() => r.value.formule === 'reparation')
const est = computed(() => (type.value ? estimate(r.value) : null))
const money = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatPrice(Math.abs(n))}`
</script>

<template>
  <fieldset class="crit">
    <legend>Votre resserrage <span class="opt">tarif indicatif</span></legend>
    <p class="sub">Notre tarif dépend de trois critères : le type de vos locks, le volume de vos cheveux et le délai depuis votre dernière séance.</p>

    <p class="q">1. Quel est votre type de locks ?</p>
    <div class="bchips" role="radiogroup" aria-label="Type de locks">
      <button v-for="t in LOCK_TYPES" :key="t.id" type="button" role="radio" class="bchip" :aria-checked="r.type === t.id" @click="setResserrage({ type: t.id })">{{ t.name }} <small>{{ t.size }}</small></button>
      <button type="button" role="radio" class="bchip" :aria-checked="r.type === 'inconnu'" @click="setResserrage({ type: 'inconnu' })">Je ne sais pas</button>
    </div>
    <p v-if="type" class="hint">{{ type.size }} · {{ type.rhythm }}</p>
    <p v-else-if="r.type === 'inconnu'" class="hint">Pas de souci : le salon identifie le diamètre de vos locks avec vous. Une courte vidéo suffit.</p>

    <template v-if="r.type">
      <p class="q">2. Quel est votre volume de cheveux ?</p>
      <div class="bchips" role="radiogroup" aria-label="Volume">
        <button v-for="v in VOLUMES" :key="v.id" type="button" role="radio" class="bchip vol" :aria-checked="r.volume === v.id" :title="v.hint" @click="setResserrage({ volume: v.id })">{{ v.id }}</button>
        <button type="button" role="radio" class="bchip" :aria-checked="r.volume === ''" @click="setResserrage({ volume: '' })">À évaluer sur place</button>
      </div>
      <p class="hint">{{ VOLUMES.find((v) => v.id === r.volume)?.hint ?? 'De XS (très peu de cheveux) à XL (volume très important).' }}</p>

      <p class="q">3. Quelle prestation ?</p>
      <div class="bchips" role="radiogroup" aria-label="Prestation">
        <button v-for="f in FORMULES" :key="f.id" type="button" role="radio" class="bchip" :aria-checked="r.formule === f.id" @click="setResserrage({ formule: f.id })">{{ f.short }} <small>{{ f.detail }}</small></button>
      </div>
      <p class="hint">{{ formule?.help }}</p>

      <template v-if="type && !isRepair">
        <p class="q">4. Depuis votre dernière séance</p>
        <div class="bchips" role="radiogroup" aria-label="Délai depuis la dernière séance">
          <button v-for="d in type.delais" :key="d.id" type="button" role="radio" class="bchip" :aria-checked="r.delai === d.id" @click="setResserrage({ delai: d.id })">{{ d.label }} <small v-if="d.detail">{{ d.detail }}</small></button>
        </div>
        <p class="q">5. État de vos locks</p>
        <div class="bchips" role="radiogroup" aria-label="État des locks">
          <button v-for="e in type.etats" :key="e.id" type="button" role="radio" class="bchip" :aria-checked="r.etat === e.id" @click="setResserrage({ etat: e.id })">{{ e.label }} <small>{{ e.detail }}</small></button>
        </div>
      </template>

      <DayPicker :n="isRepair ? 4 : 6" />

      <div v-if="est" class="estimate" role="status">
        <p class="price">{{ est.partial ? 'À partir de' : 'Tarif indicatif' }} <strong>{{ formatPrice(est.total) }}</strong></p>
        <ul v-if="!isRepair" class="lines">
          <li><span>Tarif de base ({{ formule?.short.toLowerCase() }}, {{ r.volume || '—' }})</span><span>{{ formatPrice(est.base) }}</span></li>
          <li v-if="est.delta"><span>Ajustement selon le délai</span><span>{{ money(est.delta) }}</span></li>
          <li v-if="est.majoration"><span>Majoration selon l’état des locks</span><span>{{ money(est.majoration) }}</span></li>
        </ul>
        <p class="hint">{{ consultation.final }}</p>
      </div>
      <p v-else-if="!r.volume && !isRepair" class="hint">Volume à évaluer sur place : le tarif vous est annoncé avant la prestation.</p>
    </template>

    <p class="hint">{{ videoAdvice }}</p>
    <p class="hint">{{ consultation.nouvelle }} · {{ consultation.ancienne }}.</p>
    <button v-if="r.type" type="button" class="linkish" @click="clearResserrage">Effacer ce choix</button>
  </fieldset>
</template>

<style scoped>
.estimate { display: grid; gap: 0.5rem; padding: 1rem 1.2rem; background: #fff; border-radius: 16px; }
.price { font-size: 1.05rem; }
.price strong { color: var(--copper); font-size: 1.5rem; }
.lines { display: grid; gap: 0.2rem; font-size: 0.92rem; }
.lines li { display: flex; justify-content: space-between; gap: 1rem; }
</style>
