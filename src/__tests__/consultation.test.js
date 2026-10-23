import { describe, expect, it } from 'vitest'

import { ALL_STEPS, consultationValid, isConsultationSeule, parcoursCourt, stepsFor } from '@/composables/useBooking'

describe('consultation en rendez-vous : le parcours s’arrête au paiement', () => {
  it('seule la consultation en salon raccourcit le parcours', () => {
    expect(isConsultationSeule({ want: true, mode: 'sur_place' })).toBe(true)
    expect(isConsultationSeule({ want: true, mode: 'telephone' })).toBe(true)
    expect(isConsultationSeule({ want: true, mode: 'whatsapp' })).toBe(true)
    expect(isConsultationSeule({ want: false, mode: 'ignoree' })).toBe(false)
  })
  it('deux étapes dès que la consultation est choisie ; téléphone/WhatsApp rouvrent le parcours', () => {
    expect(parcoursCourt({ want: true, mode: '' })).toBe(true)
    expect(parcoursCourt({ want: true, mode: 'sur_place' })).toBe(true)
    expect(parcoursCourt({ want: true, mode: 'telephone' })).toBe(true)
    expect(parcoursCourt({ want: true, mode: 'whatsapp' })).toBe(true)
    expect(parcoursCourt({ want: false, mode: 'ignoree' })).toBe(false)
    expect(parcoursCourt({ want: null, mode: '' })).toBe(false)
  })
  it('étapes : profil + consultation seulement', () => {
    expect(stepsFor(false, '', true).map((s) => s.id)).toEqual(['profil', 'consultation'])
    expect(stepsFor(false, '', false)).toHaveLength(ALL_STEPS.length - 2)
  })
  it('le jour ET l’heure sont requis en salon', () => {
    const base = { want: true, hasLocks: true, mode: 'sur_place' }
    expect(consultationValid({ ...base, date: '2026-11-02', time: '' })).toBe(false)
    expect(consultationValid({ ...base, date: '', time: '10:00' })).toBe(false)
    expect(consultationValid({ ...base, date: '2026-11-02', time: '10:00' })).toBe(true)
  })
  it('ignorée, téléphone et WhatsApp sont valides sans jour', () => {
    expect(consultationValid({ want: false })).toBe(true)
    expect(consultationValid({ want: true, hasLocks: false, mode: 'telephone' })).toBe(true)
  })
})

import { creneauxPourProfil } from '@/data/tarifs'
import { stepsFor as stepsPourBesoin } from '@/composables/useBooking'

describe('parcours installation / resserrage / réparation', () => {
  const ids = (besoin) => stepsPourBesoin(false, besoin).map((s) => s.id)
  it('l’installation : méthode après le type, puis volume et longueur, pas de précisions', () => {
    expect(ids('creation')).toEqual(['profil', 'consultation', 'besoin', 'type', 'methode', 'volume', 'longueur', 'jour', 'recap'])
  })
  it('le resserrage garde le volume mais plus la longueur', () => {
    expect(ids('resserrage')).toEqual(['profil', 'consultation', 'besoin', 'type', 'volume', 'precisions', 'jour', 'recap'])
  })
  it('la réparation n’a ni volume ni longueur', () => {
    expect(ids('reparation')).toEqual(['profil', 'consultation', 'besoin', 'type', 'precisions', 'jour', 'recap'])
  })
  it('les heures dépendent du profil', () => {
    expect(creneauxPourProfil({ customerKind: 'nouvelle' })).toEqual(['10:00'])
    expect(creneauxPourProfil({ customerKind: 'ancienne', besoin: 'resserrage' })).toEqual(['09:00'])
    expect(creneauxPourProfil({ customerKind: 'ancienne', besoin: 'reparation' })).toEqual(['14:00', '14:30'])
    expect(creneauxPourProfil({ consultation: true })).toEqual(['10:00'])
    expect(creneauxPourProfil({})).toBeNull()
    expect(creneauxPourProfil({ customerKind: 'nouvelle', besoin: 'creation' })).toEqual(['10:00'])
    expect(creneauxPourProfil({ customerKind: 'nouvelle', besoin: 'resserrage' })).toEqual(['14:00', '14:30'])
    expect(creneauxPourProfil({ customerKind: 'ancienne', besoin: 'creation' })).toEqual(['14:00', '14:30'])
  })
})

import { BESOINS, rafraichirLibelles } from '@/data/tarifs'

describe('catalogue du serveur encore ancien', () => {
  it('« Création complète » devient « Installation de locks », la réparation s’ajoute, les tailles passent en cm', () => {
    const ancien = {
      besoins: [
        { id: 'creation', name: 'Création complète', text: 'Texte du salon', note: 'Le tarif d’une création est annoncé par le salon après diagnostic.' },
        { id: 'resserrage', name: 'Resserrage', text: 'Vous avez déjà des locks : resserrage complet, reprise de racines ou réparation.', note: 'n' },
      ],
      lockTypes: [{ id: 'small', size: '0,4 cm à 0,8 cm' }, { id: 'micro', size: '0,5 cm perso' }],
    }
    const neuf = rafraichirLibelles(ancien)
    expect(neuf.besoins.map((b) => b.id)).toEqual(['creation', 'resserrage', 'reparation'])
    expect(neuf.besoins[0].name).toBe('Installation de locks')
    expect(neuf.besoins[0].text).toBe('Texte du salon')
    expect(neuf.besoins[1].text).not.toMatch(/réparation/)
    expect(neuf.lockTypes[0].size).toBe('0,6 cm à 0,8 cm')
    expect(neuf.lockTypes[1].size).toBe('0,5 cm perso')
    expect(BESOINS.length).toBeGreaterThanOrEqual(3)
  })

  it('reconnaît les variantes d’écriture d’un ancien libellé (majuscules, espace insécable, apostrophe droite)', () => {
    const neuf = rafraichirLibelles({
      besoins: [
        { id: 'creation', name: '  CRÉATION\u00a0Complète ', text: 't', note: 'Le tarif d\'une création est annoncé par le salon après diagnostic.' },
        { id: 'resserrage', name: 'Resserrage', text: 'Vous avez déjà des locks :  resserrage complet, reprise de racines ou réparation. ', note: 'n' },
      ],
    })
    expect(neuf.besoins[0].name).toBe('Installation de locks')
    expect(neuf.besoins[0].note).toMatch(/installation/)
    expect(neuf.besoins[1].text).not.toMatch(/réparation/)
    expect(neuf.besoins.map((b) => b.id)).toEqual(['creation', 'resserrage', 'reparation'])
  })
})
