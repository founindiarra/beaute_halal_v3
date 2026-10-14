<script setup>
import { computed, ref, watch } from 'vue'

import DataState from '@/components/ui/DataState.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchAvailabilityDays, fetchAvailabilitySlots } from '@/services/api'
import { fromDateKey, startOfDay, toDateKey } from '@/utils/date'
import { capitalize, formatDateLong } from '@/utils/format'

const props = defineProps({
  serviceId: { type: [Number, String], default: null },
  date: { type: Date, default: null },
  time: { type: String, default: null },
  /** Incrémenté par le parcours quand un créneau a été pris entre-temps. */
  refreshKey: { type: Number, default: 0 },
})
defineEmits(['select-date', 'select-time'])

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const today = startOfDay()
const cursor = ref(new Date((props.date || today).getFullYear(), (props.date || today).getMonth(), 1).getTime())
const cursorDate = computed(() => new Date(cursor.value))

/* Tout vient du serveur : aucun calcul local d'ouverture ni de disponibilité. */
const days = useApiData(() => fetchAvailabilityDays({ serviceId: props.serviceId ?? undefined }), { days: [], windowDays: 60 }, { immediate: false })
const slotsData = useApiData((key) => fetchAvailabilitySlots(key, props.serviceId ?? null), { slots: [], bookable: false }, { immediate: false })

const loadDays = () => days.reload()
const loadSlots = () => props.date && slotsData.reload(toDateKey(props.date))

watch(() => [props.serviceId, props.refreshKey], loadDays, { immediate: true })
watch(() => [props.date?.getTime(), props.serviceId, props.refreshKey], loadSlots, { immediate: true })

const byKey = computed(() => new Map((days.data.value?.days ?? []).map((d) => [d.date, d])))
const lastDay = computed(() => {
  const list = days.data.value?.days ?? []
  return list.length ? fromDateKey(list[list.length - 1].date) : today
})
const hasAnyDay = computed(() => (days.data.value?.days ?? []).some((d) => d.bookable))

const monthLabel = computed(() =>
  capitalize(new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(cursorDate.value)),
)

const cells = computed(() => {
  const c = cursorDate.value
  const first = new Date(c.getFullYear(), c.getMonth(), 1)
  const count = new Date(c.getFullYear(), c.getMonth() + 1, 0).getDate()
  const list = Array.from({ length: (first.getDay() + 6) % 7 }, () => null)
  for (let d = 1; d <= count; d += 1) {
    const date = new Date(c.getFullYear(), c.getMonth(), d)
    const key = toDateKey(date)
    list.push({ date, key, label: d, available: Boolean(byKey.value.get(key)?.bookable) })
  }
  return list
})

const canPrev = computed(() => cursorDate.value > new Date(today.getFullYear(), today.getMonth(), 1))
const canNext = computed(() => cursorDate.value < new Date(lastDay.value.getFullYear(), lastDay.value.getMonth(), 1))
const shift = (n) => (cursor.value = new Date(cursorDate.value.getFullYear(), cursorDate.value.getMonth() + n, 1).getTime())

const selectedKey = computed(() => (props.date ? toDateKey(props.date) : null))
const slots = computed(() => slotsData.data.value?.slots ?? [])
const anySlot = computed(() => slots.value.some((s) => s.available))
</script>

<template>
  <div class="dt">
    <DataState :loading="days.loading.value" :error="days.error.value" loading-label="Chargement des disponibilités…" min-height="18rem" @retry="loadDays">
      <p v-if="!hasAnyDay" class="alert alert-info">Aucune date n’est disponible pour cette prestation pour le moment. Contactez le salon pour convenir d’un créneau.</p>
      <div v-else class="cal">
        <div class="cal-head">
          <button type="button" class="nav" :disabled="!canPrev" aria-label="Mois précédent" @click="shift(-1)"><span aria-hidden="true">←</span></button>
          <h3 aria-live="polite">{{ monthLabel }}</h3>
          <button type="button" class="nav" :disabled="!canNext" aria-label="Mois suivant" @click="shift(1)"><span aria-hidden="true">→</span></button>
        </div>
        <div class="grid" role="grid" :aria-label="`Calendrier — ${monthLabel}`">
          <span v-for="w in WEEKDAYS" :key="w" class="wd" role="columnheader">{{ w }}</span>
          <template v-for="(c, i) in cells" :key="c ? c.key : `e${i}`">
            <span v-if="!c" role="gridcell" />
            <button
              v-else
              type="button"
              role="gridcell"
              class="day"
              :class="{ on: selectedKey === c.key }"
              :disabled="!c.available"
              :aria-pressed="selectedKey === c.key"
              :aria-label="`${formatDateLong(c.date)}${c.available ? '' : ' — indisponible'}`"
              @click="$emit('select-date', c.date)"
            >
              {{ c.label }}
            </button>
          </template>
        </div>
        <p class="legend"><span class="sw" aria-hidden="true" /> Dates disponibles pour la prestation choisie</p>
      </div>
    </DataState>

    <div v-if="date" class="slots" aria-live="polite">
      <h3>Créneaux du {{ formatDateLong(date).toLowerCase() }}</h3>
      <DataState :loading="slotsData.loading.value" :error="slotsData.error.value" loading-label="Chargement des créneaux…" min-height="6rem" @retry="loadSlots">
        <p v-if="!anySlot" class="alert alert-info">Plus aucun créneau ce jour-là. Choisissez une autre date.</p>
        <div v-else class="slot-grid" role="group" aria-label="Créneaux horaires">
          <button
            v-for="s in slots"
            :key="s.time"
            type="button"
            class="slot"
            :class="{ on: time === s.time }"
            :disabled="!s.available"
            :aria-pressed="time === s.time"
            @click="$emit('select-time', s.time)"
          >
            {{ s.time }}
          </button>
        </div>
      </DataState>
    </div>
    <p v-else-if="hasAnyDay && !days.loading.value" class="hint">Choisissez d’abord une date pour voir les créneaux.</p>
  </div>
</template>

<style scoped>
.dt { display: grid; gap: 2rem; }
.cal { max-width: 28rem; }
.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.cal-head h3 { font-size: 1.4rem; }
.nav { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid var(--line-strong); background: #fff; cursor: pointer; font-size: 1.1rem; }
.nav:hover:not(:disabled) { background: var(--grad-btn); color: #fff; border-color: transparent; }
.nav:disabled { opacity: 0.35; cursor: not-allowed; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.wd { text-align: center; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); padding-bottom: 0.4rem; }
.day { aspect-ratio: 1; min-height: 44px; border: 1.5px solid var(--line); border-radius: 50%; background: #fff; font-weight: 600; font-size: 0.98rem; cursor: pointer; transition: all 0.15s; }
.day:hover:not(:disabled) { border-color: var(--copper); color: var(--copper); }
.day:disabled { background: transparent; border-color: transparent; color: rgba(42, 21, 32, 0.32); cursor: not-allowed; font-weight: 400; }
.day.on { background: var(--grad-btn); color: #fff; border-color: transparent; box-shadow: var(--shadow); }
.legend { margin-top: 0.9rem; font-size: 0.85rem; color: var(--muted); display: flex; align-items: center; gap: 0.5rem; }
.sw { width: 14px; height: 14px; background: #fff; border: 1.5px solid var(--line-strong); border-radius: 50%; }
.slots { display: grid; gap: 1rem; }
.slots h3 { font-size: 1.35rem; }
.slot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.slot { min-height: 52px; font-weight: 600; font-size: 1rem; background: #fff; border: 1.5px solid var(--line-strong); border-radius: 999px; cursor: pointer; transition: all 0.2s; }
.slot:hover:not(:disabled) { border-color: var(--copper); color: var(--copper); }
.slot:disabled { color: rgba(42, 21, 32, 0.32); text-decoration: line-through; border-color: var(--line); background: transparent; cursor: not-allowed; }
.slot.on { background: var(--grad-btn); border-color: transparent; color: #fff; }
.hint { color: var(--muted); }
@media (min-width: 640px) { .slot-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1100px) { .dt { grid-template-columns: 28rem 1fr; gap: 3rem; align-items: start; } }
</style>
