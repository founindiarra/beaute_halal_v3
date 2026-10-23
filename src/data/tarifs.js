import { libelleMethode } from '@/data/methodes'
import { aboutPhotos, heroArt, heroMobile, heroVideo, typeImages } from '@/data/heroImages'
import { process as editorialEtapes, values as editorialValeurs } from '@/data/editorial'

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
  { id: 'XS', label: 'Très peu de volume', hint: 'Presque pas de cheveux, cuir chevelu bien visible' },
  { id: 'S', label: 'Peu de volume', hint: 'Des cheveux présents, mais peu fournis' },
  { id: 'M', label: 'Volume normal', hint: 'Volume normal, densité normale (référence)' },
  { id: 'L', label: 'Beau volume', hint: 'Cheveux avec une forte densité' },
  { id: 'XL', label: 'Volume très important', hint: 'Très forte densité, tête très fournie' },
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
    name: 'Locks Traditionnelles',
    tagline: 'Les locks classiques',
    description: 'Locks classiques aux dimensions généreuses.',
    size: 'À partir de 1 cm',
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
    size: '0,6 cm à 0,8 cm',
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
    size: '0,2 cm à 0,4 cm',
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

/** Étapes de la consultation capillaire (étape « Consultation » de la prise de rendez-vous). */
export const SOINS = {
  "etapes": {
    "profil": { "label": "Votre profil", "title": "Faisons connaissance", "intro": "" },
    "consultation": { "label": "Consultation", "title": "Consultation capillaire", "intro": "" },
    "besoin": { "label": "Votre besoin", "title": "De quoi avez-vous besoin ?", "intro": "" },
    "type": { "label": "Type de locks", "title": "Choisissez votre type de locks", "intro": "" },
    "methode": { "label": "Méthode", "title": "Choisissez votre méthode de pose", "intro": "" },
    "volume": { "label": "Volume", "title": "Votre volume de cheveux", "intro": "" },
    "longueur": { "label": "Longueur", "title": "La longueur de vos cheveux", "intro": "" },
    "precisions": { "label": "Resserrage", "title": "Votre resserrage", "intro": "" },
    "jour": { "label": "Jour", "title": "Choisissez un jour", "intro": "" },
    "recap": { "label": "Récapitulatif", "title": "Vérifiez votre demande", "intro": "" }
  },
  "propose": {
    "title": "Souhaitez-vous une consultation capillaire ?",
    "text": "Un temps d’échange avec une experte pour examiner vos cheveux et choisir les soins qui conviennent. Elle n’est pas obligatoire pour réserver.",
    "faireLabel": "Faire une consultation capillaire",
    "faireHint": "Recommandé pour des soins de qualité.",
    "ignorerLabel": "Ignorer la consultation",
    "ignorerHint": "Passer directement à la réservation.",
    "ignoreeMessage": "Vous avez choisi de ne pas faire de consultation capillaire. Vous pouvez poursuivre votre réservation."
  },
  "locks": {
    "title": "Avez-vous déjà des locks ?",
    "text": "Selon votre réponse, la consultation ne porte pas sur les mêmes points.",
    "ouiLabel": "Oui, j’ai des locks",
    "ouiHint": "Faire le point sur leur état et leur entretien.",
    "nonLabel": "Non, je n’en ai pas",
    "nonHint": "Préparer la création de vos locks."
  },
  "modes": {
    "title": "Comment souhaitez-vous faire votre consultation ?",
    "telephoneLabel": "Par téléphone",
    "telephoneHint": "Votre téléphone s’ouvre avec le numéro du salon déjà saisi.",
    "whatsappLabel": "Par WhatsApp",
    "whatsappHint": "La discussion s’ouvre avec un message déjà rédigé.",
    "placeLabel": "Par prise de rendez-vous",
    "placeHint": "Une consultation en salon, à la date de votre choix.",
    "confirmation": "Parfait. Vous pouvez poursuivre votre réservation : le salon vous accompagne pour la consultation."
  },
  "avecLocks": {
    "title": "Pourquoi une consultation, même avec des locks ?",
    "lead": "La consultation capillaire chez Beauté Halal est une étape essentielle, même pour les clientes qui portent déjà des locks.",
    "points": [
      {
        "title": "Analyse technique.",
        "text": "La locticienne analyse la structure de vos locks actuelles, la qualité de vos cheveux et l’état de vos racines : crucial si vos locks ont été commencées ailleurs."
      },
      {
        "title": "Tarification exacte.",
        "text": "Nos tarifs sont présentés sous forme d’intervalles : la consultation permet de fixer le prix précis de votre prestation (resserrage ou réparation) selon la longueur et le volume de vos cheveux."
      },
      {
        "title": "Conseil personnalisé.",
        "text": "C’est le moment de parler de votre routine d’entretien et de s’assurer que la technique de resserrage est adaptée à votre cuir chevelu, pour un résultat de qualité."
      }
    ],
    "outro": ""
  },
  "sansLocks": {
    "title": "Pourquoi une consultation avant vos locks ?",
    "lead": "La consultation capillaire est une étape obligatoire chez Beauté Halal avant tout départ de locks ou de micro-locks.",
    "points": [
      {
        "title": "Analyse de votre fibre capillaire.",
        "text": "Nature de vos cheveux, volume et densité : essentiel pour déterminer la méthode la plus adaptée à votre cuir chevelu."
      },
      {
        "title": "Choix de la méthode.",
        "text": "Interlocking, braids ou twists : nous vous conseillons la technique qui garantira la meilleure tenue et la meilleure santé pour vos futures locks."
      },
      {
        "title": "Tarification précise.",
        "text": "Nos tarifs dépendent de la longueur et du volume de vos cheveux : c’est lors de ce rendez-vous que nous fixons le prix exact de votre prestation."
      },
      {
        "title": "Planification personnalisée.",
        "text": "Nous évaluons le temps nécessaire à la pose, qui varie selon la complexité du travail."
      }
    ],
    "outro": "En résumé : un gage de qualité pour un résultat durable et une coiffure qui vous ressemble."
  }
}

/** « Bon à savoir » — le texte des documents du salon. */
export const goodToKnow = [
  { title: 'Consultation & diagnostic', text: 'Consultation payante à 5 000 FCFA pour toute nouvelle cliente. Diagnostic gratuit pour les anciennes clientes. Le tarif vous est annoncé avant le début de la prestation.' },
  { title: 'Travail des racines ET des tiges', text: 'Chaque resserrage complet inclut la reprise des racines et la retouche des tiges, jusqu’à la maturation complète de vos locks (environ 2 ans). C’est notre signature.' },
  { title: 'Respect des délais', text: 'Pour préserver la santé de vos locks et bénéficier du tarif standard : 2 mois pour les Locks Traditionnelles et les Small Locks, 6 semaines pour les Micro-Locks.' },
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
export function estimate({ type, volume, formule, delai, etat, reparation = '' }) {
  /* Réparation : le tarif dépend du niveau (partielle à partir de 35 000 F, globale à partir de 50 000 F), pas du type de locks. */
  if (formule === 'reparation') {
    const base = findReparation(reparation)?.from ?? (reparation ? null : tarifFor(type, volume, formule))
    if (base === null || base === undefined) return null
    return { base, delta: 0, majoration: 0, total: base, partial: true }
  }
  const base = tarifFor(type, volume, formule)
  if (base === null) return null
  const t = findType(type)
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
    name: 'Installation de locks',
    text: 'Vous démarrez vos locks : le salon évalue avec vous le type, le volume et la longueur.',
    note: 'Le tarif d’une installation est annoncé par le salon après diagnostic.',
  },
  {
    id: 'resserrage',
    name: 'Resserrage',
    text: 'Vous avez déjà des locks : resserrage complet ou reprise de racines.',
    note: 'Tarif indicatif calculé selon la grille du salon.',
  },
  {
    id: 'reparation',
    name: 'Réparation',
    text: 'Vos locks sont abîmées ou fragilisées : le salon les remet en état, partiellement ou globalement.',
    note: 'Tarif indicatif « à partir de » : le prix définitif dépend de l’ampleur des dégâts.',
  },
]

/** Deux niveaux de réparation (c'est la cliente qui choisit, le salon confirme sur place). */
export const REPARATIONS = [
  { id: 'partielle', name: 'Réparation partielle', from: 35000, text: 'Votre dernier resserrage date de plus de deux fois le délai habituel : des locks glissent ou se défont et sont à reprendre.' },
  { id: 'globale', name: 'Réparation globale', from: 50000, text: 'Vos tiges sont extrêmement affinées, avec des boules ou des trous dans les locks : un travail de fond est nécessaire.' },
]
export const findReparation = (id) => REPARATIONS.find((r) => r.id === id) ?? null

/**
 * Textes et règles du site réglables depuis le dashboard (« Textes et règles du site »). Dans un titre, un mot entouré
 * d'astérisques est mis en valeur. Valeurs d'origine ci-dessous ; le catalogue du serveur les remplace (applyCatalogue).
 * Les trois cartes « savoir-faire » et les quatre étapes sont les tableaux de editorial.js (modifiés en place).
 */
export const SITE = {
  accueil: { titre: 'Locks, small locks et *micro-locks* à Abidjan.', bouton: 'Réserver mon rendez-vous', lien: 'Nos services et tarifs' },
  approche: { eyebrow: 'Le savoir-faire', titre: 'Une affaire de *geste*, de tension et de régularité.', lien: 'Découvrir le salon', valeurs: editorialValeurs },
  etapes: { eyebrow: 'Comment ça marche', titre: 'Votre demande en *quatre temps*', liste: editorialEtapes },
  invitation: { titre: 'Prête pour de beaux locks ?', texte: 'Choisissez installation, resserrage ou réparation, puis votre jour et votre heure.' },
  invitationGalerie: { titre: 'Une coiffure vous inspire ?', texte: 'Ouvrez la photo, choisissez « Réserver cette coiffure », puis indiquez s’il s’agit d’une installation, d’un resserrage ou d’une réparation.' },
  pages: {
    services: { eyebrow: 'Nos services', titre: 'Locks, small locks et *micro-locks*.', intro: 'Trois types de locks, une grille tarifaire claire et un engagement : le travail des racines et des tiges.' },
    galerie: { eyebrow: 'Nos coiffures', titre: 'Les *coiffures* du salon.', intro: 'Ouvrez une photo en grand, puis demandez un rendez-vous pour la coiffure qui vous plaît : installation, resserrage ou réparation.' },
    apropos: { eyebrow: 'À propos', titre: 'L’art du soin capillaire *texturé*.' },
    contact: { eyebrow: 'Contact', titre: 'Écrivez-*nous*, appelez-nous.', intro: 'Pour une question avant de réserver, ou pour modifier une demande déjà envoyée (rappelez alors votre référence).' },
    rendezvous: { eyebrow: 'Rendez-vous', titre: 'Demandez votre *rendez-vous*.', intro: 'Étape par étape : votre profil, votre consultation, votre besoin, puis le jour et l’heure qui vous conviennent.' },
  },
  sections: {
    types: { eyebrow: 'Nos services', titre: 'Trois types de locks, *un même savoir-faire*', lien: 'Voir tous les tarifs' },
    galerie: { eyebrow: 'Nos coiffures', titre: 'Des réalisations qui *parlent d’elles-mêmes*', lien: 'Toutes les coiffures' },
    avis: { eyebrow: 'Avis de clientes', titre: 'Elles en parlent *mieux que nous*' },
    bonASavoir: { eyebrow: 'Bon à savoir', titre: 'Notre engagement *envers vous*' },
    grille: { eyebrow: 'Grille tarifaire', titre: 'Resserrage de locks : *des tarifs clairs*', intro: 'Nos tarifs dépendent du type de vos locks, du volume de vos cheveux et du délai depuis votre dernière séance. Le volume est le critère qui influence le plus la durée et le prix.' },
    introuvable: { titre: 'Cette page s’est *défaite*.', texte: 'L’adresse demandée n’existe pas ou n’existe plus. Revenez à l’accueil ou demandez directement un rendez-vous.' },
  },
  /** Titre et description de chaque page pour Google et les partages (WhatsApp, Facebook). */
  seo: {
    home: { title: 'Beauté Halal — Locks, Small Locks et Micro-Locks à Abidjan', description: 'Spécialiste des locks et soins capillaires texturés à Abidjan. Installation, resserrage et réparation de locks traditionnelles, small locks et micro-locks. Prise de rendez-vous en ligne.' },
    services: { title: 'Nos services — Beauté Halal', description: 'Locks traditionnelles, small locks et micro-locks : grille tarifaire du resserrage selon le volume, le délai et l’état de vos locks. Réservez en ligne.' },
    gallery: { title: 'Nos coiffures — Beauté Halal', description: 'Les coiffures réalisées par le salon : locks traditionnelles, small locks et micro-locks. Réservez celle qui vous plaît.' },
    about: { title: 'À propos — Beauté Halal', description: 'Le salon Beauté Halal : notre savoir-faire, notre équipe et notre engagement pour la santé de vos locks.' },
    booking: { title: 'Rendez-vous — Beauté Halal', description: 'Choisissez installation, resserrage ou réparation, votre jour et votre heure, puis validez votre rendez-vous.' },
    contact: { title: 'Contact — Beauté Halal', description: 'Coordonnées du salon Beauté Halal. Écrivez-nous par formulaire, téléphone ou WhatsApp.' },
  },
  pied: { rendezvous: 'Choisissez votre besoin, puis le jour et l’heure qui vous conviennent : votre rendez-vous est validé dès le paiement de l’avance.' },
  /** Conditions de rendez-vous : à accepter avant de payer. */
  conditions: {
    title: 'Conditions de rendez-vous',
    lines: [
      'Le versement de l’avance valide automatiquement votre rendez-vous.',
      'Cette avance n’est pas remboursable, quel que soit le motif d’annulation, même si vous prévenez quelques heures avant.',
      'L’heure que vous choisissez est un engagement : en cas de retard, le salon peut annuler ou déplacer votre rendez-vous.',
    ],
    accept: 'J’ai lu et j’accepte les conditions de rendez-vous.',
  },
  /** Lecture des tailles (diamètre de la lock) : affichée au choix du type de locks. */
  tailles: {
    title: 'Comment lire les tailles ?',
    lines: [
      'Micro-locks : 0,2 cm à 0,4 cm (les 0,4 cm sont un peu plus larges que les 0,2 cm).',
      'Small locks : 0,6 cm à 0,8 cm.',
      'À partir de 1 cm : locks traditionnelles (dreadlocks).',
    ],
  },
  /**
   * Heures proposées selon le profil. Le calendrier du salon reste la source : on ne montre que les heures libres
   * qui correspondent à la règle ; si le salon n'a défini aucune de ces heures, toutes ses heures libres sont proposées.
   */
  creneaux: {
    consultation: ['10:00'],
    nouvelle: ['10:00'],
    ancienneResserrage: ['09:00'],
    autres: ['14:00', '14:30'],
  },
}
export const TAILLES_AIDE = SITE.tailles
export const CONDITIONS = SITE.conditions
export const CRENEAUX_PROFIL = SITE.creneaux
export function creneauxPourProfil({ consultation: pourConsultation = false, customerKind = '', besoin = '' } = {}) {
  if (pourConsultation) return CRENEAUX_PROFIL.consultation
  if (customerKind === 'nouvelle') return besoin && besoin !== 'creation' ? CRENEAUX_PROFIL.autres : CRENEAUX_PROFIL.nouvelle
  if (customerKind === 'ancienne') return besoin === 'resserrage' ? CRENEAUX_PROFIL.ancienneResserrage : CRENEAUX_PROFIL.autres
  return null
}

/** Les prestations de la nouvelle logique (nom + description), présentées sur les coiffures. */
export const PRESTATIONS = [
  { id: 'creation', name: 'Installation de locks', description: 'Installation de vos locks de A à Z, dans le type choisi (traditionnelles, small ou micro-locks).' },
  { id: 'resserrage', name: 'Resserrage complet', description: 'Racines et tiges retravaillées jusqu’à la maturation complète de vos locks (environ 2 ans).' },
  { id: 'racines', name: 'Reprise de racines seule', description: 'Uniquement la repousse au niveau du cuir chevelu, pour les locks matures ou sur demande (−30 %).' },
  { id: 'reparation', name: 'Réparation', description: 'Remise en état des locks abîmées ou fragilisées, partielle ou globale : tarif indicatif selon l’ampleur des dégâts.' },
]

/** Type de locks reconnu dans le texte d'une coiffure (titre / description) ; sinon null — rien n'est deviné. */
export function inferType(text = '') {
  const t = String(text).toLowerCase()
  if (/micro/.test(t)) return findType('micro')
  if (/small/.test(t)) return findType('small')
  if (/tradition|classique/.test(t)) return findType('traditionnels')
  return null
}

/** Type d'une coiffure : celui de sa catégorie (slug ou nom, au cas où le slug a été renommé), sinon celui lu dans son texte. */
export function resolveType(item) {
  if (!item) return null
  const cat = item.category ?? {}
  return findType(item.typeId) ?? inferType(`${cat.slug ?? ''} ${cat.name ?? ''}`) ?? inferType(`${item.title ?? ''} ${item.description ?? ''}`)
}

const money = (n) => `${new Intl.NumberFormat('fr-FR').format(n).replace(/[\u202f\u00a0]/g, ' ')} FCFA`

/** Texte envoyé au salon (le serveur ne porte ni volume ni délai : tout est dans le message). */
export function buildRequestMessage({ besoin, resserrage, creation, reparation = '', customer, inspiration }) {
  const lines = ['DEMANDE DE RENDEZ-VOUS (site v3)']
  if (besoin === 'creation') {
    const t = findType(creation.type)
    lines.push('Besoin : Installation de locks')
    lines.push(`Type de locks : ${t ? `${t.name} (${t.size})` : 'je ne sais pas'}`)
    if (creation.methode) lines.push(`Méthode : ${libelleMethode(creation.type, creation.methode)}`)
    lines.push(`Volume : ${findVolume(creation.volume)?.hint ?? 'à évaluer sur place'}`)
    if (creation.longueur) lines.push(`Longueur : ${creation.longueur}`)
  } else {
    const t = findType(resserrage.type)
    const f = findFormule(resserrage.formule)
    lines.push(`Besoin : ${besoin === 'reparation' ? findReparation(reparation)?.name ?? 'Réparation' : f?.label ?? 'Resserrage'}`)
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
  if (customer.desiredDate) lines.push(`Jour souhaité : ${customer.desiredDate}${customer.desiredTime ? ` à ${customer.desiredTime}` : ''}`)
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
/** Fusion en place : textes non vides, tableaux non vides, objets récursivement ; tout le reste est ignoré. */
const fusionner = (cible, source) => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return
  for (const [cle, valeur] of Object.entries(source)) {
    const actuel = cible[cle]
    if (Array.isArray(actuel)) {
      if (Array.isArray(valeur) && valeur.length) actuel.splice(0, actuel.length, ...valeur)
    } else if (actuel && typeof actuel === 'object') fusionner(actuel, valeur)
    else if (typeof actuel === 'string' && typeof valeur === 'string' && valeur.trim()) cible[cle] = valeur
  }
}
const replaceObject = (target, source) => {
  if (source && typeof source === 'object') Object.assign(target, source)
}

/** Étapes de soin : champ par champ, un texte vide ou absent garde le texte d'origine. */
const mergeSoins = (source) => {
  if (!source || typeof source !== 'object') return
  for (const [id, e] of Object.entries(source.etapes ?? {})) {
    const target = SOINS.etapes[id]
    if (!target || !e || typeof e !== 'object') continue
    for (const key of ['label', 'title']) if (typeof e[key] === 'string' && e[key].trim()) target[key] = e[key]
    if (typeof e.intro === 'string') target.intro = e.intro
  }
  for (const [bloc, values] of Object.entries(source)) {
    if (bloc === 'etapes') continue
    const target = SOINS[bloc]
    if (!target || !values || typeof values !== 'object') continue
    for (const [key, value] of Object.entries(values)) {
      if (key === 'points') {
        const points = Array.isArray(value) ? value.filter((x) => x && x.title && x.text) : []
        if (points.length) target.points = points.map((x) => ({ title: String(x.title), text: String(x.text) }))
      } else if (key === 'outro') {
        if (typeof value === 'string') target.outro = value
      } else if (typeof value === 'string' && value.trim() && key in target) target[key] = value
    }
  }
}

/**
 * Remplace la grille embarquée par celle que le salon règle dans son
 * dashboard. Les tableaux et objets sont modifiés EN PLACE (les composants en
 * gardent la référence) ; les textes sont des `let` exportés. À appeler avant
 * le montage de l'application. Un catalogue incomplet est ignoré champ par
 * champ : la grille embarquée reste le repli.
 */
/**
 * Met à jour les libellés qui ont changé (Installation de locks, Réparation, tailles en cm) quand le catalogue du serveur
 * est encore l'ancien : même règle que côté serveur — un texte n'est remplacé que s'il est encore celui d'origine,
 * ce que le salon a modifié dans le dashboard est conservé.
 */
/* Copies des libellés d'origine : applyCatalogue remplace BESOINS et PRESTATIONS en place. */
const BESOINS_INITIAUX = BESOINS.map((b) => ({ ...b }))
const PRESTATIONS_INITIALES = PRESTATIONS.map((p) => ({ ...p }))
const ANCIENNES_TAILLES = { traditionnels: ['1 cm à 1,5 cm', 'À partir de 1 cm'], small: ['0,4 cm à 0,8 cm', '0,6 cm à 0,8 cm'], micro: ['0,1 cm à 0,4 cm', '0,2 cm à 0,4 cm'] }
const normaliserTexte = (texte) => String(texte ?? '').replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase()
const ANCIENS_TEXTES = {
  creation: {
    name: ['Création complète'],
    note: ['Le tarif d’une création est annoncé par le salon après diagnostic.'],
    description: ['Création de vos locks de A à Z, dans le type choisi (traditionnels, small ou micro-locks).'],
  },
  resserrage: { text: ['Vous avez déjà des locks : resserrage complet, reprise de racines ou réparation.'] },
  reparation: { description: ['Remise en état des locks abîmées ou cassées : tarif indicatif selon l’ampleur des dégâts.'] },
}
export function rafraichirLibelles(data) {
  const sortie = { ...data }
  const remplacer = (liste, defauts, cles) =>
    Array.isArray(liste)
      ? liste.map((element) => {
          const reference = defauts.find((d) => d.id === element?.id)
          if (!reference) return element
          const copie = { ...element }
          // Comparaison tolérante : majuscules, apostrophes typographiques et espaces (insécables compris) ne comptent pas.
          for (const cle of cles) if (typeof copie[cle] === 'string' && (ANCIENS_TEXTES[element.id]?.[cle] ?? []).some((a) => normaliserTexte(a) === normaliserTexte(copie[cle]))) copie[cle] = reference[cle]
          return copie
        })
      : liste
  sortie.besoins = remplacer(data.besoins, BESOINS_INITIAUX, ['name', 'text', 'note'])
  if (Array.isArray(sortie.besoins) && !sortie.besoins.some((b) => b?.id === 'reparation')) {
    sortie.besoins = [...sortie.besoins, { ...BESOINS_INITIAUX.find((b) => b.id === 'reparation') }]
  }
  sortie.prestations = remplacer(data.prestations, PRESTATIONS_INITIALES, ['name', 'description'])
  if (Array.isArray(data.lockTypes)) {
    sortie.lockTypes = data.lockTypes.map((t) => {
      const [ancien, nouveau] = ANCIENNES_TAILLES[t?.id] ?? []
      return ancien && t.size === ancien ? { ...t, size: nouveau } : t
    })
  }
  return sortie
}

export function applyCatalogue(brut) {
  if (!brut || typeof brut !== 'object') return false
  const data = rafraichirLibelles(brut)
  if (typeof data.brand?.tagline === 'string' && data.brand.tagline) BRAND_TAGLINE = data.brand.tagline
  if (typeof data.brand?.intro === 'string' && data.brand.intro) BRAND_INTRO = data.brand.intro
  if (typeof data.engagement === 'string' && data.engagement) engagement = data.engagement
  if (typeof data.videoAdvice === 'string' && data.videoAdvice) videoAdvice = data.videoAdvice
  replaceObject(WHATSAPP, data.whatsapp)
  replaceObject(consultation, data.consultation)
  mergeSoins(data.soins)
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
  replaceArray(REPARATIONS, data.reparations)
  fusionner(SITE, data.site)
  // Photos du site réglées depuis le dashboard : bannières et À propos (les coiffures viennent des Prestations).
  for (const [page, h] of Object.entries(data.media?.heroes ?? {})) {
    if (page in heroVideo && typeof h?.video === 'string' && h.video) {
      heroVideo[page] = { src: h.video, poster: typeof h.poster === 'string' && h.poster ? h.poster : '' }
    }
    if (!(page in heroArt) || typeof h?.desktop !== 'string' || !h.desktop) continue
    heroArt[page] = h.desktop
    heroMobile.set(h.desktop, typeof h.mobile === 'string' && h.mobile ? h.mobile : h.desktop)
  }
  replaceArray(aboutPhotos, (data.media?.aboutPhotos ?? []).filter((u) => typeof u === 'string' && u))
  return true
}

/* Images du guide de réservation : une illustration par volume (XS → XL) et par longueur.
   Fichiers dans public/images/guide/ — remplaçables par de vraies photos du salon (même nom, .svg ou adapter l'extension ici). */
const slug = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().split(/\s+/)[0]
/** Photos réelles du salon associées à chaque volume (XS → XL) et à chaque longueur. */
const VOLUME_PHOTOS = {
  xs: 'micro-locks-pose',
  s: 'small-locks-profil',
  m: 'small-locks-racines-claires',
  l: 'micro-locks-boucles',
  xl: 'twists-degrade',
}
const LONGUEUR_PHOTOS = {
  courte: 'micro-locks-finition',
  moyenne: 'locks-mi-longues',
  longue: 'locks-longues-degrade',
}
/** Photo choisie par le salon (dashboard) sinon photo du salon intégrée au site. */
export const volumeImage = (id) => VOLUMES.find((v) => v.id === id)?.image || (VOLUME_PHOTOS[slug(id)] ? `/images/coiffures/${VOLUME_PHOTOS[slug(id)]}.webp` : null)
export const longueurImage = (label) => LONGUEURS.find((l) => l.label === label)?.image || (LONGUEUR_PHOTOS[slug(label)] ? `/images/coiffures/${LONGUEUR_PHOTOS[slug(label)]}.webp` : null)

