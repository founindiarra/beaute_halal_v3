<script setup>
import { computed } from 'vue'

import { FORMULES, REPARATIONS, consultation, estimate, findFormule, findType } from '@/data/tarifs'
import { clearResserrage, setReparation, setResserrage, useBooking } from '@/composables/useBooking'
import { formatPrice } from '@/utils/format'

const { state } = useBooking()
const r = computed(() => state.resserrage)
const type = computed(() => findType(r.value.type))
const formule = computed(() => findFormule(r.value.formule))
const isRepair = computed(() => state.besoin === 'reparation')
const formulesResserrage = computed(() => FORMULES.filter((f) => f.id !== 'reparation'))
/* Réparation : le tarif n'apparaît qu'une fois le niveau choisi. */
const est = computed(() => (type.value && (!isRepair.value || state.reparation) ? estimate({ ...r.value, reparation: state.reparation }) : null))
const money = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatPrice(Math.abs(n))}`
</script>

<template>
  <!-- Réparation : partielle ou globale -->
  <fieldset v-if="isRepair" class="crit">
    <legend>Votre réparation <span class="opt-tag">tarif indicatif</span></legend>
    <p class="q">Quel niveau de réparation ?</p>
    <div class="rep" role="radiogroup" aria-label="Niveau de réparation">
      <button v-for="x in REPARATIONS" :key="x.id" type="button" role="radio" class="bchip repchip" :aria-checked="state.reparation === x.id" @click="setReparation(x.id)">
        <strong>{{ x.name }}</strong>
        <small>{{ x.text }}</small>
      </button>
    </div>
    <div v-if="est" class="estimate" role="status">
      <p class="price">À partir de <strong>{{ formatPrice(est.total) }}</strong></p>
      <p class="hint">{{ consultation.final }}</p>
    </div>
    <p v-else class="hint">Le tarif d’une réparation dépend de l’ampleur des dégâts : il vous est annoncé avant la prestation.</p>
  </fieldset>

  <!-- Resserrage : prestation, délai, état + tarif indicatif -->
  <fieldset v-else class="crit">
    <legend>Votre resserrage <span class="opt-tag">tarif indicatif</span></legend>
    <p class="q">Quelle prestation ?</p>
    <div class="bchips" role="radiogroup" aria-label="Prestation">
      <button v-for="f in formulesResserrage" :key="f.id" type="button" role="radio" class="bchip" :aria-checked="r.formule === f.id" @click="setResserrage({ formule: f.id })">{{ f.short }} <small>{{ f.detail }}</small></button>
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
.rep { display: grid; gap: 0.7rem; }
.repchip { display: grid; gap: 0.3rem; text-align: left; padding: 1rem 1.2rem; }
.repchip small { font-weight: 400; line-height: 1.5; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(4, 1fr); } }
.pick { position: relative; display: grid; align-content: start; justify-items: center; gap: 0.15rem; padding: 0.5rem 0.5rem 0.9rem; font: inherit; text-align: center; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.25s var(--ease); animation: cardIn 0.75s var(--ease) both; }
.pick:nth-child(2) { animation-delay: 70ms; } .pick:nth-child(3) { animation-delay: 140ms; } .pick:nth-child(4) { animation-delay: 210ms; }
.pick:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.pick:focus-visible { outline: 3px solid rgba(229, 197, 107, 0.7); outline-offset: 2px; }
.pick[aria-checked='true'] { border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); background: var(--grad-soft); }
.pick img, .qm { width: 100%; aspect-ratio: 1 / 1.08; object-fit: cover; object-position: 50% 25%; border-radius: 12px; background: var(--peach); }
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
