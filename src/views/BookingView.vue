<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BookingConfirmation from '@/components/booking/BookingConfirmation.vue'
import InspirationCard from '@/components/booking/InspirationCard.vue'
import SelectedTypeCard from '@/components/booking/SelectedTypeCard.vue'
import StepConsultation from '@/components/booking/StepConsultation.vue'
import StepProfil from '@/components/booking/StepProfil.vue'
import StepPrecisions from '@/components/booking/StepPrecisions.vue'
import StepSlot from '@/components/booking/StepSlot.vue'
import StepMethode from '@/components/booking/StepMethode.vue'
import StepType from '@/components/booking/StepType.vue'
import StepLongueur from '@/components/booking/StepLongueur.vue'
import StepVolume from '@/components/booking/StepVolume.vue'
import {
  clearInspiration,
  clearTypeChoice,
  preselectFromGallery,
  currentType,
  setBesoin,
  setConditionsOk,
  setResserrage,
  setType,
  setTypeLocked,
  setVolume,
  useBooking,
  validateCustomer,
} from '@/composables/useBooking'
import PageHero from '@/components/ui/PageHero.vue'
import { heroArt, heroVideo } from '@/data/heroImages'
import { libelleMethode } from '@/data/methodes'
import { useSalon } from '@/composables/useSalon'
import { BESOINS, CONDITIONS, SITE, SOINS, WHATSAPP, estimate, findFormule, findReparation, findType, findVolume } from '@/data/tarifs'
import { fetchGalleryItem } from '@/services/api'
import { formatDateLong, formatPrice, pad2 } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const b = useBooking()
const { state, steps, maxReachedIndex, isLast, consultationSeule } = b
const { salon } = useSalon()
const stepIndex = computed(() => steps.value.findIndex((x) => x.id === state.step))
const fee = computed(() => salon.value.consultationFee)
/* Tout le monde règle les frais avant la validation : consultation en rendez-vous ou prestation choisie. */
const mustPay = computed(() => fee.value > 0)

const errors = reactive({})
const resolving = ref(false)
const resolveError = ref('')
const heading = ref(null)

/* Entrées possibles, portées par l'adresse (lien partageable) :
   ?coiffure=<id> depuis « Nos coiffures » · ?besoin=creation|resserrage&type=…&volume=…&formule=… depuis la grille. */
const applyEntry = async () => {
  const { coiffure, type, volume, formule } = route.query
  /* Le type arrive pré-rempli, mais le besoin (création / resserrage) n'est JAMAIS choisi à la place de la cliente. */
  /* Une seule carte à la fois : la dernière entrée remplace l'ancienne (type ↔ coiffure). */
  const sameCoiffure = Boolean(coiffure) && String(state.inspiration?.id) === String(coiffure)
  if (coiffure && !findType(type) && !sameCoiffure) {
    clearTypeChoice()
    clearInspiration()
  }
  if (findType(type)) {
    clearInspiration()
    const vol = findVolume(volume) ? volume : ''
    setType(type)
    setTypeLocked(true) /* choisi depuis l'accueil ou les services : l'étape « Type de locks » est sautée */
    if (vol) setVolume(vol)
    setResserrage({ formule: findFormule(formule) ? formule : 'complet' })
  }
  if (!coiffure) return
  if (sameCoiffure) return /* déjà choisie depuis « Nos coiffures » : son type reste sélectionné */
  resolving.value = true
  resolveError.value = ''
  try {
    const item = await fetchGalleryItem(coiffure)
    if (item) preselectFromGallery(item)
    else resolveError.value = 'Cette coiffure n’est plus disponible : choisissez directement votre besoin.'
  } catch {
    resolveError.value = 'Impossible de retrouver cette coiffure : choisissez directement votre besoin.'
  } finally {
    resolving.value = false
  }
}
onMounted(applyEntry)
/* Même page, autre entrée (autre type ou autre coiffure) : on applique la nouvelle, pas de cumul. */
watch(() => route.fullPath, (to, from) => { if (to !== from && (route.query.coiffure || route.query.type)) applyEntry() })

const direction = ref('fwd')
watch(
  () => state.step,
  (now, before) => {
    const idx = (id) => steps.value.findIndex((x) => x.id === id)
    direction.value = idx(now) >= idx(before) ? 'fwd' : 'back'
  },
  { flush: 'sync' },
)

const focusHeading = async () => {
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(() => state.step, focusHeading)

const onContinue = () => {
  if (state.step === 'profil') {
    Object.keys(errors).forEach((k) => delete errors[k])
    const found = validateCustomer(state.customer)
    if (Object.keys(found).length) {
      Object.assign(errors, found)
      nextTick(() => document.querySelector('.panel [aria-invalid="true"]')?.focus())
      return
    }
  }
  b.next()
}

const submit = async () => {
  const result = await b.confirmBooking()
  if (result.ok && result.payment) {
    /* Nouvelle cliente : la demande attend son paiement, on passe à la page de paiement (Jèko). */
    const reference = result.payment.reference
    b.reset()
    router.push({ name: 'payment', params: { reference } })
    return
  }
  if (result.ok) focusHeading()
}

const updateCustomer = (key, value) => {
  state.customer[key] = value
  if (errors[key]) delete errors[key]
}

const choixLabel = computed(() => {
  const id = currentType()
  if (!id || !state.besoin) return null
  const t = findType(id)
  const vol = state.creation.volume || null
  if (state.besoin === 'creation') {
    return [t ? t.name : 'Type à identifier avec le salon', vol, state.creation.longueur || null].filter(Boolean).join(' · ')
  }
  if (!t) return 'Type de locks à identifier avec le salon'
  if (state.besoin === 'reparation') return [t.name, findReparation(state.reparation)?.name].filter(Boolean).join(' · ')
  const r = state.resserrage
  return [t.name, r.formule === 'reparation' ? null : vol, r.longueur || null, findFormule(r.formule)?.short].filter(Boolean).join(' · ')
})

/* Le type affiché : celui choisi (ou déduit de la coiffure) — dès qu'il existe, sans attendre. */
const chosenType = computed(() => findType(currentType()))
const tarifLabel = computed(() => {
  if (state.besoin !== 'resserrage' && state.besoin !== 'reparation') return null
  const attendNiveau = state.besoin === 'reparation' && !state.reparation
  const est = state.resserrage.type && !attendNiveau ? estimate({ ...state.resserrage, volume: state.creation.volume || state.resserrage.volume, reparation: state.reparation }) : null
  return est ? `${est.partial ? 'dès ' : ''}${formatPrice(est.total)} (indicatif)` : null
})

const consultLabel = computed(() => {
  const k = state.consultation
  if (k.want === null) return null
  if (!k.want) return 'Ignorée'
  const how = { telephone: 'par téléphone', whatsapp: 'par WhatsApp', sur_place: 'en salon' }[k.mode]
  if (!how) return null
  return k.mode === 'sur_place' && k.date ? `En salon · ${formatDateLong(k.date)}${k.time ? ` à ${k.time}` : ''}` : `Oui, ${how}`
})

/* Création : Besoin, Choix, Coiffure, Jour souhaité · Resserrage : Besoin, Choix, Tarif indicatif, Coiffure, Jour souhaité. */
const summaryRows = computed(() => {
  if (consultationSeule.value) {
    const k = state.consultation
    return [
      { k: 'Profil', v: state.customerKind === 'nouvelle' ? 'Nouvelle cliente' : state.customerKind === 'ancienne' ? 'Cliente de la maison' : null },
      { k: 'Consultation', v: { telephone: 'Consultation capillaire par téléphone', whatsapp: 'Consultation capillaire par WhatsApp', sur_place: 'Consultation capillaire en salon' }[k.mode] ?? null },
      ...(k.mode === 'sur_place' ? [{ k: 'Jour', v: k.date ? formatDateLong(k.date) : null }, { k: 'Heure', v: k.time || null }] : []),
    ]
  }
  const rows = [
    { k: 'Profil', v: state.customerKind === 'nouvelle' ? 'Nouvelle cliente' : state.customerKind === 'ancienne' ? 'Cliente de la maison' : null },
    { k: 'Consultation', v: consultLabel.value },
    { k: 'Besoin', v: BESOINS.find((x) => x.id === state.besoin)?.name },
    { k: 'Choix', v: choixLabel.value },
    ...(state.besoin === 'creation' ? [{ k: 'Méthode', v: libelleMethode(state.creation.type, state.creation.methode) || null }] : []),
  ]
  if (state.besoin === 'resserrage' || state.besoin === 'reparation') rows.push({ k: 'Tarif indicatif', v: tarifLabel.value })
  rows.push({ k: 'Coiffure', v: state.inspiration?.title })
  rows.push({ k: 'Jour souhaité', v: state.customer.desiredDate ? formatDateLong(state.customer.desiredDate) : null })
  rows.push({ k: 'Heure', v: state.customer.desiredTime || null })
  return rows
})
const stepTitle = computed(() => (state.step === 'precisions' && state.besoin === 'reparation' ? 'Votre réparation' : SOINS.etapes[state.step]?.title))
const stepIntro = computed(() => SOINS.etapes[state.step]?.intro)
const stepLabel = (id) => (id === 'precisions' && state.besoin === 'reparation' ? 'Réparation' : SOINS.etapes[id]?.label)
</script>

<template>
  <div>
    <section v-if="state.confirmation" class="section conf">
      <div class="container">
        <h1 ref="heading" tabindex="-1" class="sr-only">Demande envoyée</h1>
        <BookingConfirmation :confirmation="state.confirmation" @restart="b.reset()" />
      </div>
    </section>

    <template v-else>
      <PageHero :image="heroArt.booking" :video="heroVideo.booking.src" :poster="heroVideo.booking.poster" :eyebrow="SITE.pages.rendezvous.eyebrow" :title="SITE.pages.rendezvous.titre" :lede="SITE.pages.rendezvous.intro" />

      <section class="section-tight flow">
        <div class="container layout">
          <div class="main">
            <ol v-reveal class="stepper" :style="{ '--n': steps.length }" aria-label="Étapes de la demande">
              <li v-for="(s, i) in steps" :key="s.id" :class="{ current: state.step === s.id, done: i < stepIndex }">
                <button type="button" :disabled="i > maxReachedIndex" :aria-current="state.step === s.id ? 'step' : undefined" @click="b.goToStep(s.id)">
                  <span class="n">{{ pad2(i + 1) }}</span>
                  <span class="l">{{ stepLabel(s.id) || s.label }}</span>
                </button>
              </li>
            </ol>

            <div class="track" aria-hidden="true"><i :style="{ transform: `scaleX(${stepIndex / Math.max(1, steps.length - 1)})` }" /></div>

            <div v-if="resolving" class="alert alert-info" role="status">Chargement de votre sélection…</div>
            <div v-if="resolveError" class="alert alert-info" role="status">{{ resolveError }}</div>

            <SelectedTypeCard v-if="chosenType && !state.inspiration && !state.typeLocked && !['profil', 'consultation'].includes(state.step)" v-reveal.zoom :type="chosenType" :besoin="state.besoin" :resserrage="state.resserrage" @change="b.goToStep('type')" />
            <InspirationCard v-if="state.inspiration" v-reveal.zoom :inspiration="state.inspiration" @clear="clearInspiration()" />

            <div v-reveal="120" class="panel">
              <p class="step-count">Étape {{ stepIndex + 1 }} sur {{ steps.length }}</p>
              <h2 ref="heading" tabindex="-1" class="step-title">{{ stepTitle }}</h2>
              <p v-if="stepIntro" class="step-intro">{{ stepIntro }}</p>

              <Transition :name="`step-${direction}`" mode="out-in">
                <div :key="state.step" class="step-body">
                  <StepProfil v-if="state.step === 'profil'" :customer="state.customer" :errors="errors" @update="updateCustomer" />
                  <StepConsultation v-else-if="state.step === 'consultation'" />
                  <div v-else-if="state.step === 'besoin'" class="step1">
                    <div class="besoins" role="radiogroup" aria-label="Votre besoin">
                      <button v-for="x in BESOINS" :key="x.id" type="button" role="radio" class="besoin" :aria-checked="state.besoin === x.id" @click="setBesoin(x.id)">
                        <strong>{{ x.name }}</strong>
                        <span>{{ x.text }}</span>
                      </button>
                    </div>
                  </div>
                  <StepType v-else-if="state.step === 'type'" />
                  <StepMethode v-else-if="state.step === 'methode'" />
                  <StepVolume v-else-if="state.step === 'volume'" />
                  <StepLongueur v-else-if="state.step === 'longueur'" />
                  <StepPrecisions v-else-if="state.step === 'precisions'" />
                  <StepSlot v-else-if="state.step === 'jour'" />

                  <div v-else class="review">
                    <dl>
                      <div v-for="r in summaryRows" :key="r.k" v-show="r.v"><dt>{{ r.k }}</dt><dd>{{ r.v }}</dd></div>
                      <div><dt>Nom</dt><dd>{{ state.customer.firstName }} {{ state.customer.lastName }}</dd></div>
                      <div><dt>Téléphone</dt><dd>{{ state.customer.phone }}</dd></div>
                      <div><dt>E-mail</dt><dd>{{ state.customer.email }}</dd></div>
                      <div v-if="state.customer.note.trim()"><dt>Commentaire</dt><dd class="pre">{{ state.customer.note }}</dd></div>
                    </dl>
                    <p v-if="mustPay" class="paynote">Pour confirmer votre rendez-vous, <strong>{{ formatPrice(fee) }}</strong> sont réglés en ligne juste avant la validation. En validant, vous passez à la page de paiement ; votre rendez-vous est confirmé après le paiement, avec une notification par SMS, e-mail et WhatsApp.</p>
                  </div>
                </div>
              </Transition>

              <fieldset v-if="isLast" class="conditions">
                <legend>{{ CONDITIONS.title }}</legend>
                <ul><li v-for="(l, i) in CONDITIONS.lines" :key="i">{{ l }}</li></ul>
                <label class="accept"><input type="checkbox" :checked="state.conditionsOk" @change="setConditionsOk($event.target.checked)" /> <span>{{ CONDITIONS.accept }}</span></label>
              </fieldset>

              <p v-if="state.submitError" class="alert" role="alert">{{ state.submitError }}</p>

              <div class="nav">
                <button v-if="stepIndex > 0" type="button" class="btn btn-outline" :disabled="state.submitting" @click="b.previous()">← Retour</button>
                <button v-if="!isLast" type="button" class="btn btn-primary" :disabled="!b.isStepValid(state.step) && state.step !== 'profil'" @click="onContinue">Continuer →</button>
                <button v-else type="button" class="btn btn-copper" :disabled="state.submitting || !state.conditionsOk || !b.isStepValid(state.step)" @click="submit">
                  <span v-if="state.submitting" class="spinner" aria-hidden="true" />
                  {{ state.submitting ? 'Envoi en cours…' : consultationSeule && mustPay ? `Passer au paiement · ${formatPrice(fee)}` : mustPay ? `Valider et payer ${formatPrice(fee)}` : 'Envoyer ma demande' }}
                </button>
              </div>
              <p class="wa">Ou contactez-nous directement sur WhatsApp <a :href="`https://wa.me/${WHATSAPP.number}`" target="_blank" rel="noopener noreferrer">{{ WHATSAPP.display }}<span class="sr-only"> (nouvel onglet)</span></a></p>
            </div>
          </div>

          <aside v-reveal.right="220" class="summary" aria-label="Récapitulatif de votre demande">
            <h2>Votre demande</h2>
            <dl>
              <div v-for="r in summaryRows" :key="r.k">
                <dt>{{ r.k }}</dt>
                <dd :class="{ empty: !r.v }">{{ r.v || '—' }}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.step-body { min-width: 0; }
.step-intro { margin: -0.4rem 0 1.2rem; color: var(--muted); }
.step1 { display: grid; gap: 2rem; }
.besoins { display: grid; gap: 0.8rem; }
@media (min-width: 640px) { .besoins { grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); } }
.conditions { display: grid; gap: 0.7rem; margin: 1.2rem 0 0; padding: 1rem 1.2rem; border: 0; background: #fbf6ec; border-radius: 16px; box-shadow: inset 0 0 0 1.5px rgba(107, 61, 36, 0.18); }
.conditions legend { padding: 0 0.3rem; font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; }
.conditions ul { margin: 0; padding-left: 1.2rem; display: grid; gap: 0.4rem; line-height: 1.55; }
.accept { display: flex; align-items: flex-start; gap: 0.6rem; min-height: 44px; font-weight: 700; cursor: pointer; }
.accept input { width: 1.3rem; height: 1.3rem; margin-top: 0.15rem; accent-color: var(--copper); flex: none; }
.besoin { position: relative; display: grid; gap: 0.35rem; text-align: left; padding: 1.4rem 1.5rem 1.4rem 4.2rem; font: inherit; color: var(--ink); background: #fff; border: 1.5px solid rgba(50, 24, 15, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.2s var(--ease); }
.besoin::before { content: ''; position: absolute; left: 1.4rem; top: 1.5rem; width: 1.6rem; height: 1.6rem; border-radius: 50%; border: 2px solid var(--copper); transition: all 0.25s var(--ease); }
.besoin[aria-checked='true']::before { border-color: #fff; background: radial-gradient(circle, #fff 0 38%, transparent 42%); }
.besoin:hover { border-color: var(--copper); transform: translateY(-3px); box-shadow: var(--shadow); }
.besoin[aria-checked='true'] { background: var(--grad-btn); border-color: transparent; color: #fff; box-shadow: var(--shadow); }
.besoin strong { font-family: var(--font-display); font-size: 1.25rem; }
.besoin span { font-size: 0.92rem; opacity: 0.85; }
.wa { margin-top: 1.2rem; font-size: 0.92rem; color: var(--muted); }
.wa a { color: var(--copper); font-weight: 700; }
.conf { padding-top: calc(var(--header-h) + 2rem); }
.layout { display: grid; gap: 2rem; align-items: start; }
.main { display: grid; gap: 1.5rem; min-width: 0; }

.stepper { display: grid; grid-template-columns: repeat(var(--n, 7), 1fr); gap: 0.35rem; }
.stepper button { display: grid; gap: 0.15rem; width: 100%; text-align: left; padding: 0.8rem 0.9rem; background: #fff; border: 0; border-radius: 16px; box-shadow: inset 0 0 0 1.5px rgba(50, 24, 15, 0.12); cursor: pointer; min-height: 44px; transition: all 0.25s var(--ease); }
.stepper button:disabled { cursor: not-allowed; opacity: 0.5; }
.stepper .current button { background: var(--grad-btn); box-shadow: var(--shadow); color: #fff; transform: translateY(-2px); }
.stepper button:hover:not(:disabled) { transform: translateY(-2px); }
.stepper .done button { box-shadow: inset 0 0 0 1.5px var(--copper); }
.n { font-family: var(--font-display); font-size: 1.15rem; color: var(--copper); }
.current .n { color: #fff; }
.l { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em; line-height: 1.2; }

.track { position: relative; height: 4px; margin-top: -0.5rem; border-radius: 4px; background: rgba(50, 24, 15, 0.1); overflow: hidden; }
.track i { position: absolute; inset: 0; border-radius: 4px; background: var(--grad); transform-origin: left; transition: transform 0.7s var(--ease); }
.step-fwd-enter-active, .step-back-enter-active { transition: opacity 0.45s var(--ease), transform 0.45s var(--ease); }
.step-fwd-leave-active, .step-back-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-fwd-enter-from { opacity: 0; transform: translate3d(36px, 0, 0); }
.step-fwd-leave-to { opacity: 0; transform: translate3d(-24px, 0, 0); }
.step-back-enter-from { opacity: 0; transform: translate3d(-36px, 0, 0); }
.step-back-leave-to { opacity: 0; transform: translate3d(24px, 0, 0); }
.panel { display: grid; gap: 1.8rem; padding: clamp(1.3rem, 4vw, 2.6rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.step-title { font-size: clamp(1.6rem, 3.6vw, 2.3rem); scroll-margin-top: calc(var(--header-h) + 12px); }
.step-title:focus { outline: none; }
.step-count { margin: 0 0 -1.2rem; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--copper); }
.panel { position: relative; overflow: hidden; }
.panel::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: var(--grad-gold); }
.insp-note { font-size: 0.95rem; padding: 0.7rem 1rem; background: var(--grad-soft); border-radius: 14px; }
.linkish { background: none; border: 0; padding: 0 0 0 0.6rem; text-decoration: underline; cursor: pointer; color: var(--copper); }

.nav { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: space-between; padding-top: 1.4rem; border-top: 1px solid rgba(50, 24, 15, 0.1); }
.nav .btn-primary:only-child, .nav .btn-copper:only-child { margin-left: auto; }

.review dl, .summary dl { margin: 0; }
.review dl > div, .summary dl > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(50, 24, 15, 0.1); }
.review dl { margin-bottom: 1.2rem; }
.paynote { margin: 0; padding: 0.9rem 1.1rem; background: var(--grad-soft); border-radius: 16px; font-size: 0.95rem; line-height: 1.55; }
dt { color: var(--muted); font-size: 0.92rem; }
dd { margin: 0; font-weight: 600; text-align: right; min-width: 0; overflow-wrap: anywhere; }
dd.empty { color: var(--muted); font-weight: 400; }
dd.pre { white-space: pre-line; font-weight: 400; }

.summary { display: none; padding: 1.6rem; background: var(--grad-soft); border-radius: var(--radius-lg); box-shadow: var(--shadow); position: sticky; top: calc(var(--header-h) + 1.5rem); }
.summary h2 { font-size: 1.5rem; margin-bottom: 0.8rem; }
@media (min-width: 1000px) {
  .layout { grid-template-columns: 1fr 22rem; gap: 2.5rem; }
  .summary { display: block; }
  .l { font-size: 0.72rem; }
}
@media (max-width: 760px) { .stepper button { padding: 0.55rem 0.2rem; justify-items: center; text-align: center; } .l { display: none; } .current .l { display: none; } .n { font-size: 1rem; } }
@media (max-width: 760px) { .stepper { position: relative; } }
</style>
