import { typeImages } from '@/data/heroImages'

/**
 * Logique tarifaire de Beauté Halal — d'après les documents du salon
 * (« Grille tarifaire — Resserrage de locks » et « Cahier de spécifications »).
 * Ces informations ne viennent pas de l'API : les montants sont indicatifs, le salon confirme
 * volume, longueur et tarif final avant la prestation.
 * Le prix dépend de 3 critères : type de locks · volume des cheveux · délai depuis la dernière séance.
 */

export let BRAND_TAGLINE = 'L’art du soin capillaire texturé'
export let BRAND_INTRO =
  'Spécialistes des locks, micro-locks et small locks. Un savoir-faire d’exception pour sublimer vos cheveux naturels, dans le respect de leur nature.'

/** WhatsApp réservations (fourni par le salon) — repli quand l'API n'en renseigne pas. */
export const WHATSAPP = { display: '+225 05 66 15 74 32', number: '2250566157432' }

export const VOLUMES = [
  { id: 'XS', label: 'Très peu de volume', hint: 'Très peu de cheveux, cuir chevelu bien visible' },
  { id: 'S', label: 'Peu de volume', hint: 'Peu de volume, chevelure fine' },
  { id: 'M', label: 'Volume normal', hint: 'Volume normal, densité moyenne (référence)' },
  { id: 'L', label: 'Beau volume', hint: 'Beau volume, chevelure dense' },
  { id: 'XL', label: 'Volume très important', hint: 'Volume très important, tête très fournie' },
]

export const LONGUEURS = [
  { label: 'Courte', hint: 'Jusqu’aux oreilles environ' },
  { label: 'Moyenne', hint: 'Jusqu’aux épaules environ' },
  { label: 'Longue', hint: 'Sous les épaules' },
]

/** Ajustements selon le délai depuis la dernière séance (montants en FCFA ; plus = « et plus »). */
const DELAI_2_MOIS = [
  { id: 'avance', label: 'Avant 2 mois', detail: '5 à 6 semaines', amount: -2000 },
  { id: 'standard', label: 'Dans les temps', detail: 'environ 2 mois', amount: 0 },
  { id: 'retard', label: 'Au-delà de 2 mois', detail: '9 à 10 semaines', amount: 3000 },
  { id: 'tres-retard', label: 'Au-delà de 3 mois', detail: '', amount: 5000, orMore: true },
]
const DELAI_MICRO = [
  { id: 'avance', label: '4 semaines', detail: 'cliente en avance', amount: -3000 },
  { id: 'standard', label: '5 à 6 semaines', detail: 'tarif standard', amount: 0 },
  { id: 'retard', label: '7 à 8 semaines', detail: '', amount: 3000 },
  { id: 'tres-retard', label: 'Au-delà de 8 semaines', detail: '', amount: 5000, orMore: true },
]

/** Majoration selon l'état des locks (pourcentage du tarif). */
const ETAT_STD = [
  { id: 'bon', label: 'Bon état', detail: 'pas de majoration', pct: 0 },
  { id: 'moyen', label: 'État moyen', detail: 'quelques locks défaites · +20 %', pct: 20 },
  { id: 'important', label: 'Dégât important', detail: 'presque toute la tête · +40 %', pct: 40 },
]
const ETAT_MICRO = [
  ETAT_STD[0],
  ETAT_STD[1],
  { id: 'important', label: 'Dégât important', detail: 'presque toute la tête · +40 à 50 %', pct: 40, orMore: true },
]

export const LOCK_TYPES = [
  {
    id: 'traditionnels',
    name: 'Locks Traditionnels',
    tagline: 'Les locks classiques',
    description: 'Locks classiques aux dimensions généreuses.',
    size: '1 cm à 1,5 cm',
    rhythm: 'Resserrage tous les 2 mois',
    prices: { XS: [10000, 7000], S: [12000, 8500], M: [15000, 10500], L: [17000, 12000], XL: [20000, 14000] },
    delais: DELAI_2_MOIS,
    etats: ETAT_STD,
    repair: { from: 35000, text: 'À partir de 35 000 FCFA' },
  },
  {
    id: 'small',
    name: 'Small Locks',
    tagline: 'Le format semi-fin',
    description: 'Locks fines et élégantes, pour un rendu raffiné.',
    size: '0,4 cm à 0,8 cm',
    rhythm: 'Resserrage tous les 2 mois',
    prices: { XS: [15000, 10500], S: [18000, 12500], M: [22000, 15500], L: [26000, 18000], XL: [30000, 21000] },
    delais: DELAI_2_MOIS,
    etats: ETAT_STD,
    repair: { from: 50000, text: 'À partir de 50 000 FCFA' },
  },
  {
    id: 'micro',
    name: 'Micro-Locks',
    tagline: 'Le format premium',
    description: 'Le summum du détail et de la finesse : un travail minutieux, un resserrage toutes les 6 semaines.',
    size: '0,1 cm à 0,4 cm',
    rhythm: 'Resserrage toutes les 6 semaines',
    prices: { XS: [20000, 14000], S: [25000, 17500], M: [30000, 21000], L: [36000, 25000], XL: [42000, 29500] },
    delais: DELAI_MICRO,
    etats: ETAT_MICRO,
    repair: { from: 70000, text: '70 000 à 180 000 FCFA' },
  },
]

export const FORMULES = [
  {
    id: 'complet',
    label: 'Resserrage complet',
    short: 'Complet',
    detail: 'racines + tiges',
    index: 0,
    help: 'Racines et tiges retravaillées. Recommandé pour les locks en cours de maturation (moins de 2 ans).',
  },
  {
    id: 'racines',
    label: 'Reprise de racines seule',
    short: 'Racines seules',
    detail: '−30 %',
    index: 1,
    help: 'Uniquement la repousse au niveau du cuir chevelu. Pour les locks matures (plus de 2 ans) ou sur demande.',
  },
  {
    id: 'reparation',
    label: 'Réparation',
    short: 'Réparation',
    detail: 'selon dégâts',
    index: -1,
    help: 'Tarif indicatif « à partir de » : le prix définitif dépend de l’ampleur des dégâts et du temps de travail.',
  },
]

export let engagement =
  'Chaque resserrage complet inclut le travail des racines ET des tiges jusqu’à la maturation complète de vos locks (environ 2 ans).'

export const consultation = {
  nouvelle: 'Nouvelle cliente : consultation payante 5 000 FCFA',
  ancienne: 'Ancienne cliente : diagnostic gratuit',
  final: 'Le tarif final vous est annoncé avant le début de la prestation.',
}

export let videoAdvice =
  'Envoyez-nous une courte vidéo de vos cheveux au naturel : nous confirmons votre volume et votre longueur en quelques minutes.'

/** « Bon à savoir » — le texte des documents du salon. */
export const goodToKnow = [
  { title: 'Consultation & diagnostic', text: 'Consultation payante à 5 000 FCFA pour toute nouvelle cliente. Diagnostic gratuit pour les anciennes clientes. Le tarif vous est annoncé avant le début de la prestation.' },
  { title: 'Travail des racines ET des tiges', text: 'Chaque resserrage complet inclut la reprise des racines et la retouche des tiges, jusqu’à la maturation complète de vos locks (environ 2 ans). C’est notre signature.' },
  { title: 'Respect des délais', text: 'Pour préserver la santé de vos locks et bénéficier du tarif standard : 2 mois pour les Locks Traditionnels et les Small Locks, 6 semaines pour les Micro-Locks.' },
  { title: 'Temps de prestation', text: 'Un resserrage de Micro-Locks demande au minimum 3 heures de travail en solo (2 heures à deux mains), et peut aller jusqu’à 5-6 heures selon l’état. Merci de prévoir le temps nécessaire.' },
  { title: 'Retouche de tiges seule', text: 'Pour les cas particuliers (événement, entre-deux séances), la retouche de tiges seule est étudiée au cas par cas : parlez-nous-en.' },
  { title: 'Réparations', text: 'Les tarifs de réparation sont des fourchettes indicatives : le prix définitif dépend de l’ampleur des dégâts et du temps de travail (jusqu’à 2 jours pour les cas lourds). Réparations offertes pour les clientes abonnées à l’Institut Beauté Halal qui respectent le calendrier de suivi.' },
]

export const findType = (id) => LOCK_TYPES.find((t) => t.id === id) ?? null
export const findVolume = (id) => VOLUMES.find((v) => v.id === id) ?? null
export const findFormule = (id) => FORMULES.find((f) => f.id === id) ?? null

/** Tarif de base (FCFA) ou null si la combinaison est incomplète. */
export function tarifFor(type, volume, formule) {
  const t = findType(type)
  const f = findFormule(formule)
  if (!t || !f) return null
  if (f.id === 'reparation') return t.repair.from
  if (!t.prices[volume]) return null
  return t.prices[volume][f.index]
}

/** « À partir de » le plus bas d'un type de locks (XS, resserrage complet). */
export const startingPrice = (type) => findType(type)?.prices.XS[0] ?? null

/**
 * Estimation indicative : base ± ajustement de délai, puis majoration d'état (% du tarif de base).
 * `partial` = vrai quand le document indique « et plus » : le montant est un minimum.
 */
export function estimate({ type, volume, formule, delai, etat }) {
  const base = tarifFor(type, volume, formule)
  if (base === null) return null
  const t = findType(type)
  if (formule === 'reparation') return { base, delta: 0, majoration: 0, total: base, partial: true }
  const d = t.delais.find((x) => x.id === delai)
  const e = t.etats.find((x) => x.id === etat)
  const delta = d?.amount ?? 0
  const majoration = Math.round((base * (e?.pct ?? 0)) / 100)
  return {
    base,
    delta,
    majoration,
    total: base + delta + majoration,
    partial: Boolean(d?.orMore || e?.orMore),
  }
}

/* ------------------------------------------------------------------ */
/* Parcours « nouvelle logique » : création complète ou resserrage      */
/* ------------------------------------------------------------------ */

export const BESOINS = [
  {
    id: 'creation',
    name: 'Création complète',
    text: 'Vous démarrez vos locks : le salon évalue avec vous le type, le volume et la longueur.',
    note: 'Le tarif d’une création est annoncé par le salon après diagnostic.',
  },
  {
    id: 'resserrage',
    name: 'Resserrage',
    text: 'Vous avez déjà des locks : resserrage complet, reprise de racines ou réparation.',
    note: 'Tarif indicatif calculé selon la grille du salon.',
  },
]

/** Les prestations de la nouvelle logique (nom + description), présentées sur les coiffures. */
export const PRESTATIONS = [
  { id: 'creation', name: 'Création complète', description: 'Création de vos locks de A à Z, dans le type choisi (traditionnels, small ou micro-locks).' },
  { id: 'resserrage', name: 'Resserrage complet', description: 'Racines et tiges retravaillées jusqu’à la maturation complète de vos locks (environ 2 ans).' },
  { id: 'racines', name: 'Reprise de racines seule', description: 'Uniquement la repousse au niveau du cuir chevelu, pour les locks matures ou sur demande (−30 %).' },
  { id: 'reparation', name: 'Réparation', description: 'Remise en état des locks abîmées ou cassées : tarif indicatif selon l’ampleur des dégâts.' },
]

/** Type de locks reconnu dans le texte d'une coiffure (titre / description) ; sinon null — rien n'est deviné. */
export function inferType(text = '') {
  const t = String(text).toLowerCase()
  if (/micro/.test(t)) return findType('micro')
  if (/small/.test(t)) return findType('small')
  if (/tradition|classique/.test(t)) return findType('traditionnels')
  return null
}

const money = (n) => `${new Intl.NumberFormat('fr-FR').format(n).replace(/[\u202f\u00a0]/g, ' ')} FCFA`

/** Texte envoyé au salon (le serveur ne porte ni volume ni délai : tout est dans le message). */
export function buildRequestMessage({ besoin, resserrage, creation, customer, inspiration }) {
  const lines = ['DEMANDE DE RENDEZ-VOUS (site v3)']
  if (besoin === 'creation') {
    const t = findType(creation.type)
    lines.push('Besoin : Création complète')
    lines.push(`Type de locks : ${t ? `${t.name} (${t.size})` : 'je ne sais pas'}`)
    lines.push(`Volume : ${findVolume(creation.volume)?.hint ?? 'à évaluer sur place'}`)
    if (creation.longueur) lines.push(`Longueur : ${creation.longueur}`)
  } else {
    const t = findType(resserrage.type)
    const f = findFormule(resserrage.formule)
    lines.push(`Besoin : ${f?.label ?? 'Resserrage'}`)
    lines.push(`Type de locks : ${t ? `${t.name} (${t.size})` : 'je ne sais pas'}`)
    if (resserrage.formule !== 'reparation') {
      lines.push(`Volume : ${findVolume(resserrage.volume)?.hint ?? 'à évaluer sur place'}`)
      if (t) {
        lines.push(`Dernière séance : ${t.delais.find((d) => d.id === resserrage.delai)?.label ?? '—'}`)
        lines.push(`État des locks : ${t.etats.find((e) => e.id === resserrage.etat)?.label ?? '—'}`)
      }
    }
    const est = t ? estimate(resserrage) : null
    if (est) lines.push(`Tarif indicatif : ${est.partial ? 'à partir de ' : ''}${money(est.total)}`)
  }
  if (inspiration?.title) lines.push(`Coiffure souhaitée : « ${inspiration.title} » (vue dans Nos coiffures)`)
  if (customer.desiredDate) lines.push(`Jour souhaité : ${customer.desiredDate}`)
  if (customer.birthDate) lines.push(`Date de naissance : ${customer.birthDate}`)
  lines.push(`Cliente : ${customer.firstName.trim()} ${customer.lastName.trim()} · ${customer.phone.trim()}`)
  if (customer.note?.trim()) lines.push(`Message : ${customer.note.trim()}`)
  return lines.join('\n')
}


/* ------------------------------------------------------------------ */
/* Synchronisation avec le catalogue du salon (GET /tarifs)           */
/* ------------------------------------------------------------------ */

const replaceArray = (target, source) => {
  if (Array.isArray(source) && source.length) target.splice(0, target.length, ...source)
}
const replaceObject = (target, source) => {
  if (source && typeof source === 'object') Object.assign(target, source)
}

/**
 * Remplace la grille embarquée par celle que le salon règle dans son
 * dashboard. Les tableaux et objets sont modifiés EN PLACE (les composants en
 * gardent la référence) ; les textes sont des `let` exportés. À appeler avant
 * le montage de l'application. Un catalogue incomplet est ignoré champ par
 * champ : la grille embarquée reste le repli.
 */
export function applyCatalogue(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.brand?.tagline === 'string' && data.brand.tagline) BRAND_TAGLINE = data.brand.tagline
  if (typeof data.brand?.intro === 'string' && data.brand.intro) BRAND_INTRO = data.brand.intro
  if (typeof data.engagement === 'string' && data.engagement) engagement = data.engagement
  if (typeof data.videoAdvice === 'string' && data.videoAdvice) videoAdvice = data.videoAdvice
  replaceObject(WHATSAPP, data.whatsapp)
  replaceObject(consultation, data.consultation)
  replaceArray(VOLUMES, data.volumes)
  replaceArray(LONGUEURS, data.longueurs)
  replaceArray(LOCK_TYPES, data.lockTypes)
  // Photos des types réglées depuis la page « Catégories » du dashboard.
  for (const t of LOCK_TYPES) {
    if (typeof t.image === 'string' && t.image) typeImages[t.id] = t.image
  }
  replaceArray(FORMULES, data.formules)
  replaceArray(goodToKnow, data.goodToKnow)
  replaceArray(BESOINS, data.besoins)
  replaceArray(PRESTATIONS, data.prestations)
  return true
}
