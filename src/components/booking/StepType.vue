<script setup>
import { computed } from 'vue'

import { typeImages } from '@/data/heroImages'
import { LOCK_TYPES, TAILLES_AIDE, findType } from '@/data/tarifs'
import { setType, useBooking } from '@/composables/useBooking'

const { state } = useBooking()
const chosen = computed(() => state.creation.type || state.resserrage.type)
const type = computed(() => findType(chosen.value))
const isCreation = computed(() => state.besoin === 'creation')
</script>

<template>
  <fieldset class="crit">
    <legend>{{ isCreation ? 'Quel type de locks souhaitez-vous ?' : 'Quel est votre type de locks ?' }}</legend>
    <p v-if="state.typeFromCoiffure && type" class="auto" role="status">
      <span class="tick" aria-hidden="true">✓</span>
      <span>Choisi automatiquement : la coiffure « {{ state.inspiration?.title }} » se fait en <strong>{{ type.name }}</strong>. Vous pouvez changer si vous le souhaitez.</span>
    </p>
    <p v-else class="sub">{{ isCreation ? 'Le diamètre des locks change le rendu, le temps de travail et le rythme des resserrages.' : 'Le tarif dépend du diamètre de vos locks. Une courte vidéo suffit pour le confirmer.' }}</p>

    <div class="types" role="radiogroup" aria-label="Type de locks">
      <button v-for="t in LOCK_TYPES" :key="t.id" type="button" role="radio" class="typ" :aria-checked="chosen === t.id" @click="setType(t.id)">
        <span class="ph" :style="typeImages[t.id] ? { backgroundImage: `url(${typeImages[t.id]})` } : null" aria-hidden="true" />
        <span class="tx"><strong>{{ t.name }}</strong><small>{{ t.size }} · {{ t.rhythm }}</small></span>
        <span class="check" aria-hidden="true">✓</span>
      </button>
      <button type="button" role="radio" class="typ unknown" :aria-checked="chosen === 'inconnu'" @click="setType('inconnu')">
        <span class="ph q" aria-hidden="true">?</span>
        <span class="tx"><strong>Je ne sais pas</strong><small>Le salon vous conseille</small></span>
        <span class="check" aria-hidden="true">✓</span>
      </button>
    </div>
    <details class="aide">
      <summary>{{ TAILLES_AIDE.title }}</summary>
      <ul><li v-for="(l, i) in TAILLES_AIDE.lines" :key="i">{{ l }}</li></ul>
    </details>
    <p v-if="type" class="hint">{{ type.description }}</p>
    <p v-else-if="chosen === 'inconnu'" class="hint">Pas de souci : le salon vous conseille selon vos cheveux et votre style de vie.</p>
  </fieldset>
</template>

<style scoped>
.aide { padding: 0.9rem 1.1rem; background: var(--grad-soft); border-radius: 14px; }
.aide summary { cursor: pointer; font-weight: 700; color: var(--copper); min-height: 32px; }
.aide ul { margin: 0.6rem 0 0; padding-left: 1.2rem; display: grid; gap: 0.35rem; line-height: 1.5; }
.types { display: grid; gap: 0.8rem; }
@media (min-width: 640px) { .types { grid-template-columns: repeat(2, 1fr); } }
.typ { position: relative; display: grid; grid-template-columns: 5.2rem 1fr; align-items: center; gap: 1rem; text-align: left; padding: 0.7rem 1rem 0.7rem 0.7rem; font: inherit; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.25s var(--ease); animation: cardIn 0.75s var(--ease) both; }
.typ:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.typ:focus-visible { outline: 3px solid rgba(229, 197, 107, 0.7); outline-offset: 2px; }
.typ[aria-checked='true'] { border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); background: var(--grad-soft); }
.ph { width: 5.2rem; height: 5.2rem; border-radius: 14px; background: var(--peach) center / cover no-repeat; display: grid; place-items: center; font-family: var(--font-display); font-size: 2rem; color: var(--copper); }
.tx { display: grid; gap: 0.15rem; min-width: 0; }
.tx strong { font-family: var(--font-display); font-size: 1.3rem; line-height: 1.1; }
.tx small { color: var(--muted); font-size: 0.82rem; }
.check { position: absolute; top: 0.6rem; right: 0.7rem; width: 1.5rem; height: 1.5rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.8rem; font-weight: 700; color: #fff; background: var(--grad-btn); opacity: 0; transform: scale(0.5); transition: all 0.3s var(--ease); }
.typ[aria-checked='true'] .check { opacity: 1; transform: none; }
.auto { display: flex; gap: 0.7rem; align-items: flex-start; padding: 0.8rem 1rem; font-size: 0.95rem; background: var(--grad-soft); border-radius: 14px; }
.tick { flex: none; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.8rem; font-weight: 700; color: #fff; background: var(--grad-btn); }
</style>
