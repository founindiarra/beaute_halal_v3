import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})
const charger = () => import('@/data/tarifs')

describe('grille tarifaire embarquée (repli du site)', () => {
  it('3 types de locks et 5 volumes XS → XL', async () => {
    const t = await charger()
    expect(t.LOCK_TYPES.map((x) => x.id)).toEqual(['traditionnels', 'small', 'micro'])
    expect(t.VOLUMES.map((v) => v.id)).toEqual(['XS', 'S', 'M', 'L', 'XL'])
  })

  it('resserrage Small Locks M complet = 22 000 FCFA', async () => {
    const t = await charger()
    expect(t.tarifFor('small', 'M', 'complet')).toBe(22000)
  })

  it('estimation : base + délai + majoration d’état (29 400 FCFA)', async () => {
    const t = await charger()
    const e = t.estimate({ type: 'small', volume: 'M', formule: 'complet', delai: 'retard', etat: 'moyen' })
    expect(e.total).toBe(29400)
  })

  it('réparation : tarif « à partir de »', async () => {
    const t = await charger()
    expect(t.estimate({ type: 'micro', volume: '', formule: 'reparation' })).toMatchObject({ total: 70000, partial: true })
    expect(t.estimate({ type: 'micro', volume: '', formule: 'reparation', reparation: 'partielle' })).toMatchObject({ total: 35000, partial: true })
    expect(t.estimate({ type: 'small', volume: '', formule: 'reparation', reparation: 'globale' })).toMatchObject({ total: 50000, partial: true })
    expect(t.estimate({ type: 'small', volume: '', formule: 'reparation', reparation: 'inconnue' })).toBeNull()
  })

  it('combinaison incomplète ou inconnue → pas d’estimation', async () => {
    const t = await charger()
    expect(t.estimate({ type: 'inconnu', volume: 'M', formule: 'complet' })).toBeNull()
    expect(t.estimate({ type: 'small', volume: 'ZZ', formule: 'complet' })).toBeNull()
  })

  it('prix de départ par type', async () => {
    const t = await charger()
    expect(t.startingPrice('traditionnels')).toBe(10000)
    expect(t.startingPrice('micro')).toBe(20000)
  })
})

describe('vidéo de la page Rendez-vous', () => {
  it('garde la vidéo intégrée par défaut, puis prend celle du dashboard', async () => {
    const t = await charger()
    const h = await import('@/data/heroImages')
    expect(h.heroVideo.booking.src).toBe('/videos/hero/rendez-vous.mp4')
    t.applyCatalogue({ lockTypes: [], media: { heroes: { booking: { video: 'https://api.test/uploads/v.mp4', poster: '' } } } })
    expect(h.heroVideo.booking.src).toBe('https://api.test/uploads/v.mp4')
  })
})

describe('synchronisation avec le catalogue du dashboard (applyCatalogue)', () => {
  it('ignore une donnée absente ou invalide', async () => {
    const t = await charger()
    expect(t.applyCatalogue(null)).toBe(false)
    expect(t.applyCatalogue('x')).toBe(false)
    expect(t.VOLUMES).toHaveLength(5)
  })

  it('prix modifiés dans le dashboard : le site les utilise', async () => {
    const t = await charger()
    const lockTypes = structuredClone(t.LOCK_TYPES)
    lockTypes.find((x) => x.id === 'small').prices.M = [23000, 16000]
    t.applyCatalogue({ lockTypes })
    expect(t.tarifFor('small', 'M', 'complet')).toBe(23000)
  })

  it('photo d’un volume choisie dans le dashboard, sinon photo du salon intégrée', async () => {
    const t = await charger()
    expect(t.volumeImage('M')).toBe('/images/coiffures/small-locks-racines-claires.webp')
    const volumes = structuredClone(t.VOLUMES)
    volumes.find((v) => v.id === 'M').image = 'https://exemple.ci/uploads/m.webp'
    t.applyCatalogue({ volumes })
    expect(t.volumeImage('M')).toBe('https://exemple.ci/uploads/m.webp')
    expect(t.volumeImage('XS')).toBe('/images/coiffures/micro-locks-pose.webp')
  })

  it('photo d’une longueur choisie dans le dashboard', async () => {
    const t = await charger()
    const longueurs = structuredClone(t.LONGUEURS)
    longueurs[0].image = 'https://exemple.ci/uploads/courte.webp'
    t.applyCatalogue({ longueurs })
    expect(t.longueurImage(longueurs[0].label)).toBe('https://exemple.ci/uploads/courte.webp')
  })

  it('bannière d’une page remplacée (version mobile incluse), page inconnue ignorée', async () => {
    const heroes = await import('@/data/heroImages')
    const t = await charger()
    t.applyCatalogue({ media: { heroes: { contact: { desktop: '/u/c.webp', mobile: '/u/c-m.webp' }, zzz: { desktop: '/u/z.webp' } } } })
    expect(heroes.heroArt.contact).toBe('/u/c.webp')
    expect(heroes.heroMobile.get('/u/c.webp')).toBe('/u/c-m.webp')
    expect(heroes.heroArt.zzz).toBeUndefined()
  })

  it('photos « À propos » remplacées', async () => {
    const heroes = await import('@/data/heroImages')
    const t = await charger()
    t.applyCatalogue({ media: { aboutPhotos: ['/u/1.webp', '', '/u/2.webp'] } })
    expect(heroes.aboutPhotos).toEqual(['/u/1.webp', '/u/2.webp'])
  })
})

describe('étapes de soin (SOINS)', () => {
  it('applique les textes du dashboard, ignore les champs vides et garde les points valides', async () => {
    const { SOINS, applyCatalogue } = await import('@/data/tarifs')
    const avant = SOINS.locks.title
    applyCatalogue({
      soins: {
        locks: { title: '', ouiLabel: 'Oui, déjà des locks' },
        sansLocks: { points: [{ title: 'Seul point.', text: 'Texte.' }, { title: '', text: 'ignoré' }], outro: '' },
      },
    })
    expect(SOINS.locks.title).toBe(avant)
    expect(SOINS.locks.ouiLabel).toBe('Oui, déjà des locks')
    expect(SOINS.sansLocks.points).toEqual([{ title: 'Seul point.', text: 'Texte.' }])
    expect(SOINS.sansLocks.outro).toBe('')
  })

  it('applique les titres et libellés des étapes de la prise de rendez-vous', async () => {
    const { SOINS, applyCatalogue } = await import('@/data/tarifs')
    applyCatalogue({ soins: { etapes: { volume: { label: 'Densité', title: '', intro: 'Regardez la photo.' }, inconnue: { label: 'x', title: 'y', intro: '' } } } })
    expect(SOINS.etapes.volume.label).toBe('Densité')
    expect(SOINS.etapes.volume.title).toBe('Votre volume de cheveux')
    expect(SOINS.etapes.volume.intro).toBe('Regardez la photo.')
    expect(SOINS.etapes.inconnue).toBeUndefined()
  })

  it('textes et règles du site : le catalogue remplace les valeurs d’origine, un champ vide garde l’origine', async () => {
    const t = await import('@/data/tarifs')
    expect(t.SITE.accueil.titre).toContain('*micro-locks*')
    t.applyCatalogue({
      site: {
        accueil: { titre: 'Nouveau titre' },
        invitation: { titre: '   ', texte: 'Nouveau texte' },
        conditions: { lines: ['Une seule condition.'] },
        creneaux: { autres: ['15:00'], ancienneResserrage: [] },
        approche: { valeurs: [{ title: 'A', text: 'B' }] },
      },
    })
    expect(t.SITE.accueil.titre).toBe('Nouveau titre')
    expect(t.SITE.invitation.titre).toBe('Prête pour de beaux locks ?')
    expect(t.SITE.invitation.texte).toBe('Nouveau texte')
    expect(t.CONDITIONS.lines).toEqual(['Une seule condition.'])
    expect(t.CONDITIONS.title).toBe('Conditions de rendez-vous')
    expect(t.creneauxPourProfil({ customerKind: 'ancienne', besoin: 'creation' })).toEqual(['15:00'])
    expect(t.creneauxPourProfil({ customerKind: 'ancienne', besoin: 'resserrage' })).toEqual(['09:00'])
    expect(t.SITE.approche.valeurs).toEqual([{ title: 'A', text: 'B' }])
  })
})
