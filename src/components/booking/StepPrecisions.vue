<script setup>
import { computed, ref } from 'vue'

import { FORMULES, LONGUEURS, consultation, estimate, findFormule, findType, longueurImage } from '@/data/tarifs'
import { clearCreation, clearResserrage, setCreation, setResserrage, useBooking } from '@/composables/useBooking'
import { formatPrice } from '@/utils/format'

const { state } = useBooking()
const isCreation = computed(() => state.besoin === 'creation')
const skipLong = ref(false)
const c = computed(() => state.creation)
const r = computed(() => state.resserrage)
const type = computed(() => findType(r.value.type))
const formule = computed(() => findFormule(r.value.formule))
const isRepair = computed(() => r.value.formule === 'reparation')
const est = computed(() => (type.value ? estimate(r.value) : null))
const money = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatPrice(Math.abs(n))}`
</script>

<template>
  <!-- Création : la longueur, en images -->
  <fieldset v-if="isCreation" class="crit">
    <legend>Quelle est la longueur de vos cheveux ?</legend>
    <p class="sub">Choisissez l’image qui correspond à votre longueur actuelle.</p>
    <div class="grid" role="radiogroup" aria-label="Longueur">
      <button v-for="l in LONGUEURS" :key="l.label" type="button" role="radio" class="pick" :aria-checked="c.longueur === l.label" @click="skipLong = false; setCreation({ longueur: l.label })">
        <img :src="longueurImage(l.label)" alt="" loading="lazy" />
        <strong>{{ l.label }}</strong>
        <small>{{ l.hint }}</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
      <button type="button" role="radio" class="pick none" :aria-checked="skipLong" @click="skipLong = true; setCreation({ longueur: '' })">
        <span class="qm" aria-hidden="true">?</span>
        <strong>Je ne sais pas</strong>
        <small>À évaluer sur place</small>
        <span class="check" aria-hidden="true">✓</span>
      </button>
    </div>
    <button v-if="c.longueur" type="button" class="linkish" @click="clearCreation()">Effacer ce choix</button>
  </fieldset>

  <!-- Resserrage : prestation, délai, état + tarif indicatif -->
  <fieldset v-else class="crit">
    <legend>Votre resserrage <span class="opt-tag">tarif indicatif</span></legend>
    <p class="q">Quelle prestation ?</p>
    <div class="bchips" role="radiogroup" aria-label="Prestation">
      <button v-for="f in FORMULES" :key="f.id" type="button" role="radio" class="bchip" :aria-checked="r.formule === f.id" @click="setResserrage({ formule: f.id })">{{ f.short }} <small>{{ f.detail }}</small></button>
    </div>
    <p class="hint">{{ formule?.help }}</p>

    <template v-if="type && !isRepair">
      <p class="q">Depuis votre dernière séance</p>
      <div class="bchips" role="radiogroup" aria-label="Délai depuis la dernière séance">
        <button v-for="d in type.delais" :key="d.id" type="button" role="radio" class="bchip" :aria-checked="r.delai === d.id" @click="setResserrage({ delai: d.id })">{{ d.label }} <small v-if="d.detail">{{ d.detail }}</small></button>
      </div>
      <p class="q">État de vos locks</p>
      <div class="bchips" role="radiogroup" aria-label="État des locks">
        <button v-for="e in type.etats" :key="e.id" type="button" role="radio" class="bchip" :aria-checked="r.etat === e.id" @click="setResserrage({ etat: e.id })">{{ e.label }} <small>{{ e.detail }}</small></button>
      </div>
    </template>

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
    <button type="button" class="linkish" @click="clearResserrage()">Effacer ces choix</button>
  </fieldset>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(4, 1fr); } }
.pick { position: relative; display: grid; align-content: start; justify-items: center; gap: 0.15rem; padding: 0.5rem 0.5rem 0.9rem; font: inherit; text-align: center; color: var(--ink); background: #fff; border: 1.5px solid rgba(87, 42, 19, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.25s var(--ease); animation: cardIn 0.75s var(--ease) both; }
.pick:nth-child(2) { animation-delay: 70ms; } .pick:nth-child(3) { animation-delay: 140ms; } .pick:nth-child(4) { animation-delay: 210ms; }
.pick:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.pick:focus-visible { outline: 3px solid rgba(203, 172, 129, 0.7); outline-offset: 2px; }
.pick[aria-checked='true'] { border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); background: var(--grad-soft); }
.pick img, .qm { width: 100%; aspect-ratio: 1 / 1.08; object-fit: cover; border-radius: 12px; background: var(--peach); }
.qm { display: grid; place-items: center; font-family: var(--font-display); font-size: 3.4rem; color: var(--copper); }
.pick strong { margin-top: 0.4rem; font-family: var(--font-display); font-size: 1.4rem; line-height: 1; }
.pick small { color: var(--muted); font-size: 0.8rem; }
.check { position: absolute; top: 0.9rem; right: 0.9rem; width: 1.6rem; height: 1.6rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; font-weight: 700; color: #fff; background: var(--grad-btn); opacity: 0; transform: scale(0.5); transition: all 0.3s var(--ease); }
.pick[aria-checked='true'] .check { opacity: 1; transform: none; }
.opt-tag { margin-left: 0.5rem; font-family: var(--font-body, inherit); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--copper); }
.estimate { display: grid; gap: 0.5rem; padding: 1rem 1.2rem; background: #fff; border-radius: 16px; }
.price { font-size: 1.05rem; }
.price strong { color: var(--copper); font-size: 1.5rem; }
.lines { display: grid; gap: 0.2rem; font-size: 0.92rem; }
.lines li { display: flex; justify-content: space-between; gap: 1rem; }
</style>
