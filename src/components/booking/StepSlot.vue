<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { setDesiredDate, setDesiredTime, useBooking } from '@/composables/useBooking'
import { fetchAvailabilityDays, fetchAvailabilitySlots } from '@/services/api'
import { capitalize, formatDateLong } from '@/utils/format'

const { state } = useBooking()
const c = computed(() => state.customer)

const loading = ref(true)
const failed = ref(false)
const days = ref(new Map())
const monthKeys = ref([])
const view = ref(0)

const slotsLoading = ref(false)
const slotsError = ref(false)
const slots = ref([])
const noPreference = ref(false)

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

onMounted(async () => {
  try {
    const data = await fetchAvailabilityDays({})
    const map = new Map()
    for (const d of data.days ?? []) map.set(d.date, d)
    days.value = map
    const keys = [...new Set([...map.keys()].map((k) => k.slice(0, 7)))]
    monthKeys.value = keys
    const chosen = c.value.desiredDate?.slice(0, 7)
    view.value = Math.max(0, keys.indexOf(chosen))
    if (!map.size) failed.value = true
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
  if (c.value.desiredDate) loadSlots(c.value.desiredDate)
})

const monthLabel = computed(() => {
  const k = monthKeys.value[view.value]
  if (!k) return ''
  const [y, m] = k.split('-')
  return capitalize(`${MONTHS[Number(m) - 1]} ${y}`)
})

/** Grille du mois : semaines commençant le lundi, cases vides avant le 1er. */
const cells = computed(() => {
  const k = monthKeys.value[view.value]
  if (!k) return []
  const [y, m] = k.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const out = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= count; d += 1) {
    const key = `${k}-${String(d).padStart(2, '0')}`
    const info = days.value.get(key)
    out.push({ key, d, info, ok: Boolean(info?.bookable) })
  }
  return out
})

async function loadSlots(date) {
  slotsLoading.value = true
  slotsError.value = false
  slots.value = []
  try {
    const data = await fetchAvailabilitySlots(date)
    slots.value = data.slots ?? []
  } catch {
    slotsError.value = true
  } finally {
    slotsLoading.value = false
  }
}

const pickDay = (cell) => {
  if (!cell?.ok) return
  noPreference.value = false
  setDesiredDate(cell.key)
  loadSlots(cell.key)
}
const pickTime = (t) => { noPreference.value = false; setDesiredTime(t) }
const skipTime = () => { noPreference.value = true; setDesiredTime('') }
watch(() => c.value.desiredDate, (v) => { if (!v) { slots.value = []; noPreference.value = false } })

const anyFree = computed(() => slots.value.some((s) => s.available))
const fallbackMin = tomorrow
</script>

<template>
  <fieldset class="crit">
    <legend>Quel jour et à quelle heure ?</legend>
    <p class="sub">Choisissez un jour, puis un créneau parmi ceux encore libres. C’est un souhait : le salon vous confirme le rendez-vous par téléphone ou WhatsApp.</p>

    <p v-if="loading" class="hint" role="status">Chargement des disponibilités…</p>

    <!-- Repli : le calendrier du salon est injoignable → simple choix du jour -->
    <div v-else-if="failed" class="fallback">
      <p class="hint">Les créneaux ne peuvent pas être affichés pour le moment. Indiquez le jour souhaité : le salon vous proposera une heure.</p>
      <label class="q" for="desired-day">Jour souhaité</label>
      <input id="desired-day" type="date" :min="fallbackMin" :value="c.desiredDate" @input="setDesiredDate($event.target.value)" />
    </div>

    <template v-else>
      <div class="cal" role="group" aria-label="Calendrier">
        <div class="bar">
          <button type="button" class="nav" aria-label="Mois précédent" :disabled="view === 0" @click="view -= 1">‹</button>
          <strong>{{ monthLabel }}</strong>
          <button type="button" class="nav" aria-label="Mois suivant" :disabled="view >= monthKeys.length - 1" @click="view += 1">›</button>
        </div>
        <div class="week" aria-hidden="true"><span v-for="(w, i) in WEEK" :key="i">{{ w }}</span></div>
        <div class="days">
          <template v-for="(cell, i) in cells" :key="i">
            <span v-if="!cell" class="blank" />
            <button v-else type="button" class="day" :class="{ on: c.desiredDate === cell.key }" :disabled="!cell.ok" :aria-pressed="c.desiredDate === cell.key" :aria-label="`${formatDateLong(cell.key)}${cell.ok ? '' : ' — indisponible'}`" @click="pickDay(cell)">{{ cell.d }}</button>
          </template>
        </div>
        <p class="legend"><i class="lg" /> jour avec des créneaux libres · les jours grisés sont fermés ou complets</p>
      </div>

      <div v-if="c.desiredDate" class="slots">
        <p class="q">{{ capitalize(formatDateLong(c.desiredDate)) }} · choisissez un créneau</p>
        <p v-if="slotsLoading" class="hint" role="status">Chargement des créneaux…</p>
        <p v-else-if="slotsError" class="hint">Les créneaux ne sont pas disponibles : vous pouvez continuer, le salon vous proposera une heure.</p>
        <template v-else>
          <div class="times" role="radiogroup" aria-label="Créneaux horaires">
            <button v-for="s in slots" :key="s.time" type="button" role="radio" class="bchip time" :aria-checked="c.desiredTime === s.time" :disabled="!s.available" @click="pickTime(s.time)">{{ s.time }}</button>
          </div>
          <p v-if="!anyFree" class="hint">Plus aucun créneau ce jour-là : choisissez un autre jour.</p>
          <button type="button" class="bchip" role="radio" :aria-checked="noPreference" @click="skipTime">Pas de préférence d’heure</button>
        </template>
      </div>
    </template>
  </fieldset>
</template>

<style scoped>
.cal { display: grid; gap: 0.6rem; max-width: 26rem; padding: 1rem; background: #fff; border-radius: 18px; box-shadow: inset 0 0 0 1.5px rgba(87, 42, 19, 0.12); }
.bar { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-display); font-size: 1.3rem; }
.nav { width: 2.6rem; height: 2.6rem; border-radius: 50%; border: 1.5px solid rgba(87, 42, 19, 0.18); background: #fff; font-size: 1.4rem; line-height: 1; cursor: pointer; color: var(--ink); transition: all 0.2s var(--ease); }
.nav:hover:not(:disabled) { border-color: var(--copper); background: var(--grad-soft); }
.nav:disabled { opacity: 0.35; cursor: not-allowed; }
.week, .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.3rem; text-align: center; }
.week { font-size: 0.75rem; font-weight: 700; color: var(--muted); }
.blank { aspect-ratio: 1; }
.day { aspect-ratio: 1; min-height: 40px; border: 0; border-radius: 12px; background: var(--grad-soft); font: inherit; font-weight: 700; color: var(--ink); cursor: pointer; transition: all 0.2s var(--ease); }
.day:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow); }
.day:focus-visible { outline: 3px solid rgba(203, 172, 129, 0.7); outline-offset: 1px; }
.day:disabled { background: transparent; color: rgba(87, 42, 19, 0.3); cursor: not-allowed; font-weight: 400; text-decoration: line-through; }
.day.on { background: var(--grad-btn); color: #fff; box-shadow: var(--shadow); }
.legend { font-size: 0.78rem; color: var(--muted); }
.lg { display: inline-block; width: 0.8rem; height: 0.8rem; margin-right: 0.3rem; vertical-align: -1px; border-radius: 4px; background: var(--grad-soft); box-shadow: inset 0 0 0 1px rgba(87, 42, 19, 0.2); }
.slots { display: grid; gap: 0.7rem; justify-items: start; }
.times { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.time { min-width: 5.2rem; justify-content: center; font-family: var(--font-display); font-size: 1.15rem; }
.time[aria-checked='true'] { color: #fff; }
.time:disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
.fallback { display: grid; gap: 0.5rem; justify-items: start; }
.fallback input { min-height: 52px; padding: 0.6rem 1rem; font: inherit; font-weight: 600; color: var(--ink); background: #fff; border: 1.5px solid rgba(87, 42, 19, 0.18); border-radius: 14px; }
</style>
