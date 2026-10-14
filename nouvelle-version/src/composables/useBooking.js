import { computed, reactive } from 'vue'

import { createAppointment } from '@/services/api'
import { toDateKey } from '@/utils/date'

/** Étapes : la date et le créneau forment un seul écran, l'API n'en demande pas plus. */
export const STEPS = [
  { id: 1, label: 'Prestation' },
  { id: 2, label: 'Date et heure' },
  { id: 3, label: 'Vos informations' },
  { id: 4, label: 'Récapitulatif' },
]

const emptyCustomer = () => ({ firstName: '', lastName: '', phone: '', email: '', note: '' })

export const validateCustomer = (c) => {
  const errors = {}
  if (c.firstName.trim().length < 2) errors.firstName = 'Indiquez votre prénom.'
  if (c.lastName.trim().length < 2) errors.lastName = 'Indiquez votre nom.'
  if (c.phone.replace(/\D/g, '').length < 8) errors.phone = 'Indiquez un numéro de téléphone valide (8 chiffres minimum).'
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) errors.email = 'Indiquez une adresse e-mail valide.'
  return errors
}

/**
 * État partagé du parcours (niveau module) : une carte « Réserver » peut
 * présélectionner la prestation avant l'arrivée sur /rendez-vous, et les choix
 * survivent à un aller-retour dans la navigation.
 * Les coordonnées ne sont jamais écrites dans le stockage du navigateur.
 */
const state = reactive({
  step: 1,
  service: null,
  date: null, // Date
  time: null, // « HH:MM »
  customer: emptyCustomer(),
  inspiration: null,
  confirmation: null,
  submitting: false,
  submitError: null,
  /** Incrémenté pour recharger les disponibilités après un conflit de créneau. */
  availabilityVersion: 0,
})

const MENTION = /Coiffure souhaitée : «[^»]*».*?(\n|$)/g

export function useBooking() {
  const dateKey = computed(() => (state.date ? toDateKey(state.date) : null))

  const isStepValid = (step) => {
    if (step === 1) return Boolean(state.service)
    if (step === 2) return Boolean(state.date && state.time)
    if (step === 3) return Object.keys(validateCustomer(state.customer)).length === 0
    return step === 4
  }

  const maxReachedStep = computed(() => {
    let s = 1
    while (s < STEPS.length && isStepValid(s)) s += 1
    return s
  })

  const selectService = (service) => {
    if (state.service?.slug !== service?.slug) {
      state.service = service
      state.date = null
      state.time = null
    }
    state.submitError = null
  }
  const selectDate = (date) => {
    state.date = date
    state.time = null
    state.submitError = null
  }
  const selectTime = (time) => {
    state.time = time
    state.submitError = null
  }
  const goToStep = (step) => {
    if (step < 1 || step > STEPS.length) return
    if (step > maxReachedStep.value) return
    state.step = step
  }
  const next = () => {
    if (isStepValid(state.step) && state.step < STEPS.length) state.step += 1
  }
  const previous = () => {
    if (state.step > 1) state.step -= 1
  }

  /** Envoie la demande ; ne simule jamais un succès. Renvoie { ok, conflict }. */
  const confirmBooking = async () => {
    if (state.submitting) return { ok: false, conflict: false }
    if (!state.service || !state.date || !state.time) {
      state.submitError = 'Votre sélection est incomplète.'
      return { ok: false, conflict: false }
    }
    state.submitting = true
    state.submitError = null
    try {
      state.confirmation = await createAppointment({
        serviceSlug: state.service.slug,
        date: toDateKey(state.date),
        time: state.time,
        ...state.customer,
      })
      return { ok: true, conflict: false }
    } catch (error) {
      state.submitError = error?.message || 'La demande n’a pas pu être enregistrée.'
      if (error?.isConflict) {
        state.time = null
        state.step = 2
        state.availabilityVersion += 1
        return { ok: false, conflict: true }
      }
      return { ok: false, conflict: false }
    } finally {
      state.submitting = false
    }
  }

  const reset = () => {
    Object.assign(state, {
      step: 1,
      service: null,
      date: null,
      time: null,
      customer: emptyCustomer(),
      inspiration: null,
      confirmation: null,
      submitting: false,
      submitError: null,
    })
  }

  return { state, steps: STEPS, dateKey, isStepValid, maxReachedStep, selectService, selectDate, selectTime, goToStep, next, previous, confirmBooking, reset }
}

export function preselectService(service) {
  state.service = service ?? null
  state.date = null
  state.time = null
  state.confirmation = null
  state.submitError = null
  state.inspiration = null
  state.step = service ? 2 : 1
}

/** Départ depuis une coiffure : le titre suit la demande jusqu'au salon via le commentaire. */
export function preselectFromGallery(item) {
  if (!item) return
  state.service = item.service ?? null
  state.date = null
  state.time = null
  state.confirmation = null
  state.submitError = null
  state.inspiration = {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    category: item.category ?? null,
    service: item.service ?? null,
  }
  state.step = item.service ? 2 : 1
  const mention = `Coiffure souhaitée : « ${item.title} » (vue dans Nos coiffures).`
  const rest = state.customer.note.replace(MENTION, '').trim()
  state.customer.note = rest ? `${mention}\n${rest}` : mention
}

export function clearInspiration() {
  state.inspiration = null
  state.customer.note = state.customer.note.replace(MENTION, '').trim()
}
