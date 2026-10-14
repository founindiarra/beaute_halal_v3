/**
 * Client unique vers l'API Beauté Halal (backend commun aux trois sites).
 * Aucun `fetch` ailleurs dans le projet. Aucune écriture dans la console :
 * les erreurs sont normalisées en ApiError avec un message destiné aux clientes.
 *
 * Routes utilisées — toutes publiques, déjà exploitées par les sites 1 et 2 :
 *   GET  /salon · /service-categories · /services[?featured=true] · /services/:slug
 *   GET  /gallery[?category&featured] · /gallery/categories · /testimonials · /team
 *   GET  /availability/days · /availability/slots
 *   POST /appointments · POST /contact
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://backend-beaute-halal.aeemci-ce.ci/api').replace(
  /\/+$/,
  '',
)
const DEFAULT_TIMEOUT = 12000

export { BASE_URL }

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
  get isNetworkError() {
    return this.status === 0
  }
  get isConflict() {
    return this.status === 409
  }
  get isValidationError() {
    return this.status === 422 || this.status === 400
  }
}

function friendlyMessage(status, payload) {
  const fromServer = payload?.error?.message
  if (fromServer && status < 500) return fromServer
  if (status === 0) return 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.'
  if (status === 404) return 'Cette ressource est introuvable.'
  if (status === 429) return 'Trop de tentatives. Merci de patienter quelques minutes.'
  if (status >= 500) return 'Le service est momentanément indisponible. Réessayez dans un instant.'
  return 'Une erreur est survenue. Merci de réessayer.'
}

async function request(path, { method = 'GET', body = null, timeout = DEFAULT_TIMEOUT } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    const aborted = error?.name === 'AbortError'
    throw new ApiError(
      aborted ? 'Le serveur met trop de temps à répondre. Réessayez dans un instant.' : friendlyMessage(0),
      { status: 0, code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR' },
    )
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 204) return { data: null, meta: null }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(friendlyMessage(response.status, payload), {
      status: response.status,
      code: payload?.error?.code ?? 'HTTP_ERROR',
      details: payload?.error?.details ?? null,
    })
  }
  return { data: payload?.data ?? null, meta: payload?.meta ?? null }
}

function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.append(k, String(v))
  })
  const q = search.toString()
  return q ? `?${q}` : ''
}

/** Les GET identiques lancés en même temps partagent une seule requête. */
const inflight = new Map()
function get(path, params) {
  const url = `${path}${toQuery(params)}`
  if (inflight.has(url)) return inflight.get(url)
  const promise = request(url).finally(() => inflight.delete(url))
  inflight.set(url, promise)
  return promise
}

const post = (path, body, options) => request(path, { method: 'POST', body, ...options })

/* ───────────────────────────── Ressources publiques ───────────────────────────── */

export const fetchSalon = async () => (await get('/salon')).data

export const fetchServiceCategories = async () => (await get('/service-categories')).data ?? []

export async function fetchServices({ category, featured } = {}) {
  const { data } = await get('/services', { category, featured: featured === true ? 'true' : undefined })
  return data ?? []
}

export const fetchService = async (slug) => (await get(`/services/${encodeURIComponent(slug)}`)).data

export const fetchGalleryCategories = async () => (await get('/gallery/categories')).data ?? []

const serviceIdOf = (item) => {
  const id = Number(item?.service?.id ?? item?.serviceId ?? item?.service_id)
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Si l'API n'imbrique pas la prestation d'une coiffure, on la retrouve par son identifiant. */
async function attachServices(items) {
  const pending = items.filter((i) => !i?.service?.slug && serviceIdOf(i))
  if (!pending.length) return items
  let services = []
  try {
    services = await fetchServices()
  } catch {
    return items
  }
  const byId = new Map(services.map((s) => [Number(s.id), s]))
  return items.map((i) => (i?.service?.slug ? i : { ...i, service: byId.get(serviceIdOf(i)) ?? null }))
}

export async function fetchGalleryItems({ category, featured } = {}) {
  const { data } = await get('/gallery', {
    category: category && category !== 'all' ? category : undefined,
    featured: featured === true ? 'true' : undefined,
  })
  return attachServices(data ?? [])
}

/** Pas de route GET /gallery/:id côté API publique : on filtre la liste sur l'identifiant. */
export async function fetchGalleryItem(id) {
  const wanted = Number(id)
  if (!Number.isInteger(wanted) || wanted <= 0) return null
  const items = await fetchGalleryItems()
  return items.find((i) => Number(i.id) === wanted) ?? null
}

export async function fetchTestimonials() {
  const { data, meta } = await get('/testimonials')
  return { items: data ?? [], averageRating: meta?.averageRating ?? 0 }
}

export const fetchTeam = async () => (await get('/team')).data ?? []

export async function fetchAvailabilityDays({ from, to, serviceId } = {}) {
  const { data } = await get('/availability/days', { from, to, serviceId })
  return data ?? { days: [], windowDays: 60 }
}

export async function fetchAvailabilitySlots(date, serviceId = null) {
  const { data } = await get('/availability/slots', { date, serviceId })
  return data ?? { date, slots: [], bookable: false }
}

/**
 * Crée une demande de rendez-vous.
 * Ni durée ni prix ne sont envoyés : le serveur les relit depuis la prestation.
 */
export async function createAppointment({ serviceSlug, date, time, firstName, lastName, phone, email, note }) {
  const { data } = await post(
    '/appointments',
    {
      serviceSlug,
      date,
      time,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      birthDate: null,
      note: note?.trim() ? note.trim() : null,
    },
    { timeout: 20000 },
  )
  return data
}

export async function sendContactMessage({ name, email, phone, message }) {
  const { data } = await post(
    '/contact',
    {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() ? phone.trim() : null,
      message: message.trim(),
    },
    { timeout: 20000 },
  )
  return data
}
