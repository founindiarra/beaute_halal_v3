/**
 * API SIMULÉE — POUR LES TESTS LOCAUX UNIQUEMENT.
 *
 * Reproduit le contrat des routes publiques déjà utilisées par les sites 1 et 2
 * (enveloppe { success, data, meta }) avec des données FICTIVES, afin de tester le
 * parcours de réservation sans écrire dans la base de production.
 * Ce n'est ni un backend, ni une base de données : rien n'est persisté.
 *
 *   node scripts/mock-api.mjs            → http://localhost:4010/api
 *   puis, dans .env.local : VITE_API_URL=http://localhost:4010/api
 *
 * Astuces de test : un commentaire contenant « TEST409 » provoque un conflit de
 * créneau ; un e-mail contenant « invalid422 » provoque une erreur de validation.
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_PORT || 4010)
const ORIGIN = `http://localhost:${PORT}`
const EMPTY = process.env.MOCK_EMPTY === '1' // simule un salon sans données optionnelles

const categories = [
  { id: 1, slug: 'creation', name: 'Création' },
  { id: 2, slug: 'entretien', name: 'Entretien' },
]
const services = [
  { id: 1, slug: 'creation-de-locks', name: 'Création de locks (démo)', description: 'Prestation fictive de test.', durationMinutes: 300, price: 60000, currency: 'FCFA', category: categories[0], imageUrl: `${ORIGIN}/img/1.svg` },
  { id: 2, slug: 'retwist', name: 'Retwist (démo)', description: 'Prestation fictive de test.', durationMinutes: 120, price: 15000, currency: 'FCFA', category: categories[1], imageUrl: `${ORIGIN}/img/2.svg` },
  { id: 3, slug: 'soin-profond', name: 'Soin profond (démo)', description: 'Prestation fictive de test.', durationMinutes: 60, price: 8000, currency: 'FCFA', category: categories[1], imageUrl: '' },
]
const gallery = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `Coiffure de démonstration ${i + 1}`,
  description: i % 2 ? 'Photo fictive de test.' : null,
  imageUrl: `${ORIGIN}/img/${(i % 5) + 1}.svg`,
  category: i % 2 ? categories[1] : categories[0],
  service: i === 0 ? services[0] : i === 1 ? services[1] : null,
  featured: i < 5,
}))
const salon = {
  name: 'Beauté Halal',
  tagline: 'Texte de démonstration du mock.',
  shortDescription: 'Salon spécialisé dans les locks (données fictives du mock).',
  phone: { display: '+225 00 00 00 00 00', href: 'tel:+22500000000000' },
  whatsapp: { number: '22500000000000', defaultMessage: 'Bonjour Beauté Halal', available: true },
  email: 'demo@example.invalid',
  address: { line1: 'Adresse fictive', line2: '', city: 'Ville fictive', country: 'Pays fictif', note: '', mapEmbedUrl: '' },
  socials: [{ id: 'instagram', label: 'Instagram', url: 'https://example.invalid/ig' }],
  hours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, i) => ({ day, value: i === 6 ? 'Fermé' : '09:00 – 18:00', isClosed: i === 6 })),
  currency: 'FCFA',
  bookingWindowDays: 60,
}
const booked = new Set()

const keyOf = (d) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
const slotsFor = (dateKey, serviceId) => {
  const service = services.find((s) => s.id === Number(serviceId))
  const [y, m, d] = dateKey.split('-').map(Number)
  const day = new Date(y, m - 1, d)
  if (day.getDay() === 0) return []
  return ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
    .filter((t) => !(service && service.durationMinutes > 240 && Number(t.slice(0, 2)) > 12))
    .map((time) => ({ time, available: !booked.has(`${dateKey}T${time}`), reason: null }))
}

const send = (res, status, body, extra = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  })
  res.end(JSON.stringify(body))
}
const ok = (res, data, meta = null) => send(res, 200, { success: true, data, meta })
const fail = (res, status, code, message, details = null) => send(res, status, { success: false, error: { code, message, details } })

const palette = ['#9c5128', '#4f5636', '#46302a', '#b8693b', '#26180f']
const svg = (n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="${palette[(n - 1) % 5]}"/><path d="M400 120c-180 130-180 260 0 390s180 260 0 390" fill="none" stroke="#f5eee1" stroke-width="40" stroke-linecap="round" opacity=".7"/><text x="400" y="960" font-family="Georgia" font-size="38" fill="#f5eee1" text-anchor="middle">Image de test ${n}</text></svg>`

createServer((req, res) => {
  const url = new URL(req.url, ORIGIN)
  const path = url.pathname.replace(/\/+$/, '')

  if (req.method === 'OPTIONS') return send(res, 204, {})
  if (path.startsWith('/img/')) {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Access-Control-Allow-Origin': '*' })
    return res.end(svg(Number(path.match(/(\d+)/)?.[1] || 1)))
  }
  if (!path.startsWith('/api')) return fail(res, 404, 'NOT_FOUND', 'Introuvable')
  const route = path.slice(4)

  if (req.method === 'GET') {
    if (route === '/salon') return ok(res, salon)
    if (route === '/service-categories') return ok(res, categories)
    if (route === '/services') {
      let list = services
      if (url.searchParams.get('featured') === 'true') list = list.slice(0, 2)
      return ok(res, list)
    }
    if (route.startsWith('/services/')) {
      const s = services.find((x) => x.slug === decodeURIComponent(route.split('/')[2]))
      return s ? ok(res, s) : fail(res, 404, 'NOT_FOUND', 'Prestation introuvable.')
    }
    if (route === '/gallery/categories') return ok(res, [{ id: 0, slug: 'all', name: 'Toutes' }, ...categories])
    if (route === '/gallery') {
      let list = gallery
      const cat = url.searchParams.get('category')
      if (cat) list = list.filter((g) => g.category.slug === cat)
      if (url.searchParams.get('featured') === 'true') list = list.filter((g) => g.featured)
      return ok(res, list)
    }
    if (route === '/testimonials') return ok(res, EMPTY ? [] : [], { averageRating: 0 })
    if (route === '/team') return ok(res, [])
    if (route === '/availability/days') {
      const sid = url.searchParams.get('serviceId')
      const days = Array.from({ length: 60 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const key = keyOf(d)
        const n = slotsFor(key, sid).filter((s) => s.available).length
        return { date: key, bookable: n > 0 && !(i === 0), availableSlots: n }
      })
      return ok(res, { days, windowDays: 60 })
    }
    if (route === '/availability/slots') {
      const date = url.searchParams.get('date') || ''
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 422, 'VALIDATION_ERROR', 'Date invalide.')
      const slots = slotsFor(date, url.searchParams.get('serviceId'))
      return ok(res, { date, slots, bookable: slots.some((s) => s.available) })
    }
    return fail(res, 404, 'NOT_FOUND', 'Route inconnue (mock).')
  }

  if (req.method === 'POST') {
    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', () => {
      let body = {}
      try {
        body = JSON.parse(raw || '{}')
      } catch {
        return fail(res, 400, 'BAD_JSON', 'Corps invalide.')
      }
      if (route === '/contact') {
        if (!body.message || !body.email) return fail(res, 422, 'VALIDATION_ERROR', 'Message ou e-mail manquant.')
        return ok(res, { received: true })
      }
      if (route === '/appointments') {
        console.log('[mock] POST /appointments — champs reçus :', Object.keys(body).sort().join(', '))
        if (/invalid422/.test(body.email || '')) return fail(res, 422, 'VALIDATION_ERROR', 'Adresse e-mail refusée par le serveur.')
        const service = services.find((s) => s.slug === body.serviceSlug)
        if (!service) return fail(res, 404, 'SERVICE_NOT_FOUND', 'Prestation introuvable.')
        if ('price' in body || 'durationMinutes' in body) return fail(res, 422, 'VALIDATION_ERROR', 'Prix et durée ne doivent pas être envoyés.')
        const key = `${body.date}T${body.time}`
        if (booked.has(key) || /TEST409/.test(body.note || '')) {
          booked.add(key)
          return fail(res, 409, 'SLOT_BOOKED', 'Ce créneau vient d’être pris. Merci d’en choisir un autre.')
        }
        booked.add(key)
        return send(res, 201, {
          success: true,
          data: {
            reference: `BH-TEST-${Math.floor(1000 + Math.random() * 8999)}`,
            serviceName: service.name,
            date: body.date,
            time: body.time,
            durationMinutes: service.durationMinutes,
            price: service.price,
            currency: service.currency,
            firstName: body.firstName,
            status: 'pending',
          },
        })
      }
      return fail(res, 404, 'NOT_FOUND', 'Route inconnue (mock).')
    })
    return
  }
  return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Méthode non autorisée.')
}).listen(PORT, () => console.log(`[mock] API simulée sur ${ORIGIN}/api (données fictives, rien n'est persisté)`))
