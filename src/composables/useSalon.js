import { computed, reactive } from 'vue'

import { WHATSAPP } from '@/data/tarifs'
import { fetchSalon } from '@/services/api'
import { applySalonJsonLd } from '@/utils/seo'

/**
 * Informations du salon (GET /salon), chargées une fois et partagées.
 * Avant la réponse, seuls le nom et la spécialité (constantes de marque) sont connus :
 * aucune fausse coordonnée n'est affichée.
 */
const empty = () => ({
  name: 'Beauté Halal',
  tagline: '',
  shortDescription: '',
  phone: { display: '', href: '' },
  whatsapp: { number: '', defaultMessage: '', available: false },
  email: '',
  address: { line1: '', line2: '', city: '', country: '', note: '', mapEmbedUrl: '' },
  socials: [],
  hours: [],
  currency: 'FCFA',
  bookingWindowDays: 60,
  consultationFee: 5000,
})

/** Page Facebook du salon : ajoutée si le dashboard (Paramètres) n'en renseigne pas. */
const FACEBOOK = { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61578860944266' }
const withFacebook = (list) => (list.some((s) => s.id === 'facebook') ? list : [...list, FACEBOOK])

const state = reactive({ salon: empty(), loading: false, error: null, loaded: false })
let inflight = null
let lastFailureAt = 0
const RETRY_DELAY = 15000

export async function loadSalon({ force = false } = {}) {
  if (state.loaded && !force) return state.salon
  if (inflight) return inflight
  if (!force && lastFailureAt && Date.now() - lastFailureAt < RETRY_DELAY) return state.salon

  state.loading = true
  state.error = null
  inflight = fetchSalon()
    .then((data) => {
      const base = empty()
      state.salon = {
        ...base,
        ...data,
        phone: { ...base.phone, ...(data?.phone ?? {}) },
        whatsapp: { ...base.whatsapp, ...(data?.whatsapp ?? {}) },
        address: { ...base.address, ...(data?.address ?? {}) },
        socials: withFacebook(data?.socials ?? []),
        hours: data?.hours ?? [],
      }
      state.loaded = true
      lastFailureAt = 0
      applySalonJsonLd(state.salon)
      return state.salon
    })
    .catch((error) => {
      state.error = error?.message || 'Impossible de charger les informations du salon.'
      lastFailureAt = Date.now()
      return state.salon
    })
    .finally(() => {
      state.loading = false
      inflight = null
    })
  return inflight
}

export function useSalon() {
  loadSalon()
  const salon = computed(() => state.salon)
  // Numéro WhatsApp unique du site : celui du catalogue (réglable dans le dashboard, Tarifs → contact),
  // par défaut +225 05 66 15 74 32. Le réglage « WhatsApp » des paramètres du salon ne sert plus aux liens.
  const waNumber = computed(() => String(WHATSAPP.number || '').replace(/\D/g, ''))

  /** Lien WhatsApp, ou null tant que le salon n'a pas renseigné son numéro. */
  const whatsappLink = (message) => {
    if (!waNumber.value) return null
    const text = message || state.salon.whatsapp?.defaultMessage || ''
    return text ? `https://wa.me/${waNumber.value}?text=${encodeURIComponent(text)}` : `https://wa.me/${waNumber.value}`
  }

  return {
    salon,
    hours: computed(() => state.salon.hours ?? []),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    loaded: computed(() => state.loaded),
    hasWhatsapp: computed(() => Boolean(waNumber.value)),
    whatsappLink,
    reload: () => loadSalon({ force: true }),
  }
}
