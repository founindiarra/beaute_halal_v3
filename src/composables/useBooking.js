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
  { id: 2, label: 'Type de locks' },
  { id: 3, label: 'Volume' },
  { id: 4, label: 'Précisions' },
  { id: 5, label: 'Jour et heure' },
  { id: 6, label: 'Vos informations' },
  { id: 7, label: 'Récapitulatif' },
]
export const LAST_STEP = STEPS.length

const emptyResserrage = () => ({ type: '', volume: '', formule: 'complet', delai: 'standard', etat: 'bon' })
const emptyCreation = () => ({ type: '', volume: '', longueur: '' })
const emptyCustomer = () => ({ firstName: '', lastName: '', phone: '', email: '', birthDate: '', desiredDate: '', desiredTime: '', note: '' })

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
  /** Vrai quand le type a été déduit de la coiffure choisie (affiche « choisi automatiquement »). */
  typeFromCoiffure: false,
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
  if (state.customer.desiredDate !== value) state.customer.desiredTime = ''
  state.customer.desiredDate = value
  state.submitError = null
}
export function setDesiredTime(value) {
  state.customer.desiredTime = value
  state.submitError = null
}
/** Le type de locks et le volume sont communs aux deux besoins : on les garde synchronisés. */
export function setType(type) {
  state.typeFromCoiffure = false
  state.creation.type = type
  state.resserrage.type = type
  state.submitError = null
}
export function setVolume(volume) {
  state.creation.volume = volume
  state.resserrage.volume = volume
  state.submitError = null
}
export const currentType = () => state.creation.type || state.resserrage.type
export function setCreation(patch) {
  if ('type' in patch) state.typeFromCoiffure = false
  Object.assign(state.creation, patch)
  state.submitError = null
}
export function clearCreation() {
  Object.assign(state.creation, emptyCreation())
}

export function useBooking() {
  const isStepValid = (step) => {
    if (step === 1) return state.besoin === 'creation' || state.besoin === 'resserrage'
    if (step === 2) return Boolean(currentType())
    if (step === 3 || step === 4) return true
    if (step === 5) return Boolean(state.customer.desiredDate)
    if (step === 6) return Object.keys(validateCustomer(state.customer)).length === 0
    return step === LAST_STEP
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
    if (![1, 2, 5, 6].every(isStepValid)) {
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
      ...(c.desiredTime ? { desiredTime: c.desiredTime } : {}),
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
        desiredTime: state.customer.desiredTime || '',
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
      typeFromCoiffure: false,
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
  /* Chaque coiffure est rangée dans un type de locks depuis le dashboard : ce type est choisi d'office (modifiable). */
  if (item.typeId && findType(item.typeId)) {
    setType(item.typeId)
    state.typeFromCoiffure = true
  }
}

/** Une nouvelle entrée (type ou coiffure) remplace la précédente : jamais deux cartes empilées. */
export function clearTypeChoice() {
  state.typeFromCoiffure = false
  state.besoin = ''
  state.creation = emptyCreation()
  state.resserrage = emptyResserrage()
}

export function clearInspiration() {
  state.inspiration = null
}
