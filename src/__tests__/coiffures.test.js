import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// « Nos coiffures » = les prestations gérées dans le dashboard ; les photos intégrées ne servent qu'en cas de panne totale de l'API.
const reponse = (data) => ({ ok: true, status: 200, json: async () => ({ success: true, data }) })
const prestation = (o) => ({ id: 1, slug: 'a', name: 'Locks miel', description: 'Belle', imageUrl: 'https://x.ci/a.webp', isFeatured: false, isActive: true, category: { id: 14, slug: 'traditionnels', name: 'Locks Traditionnelles' }, ...o })

beforeEach(() => {
  vi.resetModules()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

async function charger(fetchImpl) {
  vi.stubGlobal('fetch', fetchImpl)
  return import('@/services/api')
}

describe('fetchGalleryItems', () => {
  it('affiche les prestations visibles qui ont une photo', async () => {
    const api = await charger(async () =>
      reponse([
        prestation({ id: 1, name: 'Visible' }),
        prestation({ id: 2, name: 'Masquée', isActive: false }),
        prestation({ id: 3, name: 'Sans photo', imageUrl: null }),
        prestation({ id: 4, name: 'Small', category: { id: 15, slug: 'small', name: 'Small Locks' }, isFeatured: true }),
      ]),
    )
    const items = await api.fetchGalleryItems()
    expect(items.map((i) => i.title)).toEqual(['Visible', 'Small'])
    expect(items[1]).toMatchObject({ typeId: 'small', isFeatured: true, imageUrl: 'https://x.ci/a.webp' })
    expect(items[0].static).toBeUndefined()
  })

  it('filtre par type et par mise en avant', async () => {
    const api = await charger(async () =>
      reponse([
        prestation({ id: 1 }),
        prestation({ id: 4, name: 'Small', category: { id: 15, slug: 'small', name: 'Small Locks' }, isFeatured: true }),
      ]),
    )
    expect((await api.fetchGalleryItems({ category: 'small' })).map((i) => i.id)).toEqual([4])
    expect((await api.fetchGalleryItems({ featured: true })).map((i) => i.id)).toEqual([4])
  })

  it('aucune prestation avec photo → rien d’affiché : le site n’utilise que le dashboard', async () => {
    const api = await charger(async () => reponse([prestation({ imageUrl: null })]))
    expect(await api.fetchGalleryItems()).toEqual([])
  })

  it('API injoignable → photos du salon intégrées', async () => {
    const api = await charger(async () => {
      throw new Error('réseau')
    })
    const items = await api.fetchGalleryItems()
    expect(items.length).toBeGreaterThan(20)
  })
})
