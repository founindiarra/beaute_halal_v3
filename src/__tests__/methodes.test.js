import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

describe('méthodes de pose (installation de locks)', () => {
  it('chaque type propose ses méthodes, avec les libellés du salon', async () => {
    const m = await import('@/data/methodes')
    expect(m.methodesDuType('micro').methodes.map((x) => x.label)).toEqual(['Micro interlocking', 'Micro braid', 'Micro twist', 'Broderie'])
    expect(m.methodesDuType('small').methodes.map((x) => x.label)).toEqual(['Small interlocking', 'Small micro braid', 'Small micro twist', 'Small broderie'])
    expect(m.methodesDuType('traditionnels').methodes.map((x) => x.label)).toEqual(['Broderie', 'Twist', 'Braid', 'Interlocking'])
  })

  it('chaque méthode porte un conseil ; broderie = cheveux épais, interlocking traditionnel = locks fines', async () => {
    const m = await import('@/data/methodes')
    for (const t of ['micro', 'small', 'traditionnels']) {
      for (const x of m.methodesDuType(t).methodes) expect(x.conseil.length).toBeGreaterThan(10)
    }
    expect(m.methodesDuType('micro').methodes.find((x) => x.id === 'broderie').conseil).toMatch(/épais/)
    expect(m.methodesDuType('traditionnels').methodes.find((x) => x.id === 'interlocking').conseil).toMatch(/fines/)
  })

  it('type inconnu : les quatre méthodes génériques', async () => {
    const m = await import('@/data/methodes')
    expect(m.methodesDuType('inconnu').methodes.map((x) => x.id)).toEqual(['interlocking', 'braid', 'twist', 'broderie'])
  })
})

describe('parcours : l’étape « Méthode » vient juste après le type, pour une installation seulement', () => {
  it('installation : profil, consultation, besoin, type, méthode, volume, longueur, jour, récap', async () => {
    const { stepsFor } = await import('@/composables/useBooking')
    expect(stepsFor(false, 'creation').map((s) => s.id)).toEqual(['profil', 'consultation', 'besoin', 'type', 'methode', 'volume', 'longueur', 'jour', 'recap'])
  })
  it('type choisi depuis une coiffure : l’étape type est sautée, pas la méthode', async () => {
    const { stepsFor } = await import('@/composables/useBooking')
    const ids = stepsFor(true, 'creation').map((s) => s.id)
    expect(ids).not.toContain('type')
    expect(ids.indexOf('methode')).toBeGreaterThan(ids.indexOf('besoin'))
  })
  it('resserrage et réparation : pas de méthode', async () => {
    const { stepsFor } = await import('@/composables/useBooking')
    expect(stepsFor(false, 'resserrage').map((s) => s.id)).not.toContain('methode')
    expect(stepsFor(false, 'reparation').map((s) => s.id)).not.toContain('methode')
  })
  it('validation : une méthode du type (ou « le salon me conseille ») est requise ; changer de type la réinitialise', async () => {
    const b = await import('@/composables/useBooking')
    b.setBesoin('creation')
    b.setType('micro')
    const { isStepValid, state } = b.useBooking()
    expect(isStepValid('methode')).toBe(false)
    b.setMethode('interlocking')
    expect(isStepValid('methode')).toBe(true)
    b.setType('small')
    expect(state.creation.methode).toBe('')
    expect(isStepValid('methode')).toBe(false)
    b.setMethode('conseil')
    expect(isStepValid('methode')).toBe(true)
    b.setMethode('colle')
    expect(isStepValid('methode')).toBe(false)
  })
  it('le message de secours cite la méthode', async () => {
    const t = await import('@/data/tarifs')
    const msg = t.buildRequestMessage({ besoin: 'creation', resserrage: {}, creation: { type: 'micro', methode: 'braid', volume: 'M', longueur: '' }, customer: { firstName: 'A', lastName: 'B', phone: '1', desiredDate: '' } })
    expect(msg).toContain('Méthode : Micro braid')
  })
})
