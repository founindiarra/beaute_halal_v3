<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BookingConfirmation from '@/components/booking/BookingConfirmation.vue'
import StepDateTime from '@/components/booking/StepDateTime.vue'
import StepDetails from '@/components/booking/StepDetails.vue'
import StepService from '@/components/booking/StepService.vue'
import {
  clearInspiration,
  preselectFromGallery,
  preselectService,
  useBooking,
  validateCustomer,
} from '@/composables/useBooking'
import PageHero from '@/components/ui/PageHero.vue'
import { heroImages } from '@/data/heroImages'
import { fetchGalleryItem, fetchService } from '@/services/api'
import { formatDateLong, formatDuration, formatPrice, pad2 } from '@/utils/format'

const route = useRoute()
const b = useBooking()
const { state, steps } = b

const errors = reactive({})
const resolving = ref(false)
const resolveError = ref('')
const heading = ref(null)

/* Deux entrées possibles, toutes deux portées par l'adresse (lien partageable, survit au rechargement) :
   ?coiffure=<id> depuis « Coiffures » · ?prestation=<slug> depuis « Prestations ». */
onMounted(async () => {
  const { coiffure, prestation } = route.query
  if (!coiffure && !prestation) return
  resolving.value = true
  resolveError.value = ''
  try {
    if (coiffure) {
      if (state.inspiration?.id === Number(coiffure) || String(state.inspiration?.id) === String(coiffure)) return
      const item = await fetchGalleryItem(coiffure)
      if (item) preselectFromGallery(item)
      else resolveError.value = 'Cette coiffure n’est plus disponible : choisissez directement une prestation.'
    } else if (state.service?.slug !== prestation) {
      const service = await fetchService(prestation)
      if (service) preselectService(service)
    }
  } catch {
    resolveError.value = 'Impossible de retrouver votre sélection : choisissez directement une prestation.'
  } finally {
    resolving.value = false
  }
})

const focusHeading = async () => {
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(() => state.step, focusHeading)

const onContinue = () => {
  if (state.step === 3) {
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

const summaryRows = computed(() => [
  { k: 'Prestation', v: state.service?.name },
  { k: 'Date', v: state.date ? formatDateLong(state.date) : null },
  { k: 'Heure', v: state.time },
  { k: 'Durée', v: state.service?.durationMinutes ? formatDuration(state.service.durationMinutes) : null },
  { k: 'Tarif', v: state.service ? formatPrice(state.service.price, state.service.currency) : null },
])
const stepTitle = computed(
  () =>
    ({
      1: 'Quelle prestation souhaitez-vous ?',
      2: 'Quand souhaitez-vous venir ?',
      3: 'Vos informations',
      4: 'Vérifiez votre demande',
    })[state.step],
)
</script>

<template>
  <div>
    <section v-if="state.confirmation" class="section conf">
      <div class="container">
        <h1 ref="heading" tabindex="-1" class="sr-only">Demande enregistrée</h1>
        <BookingConfirmation :confirmation="state.confirmation" @restart="b.reset()" />
      </div>
    </section>

    <template v-else>
      <PageHero :image="heroImages.booking" eyebrow="Rendez-vous" title="Réservez votre moment." lede="Quatre étapes, moins de deux minutes. Le salon confirme ensuite votre demande." compact>
        <template #title>Réservez votre <em>moment</em>.</template>
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

            <div v-if="resolving" class="alert alert-info" role="status">Chargement de votre sélection…</div>
            <div v-if="resolveError" class="alert alert-info" role="status">{{ resolveError }}</div>

            <div class="panel">
              <h2 ref="heading" tabindex="-1" class="step-title">{{ stepTitle }}</h2>

              <div v-if="state.inspiration && state.step !== 3" class="insp-note">
                Coiffure choisie : <strong>{{ state.inspiration.title }}</strong>
                <button type="button" class="linkish" @click="clearInspiration()">retirer</button>
              </div>

              <StepService v-if="state.step === 1" :selected="state.service" @select="b.selectService" />

              <StepDateTime
                v-else-if="state.step === 2"
                :service-id="state.service?.id ?? null"
                :date="state.date"
                :time="state.time"
                :refresh-key="state.availabilityVersion"
                @select-date="b.selectDate"
                @select-time="b.selectTime"
              />

              <StepDetails
                v-else-if="state.step === 3"
                :customer="state.customer"
                :errors="errors"
                :inspiration="state.inspiration"
                @update="updateCustomer"
                @clear-inspiration="clearInspiration()"
              />

              <div v-else class="review">
                <dl>
                  <div v-for="r in summaryRows" :key="r.k" v-show="r.v"><dt>{{ r.k }}</dt><dd>{{ r.v }}</dd></div>
                  <div><dt>Nom</dt><dd>{{ state.customer.firstName }} {{ state.customer.lastName }}</dd></div>
                  <div><dt>Téléphone</dt><dd>{{ state.customer.phone }}</dd></div>
                  <div><dt>E-mail</dt><dd>{{ state.customer.email }}</dd></div>
                  <div v-if="state.customer.note.trim()"><dt>Commentaire</dt><dd class="pre">{{ state.customer.note }}</dd></div>
                </dl>
                <p class="alert alert-info">Vous envoyez une <strong>demande</strong> : le rendez-vous n’est définitif qu’après confirmation du salon. Tarif et durée sont ceux de la prestation, vérifiés par le salon.</p>
              </div>

              <p v-if="state.submitError" class="alert" role="alert">{{ state.submitError }}</p>

              <div class="nav">
                <button v-if="state.step > 1" type="button" class="btn btn-outline" :disabled="state.submitting" @click="b.previous()">← Retour</button>
                <button v-if="state.step < 4" type="button" class="btn btn-primary" :disabled="!b.isStepValid(state.step) && state.step !== 3" @click="onContinue">
                  Continuer →
                </button>
                <button v-else type="button" class="btn btn-copper" :disabled="state.submitting" @click="submit">
                  <span v-if="state.submitting" class="spinner" aria-hidden="true" />
                  {{ state.submitting ? 'Envoi en cours…' : 'Envoyer ma demande' }}
                </button>
              </div>
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
.conf { padding-top: calc(var(--header-h) + 2rem); }
.layout { display: grid; gap: 2rem; align-items: start; }
.main { display: grid; gap: 1.5rem; min-width: 0; }

.stepper { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.stepper button { display: grid; gap: 0.15rem; width: 100%; text-align: left; padding: 0.8rem 0.9rem; background: #fff; border: 0; border-radius: 16px; box-shadow: inset 0 0 0 1.5px rgba(42, 21, 32, 0.12); cursor: pointer; min-height: 44px; transition: all 0.25s var(--ease); }
.stepper button:disabled { cursor: not-allowed; opacity: 0.5; }
.stepper .current button { background: var(--grad-btn); box-shadow: var(--shadow); color: #fff; }
.stepper .done button { box-shadow: inset 0 0 0 1.5px var(--copper); }
.n { font-family: var(--font-display); font-size: 1.15rem; color: var(--copper); }
.current .n { color: #fff; }
.l { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.03em; line-height: 1.2; }

.panel { display: grid; gap: 1.6rem; padding: clamp(1.3rem, 4vw, 2.6rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.step-title { font-size: clamp(1.6rem, 3.6vw, 2.3rem); scroll-margin-top: calc(var(--header-h) + 12px); }
.step-title:focus { outline: none; }
.insp-note { font-size: 0.95rem; padding: 0.7rem 1rem; background: var(--grad-soft); border-radius: 14px; }
.linkish { background: none; border: 0; padding: 0 0 0 0.6rem; text-decoration: underline; cursor: pointer; color: var(--copper); }

.nav { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: space-between; padding-top: 1.4rem; border-top: 1px solid rgba(42, 21, 32, 0.1); }
.nav .btn-primary:only-child, .nav .btn-copper:only-child { margin-left: auto; }

.review dl, .summary dl { margin: 0; }
.review dl > div, .summary dl > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(42, 21, 32, 0.1); }
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
