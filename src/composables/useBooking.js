import { computed, reactive } from 'vue'

import { METHODE_CONSEIL, methodesDuType } from '@/data/methodes'
import { buildRequestMessage, findType, resolveType } from '@/data/tarifs'
import { createBookingRequest, sendContactMessage } from '@/services/api'

/**
 * Nouvelle logique : pas de créneau horaire. La cliente choisit d'abord « création complète » ou « resserrage »,
 * renseigne les critères correspondants, ses coordonnées et un jour souhaité ; le salon confirme ensuite le jour
 * et l'heure par téléphone ou WhatsApp.
 */
export const ALL_STEPS = [
  { id: 'profil', label: 'Votre profil' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'besoin', label: 'Votre besoin' },
  { id: 'type', label: 'Type de locks' },
  { id: 'methode', label: 'Méthode' },
  { id: 'volume', label: 'Volume' },
  { id: 'longueur', label: 'Longueur' },
  { id: 'precisions', label: 'Resserrage' },
  { id: 'jour', label: 'Jour' },
  { id: 'recap', label: 'Récapitulatif' },
]
/** Un type choisi depuis l'accueil ou les services ne repose pas la question : l'étape « Type de locks » est sautée. */
/** Les réglages du resserrage (prestation, délai, état) n'existent que pour un resserrage. */
export const stepsFor = (typeLocked, besoin = '', consultationSeule = false) => {
  /* Consultation prise en rendez-vous : le parcours s'arrête après le choix du jour et de l'heure → paiement. */
  if (consultationSeule) return ALL_STEPS.filter((s) => s.id === 'profil' || s.id === 'consultation')
  const adaptation = besoin === 'resserrage' || besoin === 'reparation'
  return ALL_STEPS.filter(
    (s) =>
      !(typeLocked && s.id === 'type') &&
      !(s.id === 'precisions' && !adaptation) &&
      /* La longueur ne compte que pour une installation ; une réparation n'a pas de volume. */
      /* Le choix de la méthode de pose ne concerne que l'installation de locks. */
      !(s.id === 'methode' && besoin !== 'creation') &&
      !(s.id === 'longueur' && adaptation) &&
      !(s.id === 'volume' && besoin === 'reparation'),
  )
}
/** Vrai quand la consultation est choisie avec son mode : aucune autre étape ne suit, la demande part au paiement. */
/** Dès que la cliente choisit une consultation (salon, téléphone ou WhatsApp), seules 2 étapes s'affichent puis le paiement. */
export const parcoursCourt = (k) => k.want === true
export const isConsultationSeule = (k) => k.want === true && Boolean(k.mode)

const emptyResserrage = () => ({ type: '', volume: '', longueur: '', formule: 'complet', delai: 'standard', etat: 'bon' })
const emptyCreation = () => ({ type: '', methode: '', volume: '', longueur: '' })
const emptyConsultation = () => ({ want: null, hasLocks: null, mode: '', date: '', time: '' })
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
  step: 'profil',
  /** '' | 'ancienne' | 'nouvelle' */
  customerKind: '',
  consultation: emptyConsultation(),
  typeLocked: false,
  /** '' | 'creation' | 'resserrage' */
  besoin: '',
  /** '' | 'partielle' | 'globale' (besoin = réparation) */
  reparation: '',
  conditionsOk: false,
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

export function setCustomerKind(kind) {
  if (state.customerKind !== kind) {
    state.customerKind = kind
    state.consultation = emptyConsultation()
  }
  state.submitError = null
}
export function setConsultation(patch) {
  Object.assign(state.consultation, patch)
  state.submitError = null
}
export function setTypeLocked(v) {
  state.typeLocked = Boolean(v)
}

export function setBesoin(besoin) {
  state.besoin = besoin
  /* La réparation reprend la prestation « réparation » de la grille ; les autres besoins la quittent. */
  if (besoin === 'reparation') setResserrageFormule('reparation')
  else {
    state.reparation = ''
    if (state.resserrage.formule === 'reparation') setResserrageFormule('complet')
  }
  state.submitError = null
}
function setResserrageFormule(formule) {
  state.resserrage.formule = formule
}
export function setReparation(kind) {
  state.reparation = kind
  state.submitError = null
}
export function setConditionsOk(v) {
  state.conditionsOk = Boolean(v)
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
  /* Les méthodes proposées dépendent du type : changer de type oblige à reconfirmer la méthode. */
  if (state.creation.type !== type) state.creation.methode = ''
  state.creation.type = type
  state.resserrage.type = type
  state.submitError = null
}
export function setMethode(methode) {
  state.creation.methode = methode
  state.submitError = null
}
export function setVolume(volume) {
  state.creation.volume = volume
  state.resserrage.volume = volume
  state.submitError = null
}
/** La longueur aussi est commune aux deux besoins. */
export function setLongueur(longueur) {
  state.creation.longueur = longueur
  state.resserrage.longueur = longueur
  state.submitError = null
}
export const currentType = () => state.creation.type || state.resserrage.type
export function setCreation(patch) {
  if ('type' in patch) {
    state.typeFromCoiffure = false
    if (patch.type !== state.creation.type && !('methode' in patch)) state.creation.methode = ''
  }
  Object.assign(state.creation, patch)
  state.submitError = null
}
export function clearCreation() {
  Object.assign(state.creation, emptyCreation())
}

export const consultationValid = (k) => {
  if (k.want === false) return true
  if (k.want !== true || k.hasLocks === null || !k.mode) return false
  return k.mode !== 'sur_place' || Boolean(k.date && k.time)
}

/** La méthode choisie existe-t-elle pour ce type ? (ou « le salon me conseille ») */
export const methodeValide = (typeId, methode) =>
  methode === METHODE_CONSEIL || methodesDuType(typeId).methodes.some((m) => m.id === methode)

export function useBooking() {
  const consultationSeule = computed(() => isConsultationSeule(state.consultation))
  const steps = computed(() => stepsFor(state.typeLocked, state.besoin, parcoursCourt(state.consultation)))
  const isStepValid = (id) => {
    if (id === 'profil') return Boolean(state.customerKind) && Object.keys(validateCustomer(state.customer)).length === 0
    if (id === 'consultation') return consultationValid(state.consultation)
    if (id === 'besoin') return ['creation', 'resserrage', 'reparation'].includes(state.besoin)
    if (id === 'type') return Boolean(currentType())
    /* Méthode : obligatoire pour une installation (une méthode précise, ou « le salon me conseille »). */
    if (id === 'methode') return state.besoin !== 'creation' || methodeValide(state.creation.type, state.creation.methode)
    if (id === 'precisions') return state.besoin !== 'reparation' || Boolean(state.reparation)
    if (id === 'volume' || id === 'longueur') return true
    if (id === 'jour') return Boolean(state.customer.desiredDate && state.customer.desiredTime)
    return id === 'recap'
  }
  const index = () => steps.value.findIndex((s) => s.id === state.step)

  const maxReachedIndex = computed(() => {
    let i = 0
    while (i < steps.value.length - 1 && isStepValid(steps.value[i].id)) i += 1
    return i
  })

  const goToStep = (id) => {
    const i = steps.value.findIndex((s) => s.id === id)
    if (i < 0 || i > maxReachedIndex.value) return
    state.step = id
  }
  const next = () => {
    const i = index()
    if (isStepValid(state.step) && i < steps.value.length - 1) state.step = steps.value[i + 1].id
  }
  const previous = () => {
    const i = index()
    if (i > 0) state.step = steps.value[i - 1].id
  }
  const isLast = computed(() => index() === steps.value.length - 1)

  /** Envoie la demande au salon (POST /contact, route réelle du backend commun) ; ne simule jamais un succès. */
  const confirmBooking = async () => {
    if (state.submitting) return { ok: false }
    const seule = consultationSeule.value
    if (!(seule ? ['profil', 'consultation'] : ['profil', 'consultation', 'besoin', 'type', 'methode', 'precisions', 'jour']).every(isStepValid)) {
      state.submitError = 'Votre demande est incomplète.'
      return { ok: false }
    }
    if (!state.conditionsOk) {
      state.submitError = 'Acceptez les conditions de rendez-vous pour continuer.'
      return { ok: false }
    }
    state.submitting = true
    state.submitError = null
    const message = seule ? '' : buildRequestMessage(state)
    const c = state.customer
    const isCreation = state.besoin === 'creation'
    const r = isCreation ? state.creation : state.resserrage
    const reparationNote = state.besoin === 'reparation' ? `${state.reparation === 'globale' ? 'Réparation globale' : 'Réparation partielle'} demandée.` : ''
    const noteFinale = [reparationNote, c.note?.trim()].filter(Boolean).join('\n') || null
    const payload = {
      ...(seule
        ? {}
        : {
            besoin: isCreation ? 'creation' : 'resserrage',
            type: r.type,
            volume: state.besoin === 'reparation' ? '' : r.volume || '',
            longueur: isCreation ? r.longueur || '' : '',
            ...(isCreation && r.methode && r.methode !== METHODE_CONSEIL ? { methode: r.methode } : {}),
            ...(isCreation ? {} : { formule: r.formule, delai: r.delai, etat: r.etat }),
            ...(state.besoin === 'reparation' && state.reparation ? { reparation: state.reparation } : {}),
            desiredDate: c.desiredDate,
            ...(c.desiredTime ? { desiredTime: c.desiredTime } : {}),
          }),
      customerKind: state.customerKind,
      consultation: {
        mode: state.consultation.want ? state.consultation.mode : 'ignoree',
        ...(state.consultation.want ? { hasLocks: state.consultation.hasLocks } : {}),
        ...(state.consultation.want && state.consultation.mode === 'sur_place' ? { date: state.consultation.date, time: state.consultation.time } : {}),
      },
      inspiration: !seule && state.inspiration?.title
        ? { id: state.inspiration.static ? null : Number(state.inspiration.id) || null, title: state.inspiration.title }
        : null,
      firstName: c.firstName.trim(),
      lastName: c.lastName.trim(),
      phone: c.phone.trim(),
      email: c.email.trim(),
      birthDate: c.birthDate || null,
      note: noteFinale,
    }
    try {
      let reference = null
      let payment = null
      try {
        const created = await createBookingRequest(payload)
        reference = created?.reference ?? null
        payment = created?.payment ?? null
      } catch (error) {
        /* Serveur plus ancien (route absente) : la demande part comme un message de contact. */
        if (error?.status !== 404 || seule) throw error
        await sendContactMessage({
          name: `${c.firstName.trim()} ${c.lastName.trim()}`,
          email: c.email,
          phone: c.phone,
          message,
        })
      }
      if (payment?.required) return { ok: true, payment: { reference, amount: payment.amount } }
      state.confirmation = {
        reference,
        firstName: state.customer.firstName.trim(),
        besoin: seule ? '' : state.besoin,
        message: seule ? (state.consultation.mode === 'sur_place' ? `Consultation capillaire en salon le ${state.consultation.date} à ${state.consultation.time}.` : 'Consultation capillaire : le salon vous recontacte pour fixer le jour et l’heure.') : message,
        desiredDate: seule ? state.consultation.date || '' : state.customer.desiredDate,
        desiredTime: seule ? state.consultation.time || '' : state.customer.desiredTime || '',
        type: seule ? null : findType(state.besoin === 'creation' ? state.creation.type : state.resserrage.type)?.name ?? null,
      }
      return { ok: true }
    } catch (error) {
      const detail = Array.isArray(error?.details) ? error.details.map((d) => d?.message).filter(Boolean).slice(0, 3).join(' ') : ''
      state.submitError = `${error?.message || 'La demande n’a pas pu être envoyée.'}${detail ? ` ${detail}` : ''}`
      return { ok: false }
    } finally {
      state.submitting = false
    }
  }

  const reset = () => {
    Object.assign(state, {
      step: 'profil',
      customerKind: '',
      consultation: emptyConsultation(),
      typeLocked: false,
      besoin: '',
      reparation: '',
      conditionsOk: false,
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

  return { state, steps, consultationSeule, isStepValid, maxReachedIndex, goToStep, next, previous, isLast, confirmBooking, reset }
}

/** Départ depuis une coiffure : la coiffure accompagne la demande jusqu'au salon. */
export function preselectFromGallery(item) {
  if (!item) return
  state.confirmation = null
  state.submitError = null
  state.step = 'profil'
  clearTypeChoice()
  state.inspiration = { id: item.id, static: Boolean(item.static), title: item.title, description: item.description ?? '', imageUrl: item.imageUrl }
  /* Chaque coiffure est rangée dans un type de locks depuis le dashboard : ce type est choisi d'office (modifiable). */
  const type = resolveType(item)
  if (type) {
    setType(type.id)
    state.typeFromCoiffure = true
  }
}

/** Une nouvelle entrée (type ou coiffure) remplace la précédente : jamais deux cartes empilées. */
export function clearTypeChoice() {
  state.typeFromCoiffure = false
  state.typeLocked = false
  state.besoin = ''
  state.reparation = ''
  state.creation = emptyCreation()
  state.resserrage = emptyResserrage()
}

export function clearInspiration() {
  state.inspiration = null
}
