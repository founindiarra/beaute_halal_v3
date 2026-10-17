<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BookingConfirmation from '@/components/booking/BookingConfirmation.vue'
import CreationForm from '@/components/booking/CreationForm.vue'
import InspirationCard from '@/components/booking/InspirationCard.vue'
import SelectedTypeCard from '@/components/booking/SelectedTypeCard.vue'
import ResserragePicker from '@/components/booking/ResserragePicker.vue'
import StepDetails from '@/components/booking/StepDetails.vue'
import {
  clearInspiration,
  preselectFromGallery,
  setBesoin,
  setCreation,
  setResserrage,
  useBooking,
  validateCustomer,
} from '@/composables/useBooking'
import PageHero from '@/components/ui/PageHero.vue'
import { heroImages } from '@/data/heroImages'
import { BESOINS, WHATSAPP, estimate, findFormule, findType, findVolume } from '@/data/tarifs'
import { fetchGalleryItem } from '@/services/api'
import { formatDateLong, formatPrice, pad2 } from '@/utils/format'

const route = useRoute()
const b = useBooking()
const { state, steps } = b

const errors = reactive({})
const resolving = ref(false)
const resolveError = ref('')
const heading = ref(null)

/* Entrées possibles, portées par l'adresse (lien partageable) :
   ?coiffure=<id> depuis « Nos coiffures » · ?besoin=creation|resserrage&type=…&volume=…&formule=… depuis la grille. */
onMounted(async () => {
  const { coiffure, type, volume, formule } = route.query
  /* Le type arrive pré-rempli, mais le besoin (création / resserrage) n'est JAMAIS choisi à la place de la cliente. */
  if (findType(type)) {
    const vol = findVolume(volume) ? volume : ''
    setCreation({ type, volume: vol })
    setResserrage({ type, volume: vol, formule: findFormule(formule) ? formule : 'complet' })
  }
  if (!coiffure) return
  if (String(state.inspiration?.id) === String(coiffure)) return
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
})

const direction = ref('fwd')
watch(
  () => state.step,
  (now, before) => {
    direction.value = now >= before ? 'fwd' : 'back'
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
  if (state.step === 2) {
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
  if (result.ok) focusHeading()
}

const updateCustomer = (key, value) => {
  state.customer[key] = value
  if (errors[key]) delete errors[key]
}

const choixLabel = computed(() => {
  if (state.besoin === 'creation') {
    const c = state.creation
    if (!c.type) return null
    const t = findType(c.type)
    return [t ? t.name : 'Type à identifier avec le salon', c.volume || null, c.longueur || null].filter(Boolean).join(' · ')
  }
  if (state.besoin === 'resserrage') {
    const r = state.resserrage
    if (!r.type) return null
    const t = findType(r.type)
    if (!t) return 'Type de locks à identifier avec le salon'
    const f = findFormule(r.formule)
    return [t.name, r.formule === 'reparation' ? null : r.volume || null, f?.short].filter(Boolean).join(' · ')
  }
  return null
})

/* Le type affiché : celui du besoin choisi, sinon celui pré-rempli depuis l'accueil / la grille. */
const chosenType = computed(() => {
  const id = state.besoin === 'creation' ? state.creation.type : state.besoin === 'resserrage' ? state.resserrage.type : state.resserrage.type || state.creation.type
  return findType(id)
})
const tarifLabel = computed(() => {
  if (state.besoin !== 'resserrage') return null
  const est = state.resserrage.type ? estimate(state.resserrage) : null
  return est ? `${est.partial ? 'dès ' : ''}${formatPrice(est.total)} (indicatif)` : null
})

/* Création : Besoin, Choix, Coiffure, Jour souhaité · Resserrage : Besoin, Choix, Tarif indicatif, Coiffure, Jour souhaité. */
const summaryRows = computed(() => {
  const rows = [
    { k: 'Besoin', v: BESOINS.find((x) => x.id === state.besoin)?.name },
    { k: 'Choix', v: choixLabel.value },
  ]
  if (state.besoin === 'resserrage') rows.push({ k: 'Tarif indicatif', v: tarifLabel.value })
  rows.push({ k: 'Coiffure', v: state.inspiration?.title })
  rows.push({ k: 'Jour souhaité', v: state.customer.desiredDate ? formatDateLong(state.customer.desiredDate) : null })
  return rows
})
const stepTitle = computed(() => ({ 1: 'De quoi avez-vous besoin ?', 2: 'Vos informations', 3: 'Vérifiez votre demande' })[state.step])
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
      <PageHero :image="heroImages.booking" eyebrow="Rendez-vous" title="Demandez votre rendez-vous." lede="Trois étapes. Le salon vous confirme ensuite le jour et l’heure par téléphone ou WhatsApp." compact>
        <template #title>Demandez votre <em>rendez-vous</em>.</template>
      </PageHero>

      <section class="section-tight flow">
        <div class="container layout">
          <div class="main">
            <ol class="stepper" aria-label="Étapes de la demande">
              <li v-for="s in steps" :key="s.id" :class="{ current: state.step === s.id, done: s.id < state.step }">
                <button type="button" :disabled="s.id > b.maxReachedStep.value" :aria-current="state.step === s.id ? 'step' : undefined" @click="b.goToStep(s.id)">
                  <span class="n">{{ pad2(s.id) }}</span>
                  <span class="l">{{ s.label }}</span>
                </button>
              </li>
            </ol>

            <div class="track" aria-hidden="true"><i :style="{ transform: `scaleX(${(state.step - 1) / Math.max(1, steps.length - 1)})` }" /></div>

            <div v-if="resolving" class="alert alert-info" role="status">Chargement de votre sélection…</div>
            <div v-if="resolveError" class="alert alert-info" role="status">{{ resolveError }}</div>

 <SelectedTypeCard v-if="chosenType" :type="chosenType" :besoin="state.besoin" :resserrage="state.resserrage" @change="b.goToStep(1)" />
            <InspirationCard v-if="state.inspiration" :inspiration="state.inspiration" @clear="clearInspiration()" />

            <div class="panel">
              <h2 ref="heading" tabindex="-1" class="step-title">{{ stepTitle }}</h2>

              <Transition :name="`step-${direction}`" mode="out-in">
                <div :key="state.step" class="step-body">
                  <div v-if="state.step === 1" class="step1">
                    <div class="besoins" role="radiogroup" aria-label="Votre besoin">
                      <button v-for="x in BESOINS" :key="x.id" type="button" role="radio" class="besoin" :aria-checked="state.besoin === x.id" @click="setBesoin(x.id)">
                        <strong>{{ x.name }}</strong>
                        <span>{{ x.text }}</span>
                      </button>
                    </div>
                    <CreationForm v-if="state.besoin === 'creation'" />
                    <ResserragePicker v-else-if="state.besoin === 'resserrage'" />
                  </div>

                  <StepDetails v-else-if="state.step === 2" :customer="state.customer" :errors="errors" @update="updateCustomer" />

                  <div v-else class="review">
                    <dl>
                      <div v-for="r in summaryRows" :key="r.k" v-show="r.v"><dt>{{ r.k }}</dt><dd>{{ r.v }}</dd></div>
                      <div><dt>Nom</dt><dd>{{ state.customer.firstName }} {{ state.customer.lastName }}</dd></div>
                      <div><dt>Téléphone</dt><dd>{{ state.customer.phone }}</dd></div>
                      <div><dt>E-mail</dt><dd>{{ state.customer.email }}</dd></div>
                      <div v-if="state.customer.note.trim()"><dt>Commentaire</dt><dd class="pre">{{ state.customer.note }}</dd></div>
                    </dl>
                    <p class="alert alert-info">Vous envoyez une <strong>demande</strong> : le salon vous confirme le jour et l’heure, et annonce le tarif final avant la prestation.</p>
                  </div>
                </div>
              </Transition>

              <p v-if="state.submitError" class="alert" role="alert">{{ state.submitError }}</p>

              <div class="nav">
                <button v-if="state.step > 1" type="button" class="btn btn-outline" :disabled="state.submitting" @click="b.previous()">← Retour</button>
                <button v-if="state.step < 3" type="button" class="btn btn-primary" :disabled="!b.isStepValid(state.step) && state.step !== 2" @click="onContinue">Continuer →</button>
                <button v-else type="button" class="btn btn-copper" :disabled="state.submitting" @click="submit">
                  <span v-if="state.submitting" class="spinner" aria-hidden="true" />
                  {{ state.submitting ? 'Envoi en cours…' : 'Envoyer ma demande' }}
                </button>
              </div>
              <p class="wa">Ou contactez-nous directement sur WhatsApp <a :href="`https://wa.me/${WHATSAPP.number}`" target="_blank" rel="noopener noreferrer">{{ WHATSAPP.display }}<span class="sr-only"> (nouvel onglet)</span></a></p>
            </div>
          </div>

          <aside class="summary" aria-label="Récapitulatif de votre demande">
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
.step1 { display: grid; gap: 2rem; }
.besoins { display: grid; gap: 0.8rem; }
@media (min-width: 640px) { .besoins { grid-template-columns: 1fr 1fr; } }
.besoin { position: relative; display: grid; gap: 0.35rem; text-align: left; padding: 1.4rem 1.5rem 1.4rem 4.2rem; font: inherit; color: var(--ink); background: #fff; border: 1.5px solid rgba(24, 19, 16, 0.15); border-radius: 18px; cursor: pointer; transition: all 0.2s var(--ease); }
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

.stepper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.stepper button { display: grid; gap: 0.15rem; width: 100%; text-align: left; padding: 0.8rem 0.9rem; background: #fff; border: 0; border-radius: 16px; box-shadow: inset 0 0 0 1.5px rgba(24, 19, 16, 0.12); cursor: pointer; min-height: 44px; transition: all 0.25s var(--ease); }
.stepper button:disabled { cursor: not-allowed; opacity: 0.5; }
.stepper .current button { background: var(--grad-btn); box-shadow: var(--shadow); color: #fff; transform: translateY(-2px); }
.stepper button:hover:not(:disabled) { transform: translateY(-2px); }
.stepper .done button { box-shadow: inset 0 0 0 1.5px var(--copper); }
.n { font-family: var(--font-display); font-size: 1.15rem; color: var(--copper); }
.current .n { color: #fff; }
.l { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.03em; line-height: 1.2; }

.track { position: relative; height: 4px; margin-top: -0.5rem; border-radius: 4px; background: rgba(24, 19, 16, 0.1); overflow: hidden; }
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
.insp-note { font-size: 0.95rem; padding: 0.7rem 1rem; background: var(--grad-soft); border-radius: 14px; }
.linkish { background: none; border: 0; padding: 0 0 0 0.6rem; text-decoration: underline; cursor: pointer; color: var(--copper); }

.nav { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: space-between; padding-top: 1.4rem; border-top: 1px solid rgba(24, 19, 16, 0.1); }
.nav .btn-primary:only-child, .nav .btn-copper:only-child { margin-left: auto; }

.review dl, .summary dl { margin: 0; }
.review dl > div, .summary dl > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(24, 19, 16, 0.1); }
.review dl { margin-bottom: 1.2rem; }
dt { color: var(--muted); font-size: 0.92rem; }
dd { margin: 0; font-weight: 600; text-align: right; min-width: 0; overflow-wrap: anywhere; }
dd.empty { color: var(--muted); font-weight: 400; }
dd.pre { white-space: pre-line; font-weight: 400; }

.summary { display: none; padding: 1.6rem; background: var(--grad-soft); border-radius: var(--radius-lg); box-shadow: var(--shadow); position: sticky; top: calc(var(--header-h) + 1.5rem); }
.summary h2 { font-size: 1.5rem; margin-bottom: 0.8rem; }
@media (min-width: 1000px) {
  .layout { grid-template-columns: 1fr 22rem; gap: 2.5rem; }
  .summary { display: block; }
  .l { font-size: 0.82rem; }
}
@media (max-width: 420px) { .l { font-size: 0.66rem; } .stepper button { padding: 0.7rem 0.5rem; } }
</style>
