import { fromDateKey } from './date'

export const CURRENCY = 'FCFA'

/** 60000 → « 60 000 FCFA » ; valeur absente → « Sur devis ». */
export function formatPrice(value, currency = CURRENCY) {
  if (value === null || value === undefined || value === '') return 'Sur devis'
  // Espaces insécables (U+00A0) : le montant et la devise ne se coupent pas en fin de ligne.
  const NBSP = String.fromCharCode(160)
  const n = new Intl.NumberFormat('fr-FR').format(Number(value)).replace(/[\u202f\u00a0 ]/g, NBSP)
  return `${n}${NBSP}${currency || CURRENCY}`
}

/** 195 → « 3 h 15 » */
export function formatDuration(minutes) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const r = minutes % 60
  if (!h) return `${r} min`
  if (!r) return `${h} h`
  return `${h} h ${`${r}`.padStart(2, '0')}`
}

const toLocal = (v) => (v instanceof Date ? v : /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? fromDateKey(v) : new Date(v))

export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

export function formatDateLong(value) {
  if (!value) return ''
  return capitalize(
    new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
      toLocal(value),
    ),
  )
}

export function formatDateShort(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(toLocal(value))
}

/** Numérotation éditoriale : 1 → « 01 » */
export const pad2 = (n) => `${n}`.padStart(2, '0')
