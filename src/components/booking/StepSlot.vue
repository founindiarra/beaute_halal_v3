<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { setConsultation, setDesiredDate as setServiceDate, setDesiredTime, useBooking } from '@/composables/useBooking'
import { creneauxPourProfil } from '@/data/tarifs'
import { fetchAvailabilityDays, fetchAvailabilitySlots } from '@/services/api'
import { capitalize, formatDateLong } from '@/utils/format'

/** `target` : le jour du service (défaut) ou le jour de la consultation en salon. */
const props = defineProps({ target: { type: String, default: 'service' } })
const { state } = useBooking()
const consult = computed(() => props.target === 'consultation')
const c = computed(() => (consult.value ? { desiredDate: state.consultation.date } : state.customer))
const setDesiredDate = (v) => {
  if (consult.value) setConsultation({ date: v, time: '' })
  else setServiceDate(v)
}

const loading = ref(true)
const failed = ref(false)
const days = ref(new Map())
const monthKeys = ref([])
const view = ref(0)

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

/** Calendrier injoignable : pour un service, la cliente choisit quand même dans une grille (jamais un champ à saisir) ; le salon confirme le jour. La consultation garde un simple champ. */
const useLocalCalendar = () => {
  if (consult.value) {
    failed.value = true
    return
  }
  const map = new Map()
  for (let i = 1; i <= 60; i += 1) {
    const key = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10)
    map.set(key, { date: key, bookable: true })
  }
  days.value = map
  monthKeys.value = [...new Set([...map.keys()].map((k) => k.slice(0, 7)))]
  view.value = 0
}

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
    if (!map.size) useLocalCalendar()
  } catch {
    useLocalCalendar()
  } finally {
    loading.value = false
  }
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

const pickDay = (cell) => {
  if (cell?.ok) setDesiredDate(cell.key)
}

/* Consultation en salon : la cliente choisit aussi l'heure parmi les créneaux libres du jour. */
const slots = ref([])
const slotsLoading = ref(false)
const slotsFailed = ref(false)
const timeVal = computed(() => (consult.value ? state.consultation.time : state.customer.desiredTime))
const setTime = (t) => (consult.value ? setConsultation({ time: t }) : setDesiredTime(t))
watch(
  () => c.value.desiredDate,
  async (date) => {
    slots.value = []
    slotsFailed.value = false
    if (!date) return
    slotsLoading.value = true
    try {
      const r = await fetchAvailabilitySlots(date)
      if (date === c.value.desiredDate) {
        const tous = r.slots ?? []
        /* Heures du profil (ancienne / nouvelle cliente, besoin) : seules celles du salon qui correspondent ; sinon toutes les heures libres. */
        const voulues = creneauxPourProfil({ consultation: consult.value, customerKind: state.customerKind, besoin: state.besoin })
        const duProfil = voulues ? tous.filter((x) => voulues.includes(x.time)) : []
        slots.value = (duProfil.length ? duProfil : tous).filter((x) => x.available)
      }
    } catch {
      slotsFailed.value = true
    } finally {
      slotsLoading.value = false
    }
  },
  { immediate: true },
)

const fallbackMin = tomorrow
</script>

<template>
  <fieldset class="crit">
    <legend>{{ consult ? 'Quel jour pour votre consultation ?' : 'Quel jour souhaitez-vous ?' }}</legend>
    <p class="sub">{{ consult ? 'Choisissez le jour de la consultation capillaire en salon. Puis l’heure : vous passez ensuite au paiement et votre consultation est réservée.' : 'Choisissez le jour, puis l’heure qui vous convient parmi les créneaux proposés pour votre profil. Votre rendez-vous est validé dès le paiement de l’avance : l’heure choisie est un engagement.' }}</p>

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
        <p class="legend"><i class="lg" /> jour disponible · les jours grisés sont fermés ou complets</p>
      </div>

      
    </template>

    <!-- Heure de la consultation -->
    <div v-if="c.desiredDate" class="times">
      <p class="chosen" role="status">{{ capitalize(formatDateLong(c.desiredDate)) }}</p>
      <p class="q">À quelle heure ?</p>
      <p v-if="slotsLoading" class="hint" role="status">Chargement des heures…</p>
      <template v-else-if="slotsFailed || failed">
        <label class="q" for="consult-time">Heure souhaitée</label>
        <input id="consult-time" type="time" :value="timeVal" @input="setTime($event.target.value)" />
      </template>
      <p v-else-if="!slots.length" class="hint" role="status">Aucune heure libre ce jour-là : choisissez un autre jour.</p>
      <div v-else class="hours" role="radiogroup" aria-label="Heure du rendez-vous">
        <button v-for="s in slots" :key="s.time" type="button" role="radio" class="hour" :aria-checked="timeVal === s.time" @click="setTime(s.time)">{{ s.time }}</button>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
.cal { display: grid; gap: 0.6rem; width: 100%; min-width: 0; max-width: 26rem; box-sizing: border-box; padding: 1rem; background: #fff; border-radius: 18px; box-shadow: inset 0 0 0 1.5px rgba(50, 24, 15, 0.12); }
.bar { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-display); font-size: 1.3rem; }
.nav { width: 2.6rem; height: 2.6rem; border-radius: 50%; border: 1.5px solid rgba(50, 24, 15, 0.18); background: #fff; font-size: 1.4rem; line-height: 1; cursor: pointer; color: var(--ink); transition: all 0.2s var(--ease); }
.nav:hover:not(:disabled) { border-color: var(--copper); background: var(--grad-soft); }
.nav:disabled { opacity: 0.35; cursor: not-allowed; }
.week, .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.3rem; text-align: center; }
.week { font-size: 0.75rem; font-weight: 700; color: var(--muted); }
.blank { aspect-ratio: 1; }
.day { aspect-ratio: 1; min-width: 0; padding: 0; border: 0; border-radius: 12px; background: var(--grad-soft); font: inherit; font-weight: 700; color: var(--ink); cursor: pointer; transition: all 0.2s var(--ease); }
.day:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow); }
.day:focus-visible { outline: 3px solid rgba(229, 197, 107, 0.7); outline-offset: 1px; }
.day:disabled { background: transparent; color: rgba(50, 24, 15, 0.3); cursor: not-allowed; font-weight: 400; text-decoration: line-through; }
.day.on { background: var(--grad-btn); color: #fff; box-shadow: var(--shadow); }
.legend { overflow-wrap: anywhere; font-size: 0.78rem; color: var(--muted); }
.lg { display: inline-block; width: 0.8rem; height: 0.8rem; margin-right: 0.3rem; vertical-align: -1px; border-radius: 4px; background: var(--grad-soft); box-shadow: inset 0 0 0 1px rgba(50, 24, 15, 0.2); }
.times { display: grid; gap: 0.7rem; }
.hours { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.hour { min-height: 44px; padding: 0.4rem 1rem; font: inherit; font-weight: 700; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.18); border-radius: 12px; cursor: pointer; }
.hour:hover { border-color: var(--copper); }
.hour[aria-checked='true'] { background: var(--grad-btn); color: #fff; border-color: transparent; }
.chosen { font-weight: 600; color: var(--copper); }
@media (max-width: 420px) { .cal { padding: 0.75rem; } .week, .days { gap: 0.2rem; } }
.fallback { display: grid; gap: 0.5rem; justify-items: start; }
.fallback input { min-height: 52px; padding: 0.6rem 1rem; font: inherit; font-weight: 600; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.18); border-radius: 14px; }
</style>
