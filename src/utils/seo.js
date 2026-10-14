/**
 * Métadonnées SEO par page.
 *
 * Stratégie : les trois sites Beauté Halal ont des contenus proches. Chaque site
 * déclare sa PROPRE adresse comme canonique (jamais celle d'un autre domaine) et
 * l'indexation est pilotée par VITE_ALLOW_INDEXING : un seul des trois sites
 * devrait être indexable, les autres restent en « noindex, follow ».
 */
const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')
export const ALLOW_INDEXING = String(import.meta.env.VITE_ALLOW_INDEXING).toLowerCase() === 'true'
const SHARE_IMAGE = '/og-image.png'

export const siteOrigin = () => SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
export const absoluteUrl = (path = '/') => `${siteOrigin()}${path.startsWith('/') ? path : `/${path}`}`

function setMeta(selector, attrs, content) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    Object.entries(attrs).forEach(([k, v]) => tag.setAttribute(k, v))
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

export function applyPageMeta({ title, description, path = '/', noindex = false }) {
  if (typeof document === 'undefined') return
  const url = absoluteUrl(path)
  const image = absoluteUrl(SHARE_IMAGE)
  const hidden = noindex || !ALLOW_INDEXING

  document.title = title
  setMeta('meta[name="description"]', { name: 'description' }, description)
  setMeta(
    'meta[name="robots"]',
    { name: 'robots' },
    hidden ? 'noindex, follow' : 'index, follow, max-image-preview:large',
  )
  setLink('canonical', url)
  setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
  setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'Beauté Halal')
  setMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'fr_FR')
  setMeta('meta[property="og:title"]', { property: 'og:title' }, title)
  setMeta('meta[property="og:description"]', { property: 'og:description' }, description)
  setMeta('meta[property="og:url"]', { property: 'og:url' }, url)
  setMeta('meta[property="og:image"]', { property: 'og:image' }, image)
  setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
  setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
  setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
  setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image)
}

/** Données structurées HairSalon : uniquement ce que renvoie l'API, aucune note inventée. */
export function applySalonJsonLd(salon) {
  if (typeof document === 'undefined' || !salon?.name) return
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: salon.name,
    description: salon.shortDescription || salon.tagline || undefined,
    url: siteOrigin() || undefined,
    telephone: salon.phone?.display || undefined,
    email: salon.email || undefined,
    address: salon.address?.city
      ? {
          '@type': 'PostalAddress',
          streetAddress: [salon.address.line1, salon.address.line2].filter(Boolean).join(', ') || undefined,
          addressLocality: salon.address.city,
          addressCountry: salon.address.country || undefined,
        }
      : undefined,
    sameAs: (salon.socials ?? []).map((s) => s.url).filter(Boolean),
  }
  let script = document.getElementById('jsonld-salon')
  if (!script) {
    script = document.createElement('script')
    script.id = 'jsonld-salon'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}
