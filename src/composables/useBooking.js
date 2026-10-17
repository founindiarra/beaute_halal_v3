import { computed, reactive } from 'vue'

import { buildRequestMessage, findType } from '@/data/tarifs'
import { createBookingRequest, sendContactMessage } from '@/services/api'

/**
 * Nouvelle logique : pas de créneau horaire. La cliente choisit d'abord « création complète » ou « resserrage »,
 * renseigne les critères correspondants, ses coordonnées et un jour souhaité ; le salon confirme ensuite le jour
 * et l'heure par téléphone ou WhatsApp.
 */
export const STEPS = [
  { id: 1, label: 'Votre besoin' },
  { id: 2, label: 'Vos informations' },
  { id: 3, label: 'Récapitulatif' },
]

const emptyResserrage = () => ({ type: '', volume: '', formule: 'complet', delai: 'standard', etat: 'bon' })
const emptyCreation = () => ({ type: '', volume: '', longueur: '' })
const emptyCustomer = () => ({ firstName: '', lastName: '', phone: '', email: '', birthDate: '', desiredDate: '', note: '' })

export const validateCustomer = (c) => {
  const errors = {}
  if (c.firstName.trim().length < 2) errors.firstName = 'Indiquez votre prénom.'
  if (c.lastName.trim().length < 2) errors.lastName = 'Indiquez votre nom.'
  if (c.phone.replace(/\D/g, '').length < 8) errors.phone = 'Indiquez un numéro de téléphone valide (8 chiffres minimum).'
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) errors.email = 'Indiquez une adresse e-mail valide.'
  return errors
}

/** État partagé du parcours (niveau module). Les coordonnées ne sont jamais écrites dans le stockage du navigateur. */
const state = reactive({
  step: 1,
  /** '' | 'creation' | 'resserrage' */
  besoin: '',
  resserrage: emptyResserrage(),
  creation: emptyCreation(),
  customer: emptyCustomer(),
  inspiration: null,
  confirmation: null,
  submitting: false,
  submitError: null,
})

export function setBesoin(besoin) {
  state.besoin = besoin
  state.submitError = null
}
export function setResserrage(patch) {
  Object.assign(state.resserrage, patch)
  state.submitError = null
}
export function clearResserrage() {
  Object.assign(state.resserrage, emptyResserrage())
}
export function setDesiredDate(value) {
  state.customer.desiredDate = value
  state.submitError = null
}
export function setCreation(patch) {
  Object.assign(state.creation, patch)
  state.submitError = null
}
export function clearCreation() {
  Object.assign(state.creation, emptyCreation())
}

export function useBooking() {
  const isStepValid = (step) => {
    if (step === 1) {
      if (!state.customer.desiredDate) return false
      if (state.besoin === 'creation') return Boolean(state.creation.type)
      if (state.besoin === 'resserrage') return Boolean(state.resserrage.type)
      return false
    }
    if (step === 2) return Object.keys(validateCustomer(state.customer)).length === 0
    return step === 3
  }

  const maxReachedStep = computed(() => {
    let s = 1
    while (s < STEPS.length && isStepValid(s)) s += 1
    return s
  })

  const goToStep = (step) => {
    if (step < 1 || step > STEPS.length || step > maxReachedStep.value) return
    state.step = step
  }
  const next = () => {
    if (isStepValid(state.step) && state.step < STEPS.length) state.step += 1
  }
  const previous = () => {
    if (state.step > 1) state.step -= 1
  }

  /** Envoie la demande au salon (POST /contact, route réelle du backend commun) ; ne simule jamais un succès. */
  const confirmBooking = async () => {
    if (state.submitting) return { ok: false }
    if (!isStepValid(1) || !isStepValid(2)) {
      state.submitError = 'Votre demande est incomplète.'
      return { ok: false }
    }
    state.submitting = true
    state.submitError = null
    const message = buildRequestMessage(state)
    const c = state.customer
    const isCreation = state.besoin === 'creation'
    const r = isCreation ? state.creation : state.resserrage
    const payload = {
      besoin: state.besoin,
      type: r.type,
      volume: r.volume || '',
      ...(isCreation ? { longueur: r.longueur || '' } : { formule: r.formule, delai: r.delai, etat: r.etat }),
      desiredDate: c.desiredDate,
      inspiration: state.inspiration?.title
        ? { id: Number(state.inspiration.id) || null, title: state.inspiration.title }
        : null,
      firstName: c.firstName.trim(),
      lastName: c.lastName.trim(),
      phone: c.phone.trim(),
      email: c.email.trim(),
      birthDate: c.birthDate || null,
      note: c.note?.trim() || null,
    }
    try {
      let reference = null
      try {
        reference = (await createBookingRequest(payload))?.reference ?? null
      } catch (error) {
        /* Serveur plus ancien (route absente) : la demande part comme un message de contact. */
        if (error?.status !== 404) throw error
        await sendContactMessage({
          name: `${c.firstName.trim()} ${c.lastName.trim()}`,
          email: c.email,
          phone: c.phone,
          message,
        })
      }
      state.confirmation = {
        reference,
        firstName: state.customer.firstName.trim(),
        besoin: state.besoin,
        message,
        desiredDate: state.customer.desiredDate,
        type: findType(state.besoin === 'creation' ? state.creation.type : state.resserrage.type)?.name ?? null,
      }
      return { ok: true }
    } catch (error) {
      state.submitError = error?.message || 'La demande n’a pas pu être envoyée.'
      return { ok: false }
    } finally {
      state.submitting = false
    }
  }

  const reset = () => {
    Object.assign(state, {
      step: 1,
      besoin: '',
      resserrage: emptyResserrage(),
      creation: emptyCreation(),
      customer: emptyCustomer(),
      inspiration: null,
      confirmation: null,
      submitting: false,
      submitError: null,
    })
  }

  return { state, steps: STEPS, isStepValid, maxReachedStep, goToStep, next, previous, confirmBooking, reset }
}

/** Départ depuis une coiffure : la coiffure accompagne la demande jusqu'au salon. */
export function preselectFromGallery(item) {
  if (!item) return
  state.confirmation = null
  state.submitError = null
  state.step = 1
  clearTypeChoice()
  state.inspiration = { id: item.id, title: item.title, description: item.description ?? '', imageUrl: item.imageUrl }
}

/** Une nouvelle entrée (type ou coiffure) remplace la précédente : jamais deux cartes empilées. */
export function clearTypeChoice() {
  state.besoin = ''
  state.creation = emptyCreation()
  state.resserrage = emptyResserrage()
}

export function clearInspiration() {
  state.inspiration = null
}
