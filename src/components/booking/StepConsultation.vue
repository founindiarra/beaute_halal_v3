<script setup>
import { computed } from 'vue'

import ChoiceIcon from '@/components/booking/ChoiceIcon.vue'
import StepSlot from '@/components/booking/StepSlot.vue'
import { setConsultation, useBooking } from '@/composables/useBooking'
import { useSalon } from '@/composables/useSalon'
import { SOINS, WHATSAPP } from '@/data/tarifs'
import { formatPrice } from '@/utils/format'

const { state } = useBooking()
const { salon, whatsappLink } = useSalon()
const k = computed(() => state.consultation)

const telHref = computed(() => {
  const href = salon.value.phone?.href
  if (href) return href.startsWith('tel:') ? href : `tel:${href}`
  return `tel:+${WHATSAPP.number}`
})
const waMessage = computed(() => {
  const nom = [state.customer.firstName, state.customer.lastName].map((x) => x?.trim()).filter(Boolean).join(' ')
  const intro = `Bonjour Beauté Halal, je suis ${nom || 'une future cliente'} et je souhaite une consultation capillaire`
  return k.value.hasLocks
    ? `${intro} pour mes locks. Je sais qu’elle est importante pour évaluer l’état de mes racines et de mes tiges et choisir les soins adaptés à la qualité de ma coiffure. Quand pouvons-nous la faire ?`
    : `${intro} avant de commencer mes locks. Je sais qu’elle est importante pour connaître ma texture, ma densité et choisir le type de locks adapté, afin de préserver la santé de mes cheveux. Quand pouvons-nous la faire ?`
})
const waHref = computed(() => whatsappLink(waMessage.value) || `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(waMessage.value)}`)
const fee = computed(() => salon.value.consultationFee)

const ignorer = () => setConsultation({ want: false, hasLocks: null, mode: 'ignoree', date: '', time: '' })
const faire = () => setConsultation({ want: true, hasLocks: null, mode: '', date: '', time: '' })
const setLocks = (v) => setConsultation({ hasLocks: v, mode: '', date: '', time: '' })
const setMode = (m) => setConsultation({ mode: m, ...(m !== 'sur_place' ? { date: '', time: '' } : {}) })
const recommencer = () => setConsultation({ want: null, hasLocks: null, mode: '', date: '', time: '' })
</script>

<template>
  <div class="consult">
    <!-- 1. Faire ou ignorer -->
    <fieldset v-if="k.want === null" class="ask">
      <legend>{{ SOINS.propose.title }}</legend>
      <p class="sub">{{ SOINS.propose.text }}</p>
      <div class="choices">
        <button type="button" class="choice" @click="faire">
          <ChoiceIcon name="leaf" />
          <span><strong>{{ SOINS.propose.faireLabel }}</strong><small>{{ SOINS.propose.faireHint }}</small></span>
        </button>
        <button type="button" class="choice" @click="ignorer">
          <ChoiceIcon name="skip" />
          <span><strong>{{ SOINS.propose.ignorerLabel }}</strong><small>{{ SOINS.propose.ignorerHint }}</small></span>
        </button>
      </div>
    </fieldset>

    <!-- Consultation ignorée -->
    <div v-else-if="k.want === false" class="done">
      <p>{{ SOINS.propose.ignoreeMessage }}</p>
      <button type="button" class="linkish" @click="recommencer">Finalement, je préfère une consultation</button>
    </div>

    <!-- 2. Avez-vous des locks ? -->
    <fieldset v-else-if="k.hasLocks === null" class="ask">
      <legend>{{ SOINS.locks.title }}</legend>
      <p class="sub">{{ SOINS.locks.text }}</p>
      <div class="choices">
        <button type="button" class="choice" @click="setLocks(true)">
          <ChoiceIcon name="check" />
          <span><strong>{{ SOINS.locks.ouiLabel }}</strong><small>{{ SOINS.locks.ouiHint }}</small></span>
        </button>
        <button type="button" class="choice" @click="setLocks(false)">
          <ChoiceIcon name="sparkle" />
          <span><strong>{{ SOINS.locks.nonLabel }}</strong><small>{{ SOINS.locks.nonHint }}</small></span>
        </button>
      </div>
      <button type="button" class="linkish" @click="recommencer">← Revenir</button>
    </fieldset>

    <!-- 3. Comment consulter -->
    <template v-else>
      <fieldset class="ask">
        <legend>{{ SOINS.modes.title }}</legend>
        <div class="modes">
          <a class="choice" :class="{ on: k.mode === 'telephone' }" :href="telHref" @click="setMode('telephone')">
            <ChoiceIcon name="phone" />
            <span><strong>{{ SOINS.modes.telephoneLabel }}</strong><small>{{ SOINS.modes.telephoneHint }}</small></span>
          </a>
          <a class="choice" :class="{ on: k.mode === 'whatsapp' }" :href="waHref" target="_blank" rel="noopener noreferrer" @click="setMode('whatsapp')">
            <ChoiceIcon name="chat" />
            <span><strong>{{ SOINS.modes.whatsappLabel }}</strong><small>{{ SOINS.modes.whatsappHint }}<span class="sr-only"> (nouvel onglet)</span></small></span>
          </a>
          <button type="button" class="choice" :class="{ on: k.mode === 'sur_place' }" @click="setMode('sur_place')">
            <ChoiceIcon name="calendar" />
            <span><strong>{{ SOINS.modes.placeLabel }}</strong><small>{{ SOINS.modes.placeHint }}</small></span>
          </button>
        </div>
        <p v-if="k.mode === 'telephone' || k.mode === 'whatsapp'" class="status ok" role="status">
          <span aria-hidden="true">✓</span>
          {{ SOINS.modes.confirmation }}
        </p>
      </fieldset>

      <StepSlot v-if="k.mode === 'sur_place'" target="consultation" />

      <button type="button" class="linkish" @click="recommencer">← Modifier mes choix de consultation</button>
    </template>

    <p v-if="k.want === null && fee" class="fee">Dans tous les cas, {{ formatPrice(fee) }} sont réglés en ligne pour confirmer votre rendez-vous (consultation en salon ou prestation choisie).</p>
  </div>
</template>

<style scoped>
.consult { display: grid; gap: 1.4rem; }
.ask { border: 0; padding: 0; margin: 0; display: grid; gap: 1rem; min-width: 0; }
.ask legend { padding: 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; }
.sub { color: var(--muted); margin-top: -0.3rem; }
.choices, .modes { display: grid; gap: 0.9rem; }
.done { display: grid; gap: 0.4rem; padding: 1.1rem 1.3rem; background: var(--grad-soft); border-radius: 18px; }
.done p { margin: 0; }
.linkish { justify-self: start; background: none; border: 0; padding: 0; min-height: 44px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font: inherit; font-weight: 600; }
.status.ok { display: flex; gap: 0.5rem; margin: 0; padding: 0.8rem 1rem; background: #eef6ee; border-radius: 14px; }
.status.ok span { color: #1f7a4a; font-weight: 800; }
.why { position: relative; display: grid; gap: 0.8rem; padding: 1.5rem 1.5rem 1.4rem 1.7rem; background: linear-gradient(160deg, #fbf6ec 0%, #f1e7d3 100%); border-radius: 22px; box-shadow: inset 0 0 0 1.5px rgba(107, 61, 36, 0.18); overflow: hidden; }
.why::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--grad-gold); }
.why-eyebrow { margin: 0; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
.why h3 { font-family: var(--font-display); font-size: 1.3rem; line-height: 1.25; }
.why p { margin: 0; line-height: 1.6; }
.why strong { font-weight: 700; }
.why .lead { color: var(--ink); }
.why ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.7rem; }
.why li { position: relative; padding-left: 1.5rem; line-height: 1.6; }
.why li::before { content: ''; position: absolute; left: 0; top: 0.55rem; width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--grad-gold); box-shadow: 0 0 0 3px rgba(229, 197, 107, 0.3); }
.fee-line { padding: 0.85rem 1.1rem; background: #fff; border-radius: 14px; box-shadow: inset 0 0 0 1.5px rgba(229, 197, 107, 0.7); }
.fee { margin: 0; font-size: 0.92rem; color: var(--muted); }
@media (max-width: 520px) { .why { padding: 1.2rem 1.1rem 1.2rem 1.3rem; } .why li { padding-left: 1.3rem; } }
@media (min-width: 640px) { .choices { grid-template-columns: 1fr 1fr; } }
@media (min-width: 900px) { .modes { grid-template-columns: repeat(3, 1fr); } }
</style>
