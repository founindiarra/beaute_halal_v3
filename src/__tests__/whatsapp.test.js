import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Le numéro WhatsApp du salon (+225 05 66 15 74 32) est la seule source de tous les liens WhatsApp du site.
const NUMERO = '2250566157432'

vi.mock('@/services/api', () => ({ fetchSalon: vi.fn() }))

beforeEach(() => {
  vi.resetModules()
})

async function charger() {
  const tarifs = await import('@/data/tarifs')
  const salon = await import('@/composables/useSalon')
  const api = await import('@/services/api')
  return { tarifs, salon, api }
}

describe('numéro WhatsApp du salon', () => {
  it('est +225 05 66 15 74 32 par défaut', async () => {
    const { tarifs } = await charger()
    expect(tarifs.WHATSAPP).toEqual({ display: '+225 05 66 15 74 32', number: NUMERO })
  })

  it('alimente le lien WhatsApp, avec ou sans message', async () => {
    const { salon, api } = await charger()
    api.fetchSalon.mockResolvedValue({ name: 'Beauté Halal' })
    const { whatsappLink, hasWhatsapp } = salon.useSalon()
    expect(hasWhatsapp.value).toBe(true)
    expect(whatsappLink()).toBe(`https://wa.me/${NUMERO}`)
    expect(whatsappLink('Bonjour Beauté Halal')).toBe(`https://wa.me/${NUMERO}?text=${encodeURIComponent('Bonjour Beauté Halal')}`)
  })

  it('ne dépend plus du numéro des paramètres du salon (un seul numéro partout)', async () => {
    const { salon, api } = await charger()
    api.fetchSalon.mockResolvedValue({ name: 'Beauté Halal', whatsapp: { number: '22500000000000', available: true } })
    await salon.loadSalon({ force: true })
    expect(salon.useSalon().whatsappLink()).toBe(`https://wa.me/${NUMERO}`)
  })

  it('peut être changé depuis le catalogue du dashboard (Tarifs → contact)', async () => {
    const { tarifs, salon } = await charger()
    expect(tarifs.applyCatalogue({ whatsapp: { display: '+225 07 00 00 00 00', number: '2250700000000' } })).toBe(true)
    expect(salon.useSalon().whatsappLink()).toBe('https://wa.me/2250700000000')
  })

  it('un catalogue sans numéro garde celui par défaut', async () => {
    const { tarifs, salon } = await charger()
    tarifs.applyCatalogue({ volumes: [] })
    expect(salon.useSalon().whatsappLink()).toBe(`https://wa.me/${NUMERO}`)
  })

  it('aucun numéro wa.me écrit en dur dans le code du site', () => {
    const racine = join(process.cwd(), 'src')
    const fichiers = []
    const parcourir = (dir) => {
      for (const nom of readdirSync(dir)) {
        const chemin = join(dir, nom)
        if (statSync(chemin).isDirectory()) {
          if (nom !== '__tests__') parcourir(chemin)
        } else if (/\.(vue|js)$/.test(nom)) fichiers.push(chemin)
      }
    }
    parcourir(racine)
    const fautifs = fichiers.filter((f) => /wa\.me\/\d/.test(readFileSync(f, 'utf8')))
    expect(fautifs).toEqual([])
  })
})
