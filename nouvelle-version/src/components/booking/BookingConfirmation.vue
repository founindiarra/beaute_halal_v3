<script setup>
import { useSalon } from '@/composables/useSalon'
import { formatDateLong, formatDuration, formatPrice } from '@/utils/format'

/** Tout ce qui est affiché vient de la réponse du serveur (POST /appointments). */
const props = defineProps({ confirmation: { type: Object, required: true } })
defineEmits(['restart'])

const { hasWhatsapp, whatsappLink } = useSalon()
const message = () =>
  `Bonjour Beauté Halal, je viens d’envoyer une demande de rendez-vous (référence ${props.confirmation.reference}).`
</script>

<template>
  <div class="ok" role="status">
    <p class="eyebrow">Demande enregistrée</p>
    <h2>Merci{{ confirmation.firstName ? `, ${confirmation.firstName}` : '' }}. Votre demande est <em>bien reçue</em>.</h2>
    <p class="lede">
      Ce n’est pas encore une confirmation : le salon examine votre demande et vous confirme le rendez-vous. Le créneau n’est pas définitivement réservé tant que vous n’avez pas cette confirmation.
    </p>

    <dl class="recap">
      <div v-if="confirmation.reference"><dt>Référence</dt><dd class="ref">{{ confirmation.reference }}</dd></div>
      <div v-if="confirmation.serviceName"><dt>Prestation</dt><dd>{{ confirmation.serviceName }}</dd></div>
      <div v-if="confirmation.date"><dt>Date</dt><dd>{{ formatDateLong(confirmation.date) }}</dd></div>
      <div v-if="confirmation.time"><dt>Heure</dt><dd>{{ confirmation.time }}<template v-if="confirmation.durationMinutes"> · {{ formatDuration(confirmation.durationMinutes) }}</template></dd></div>
      <div v-if="confirmation.price !== undefined && confirmation.price !== null"><dt>Tarif</dt><dd>{{ formatPrice(confirmation.price, confirmation.currency) }}</dd></div>
    </dl>
    <p class="keep">Conservez cette référence : elle permet au salon de retrouver votre demande.</p>

    <div class="cta">
      <RouterLink :to="{ name: 'home' }" class="btn btn-primary">Retour à l’accueil</RouterLink>
      <a v-if="hasWhatsapp" :href="whatsappLink(message())" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Écrire au salon sur WhatsApp<span class="sr-only"> (nouvel onglet)</span></a>
      <button type="button" class="link-arrow" @click="$emit('restart')">Faire une autre demande</button>
    </div>
  </div>
</template>

<style scoped>
.ok { display: grid; gap: 1.5rem; max-width: 46rem; margin-inline: auto; padding: clamp(1.5rem, 5vw, 3rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lift); }
.recap { margin: 0.5rem 0 0; border-top: 1px solid var(--line); }
.recap > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 0.9rem 0; border-bottom: 1px solid var(--line); }
dt { color: var(--muted); }
dd { margin: 0; font-weight: 600; text-align: right; }
.ref { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.08em; color: var(--copper); font-weight: 500; }
.keep { font-size: 0.92rem; color: var(--muted); }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.5rem; }
.link-arrow { background: none; border: 0; border-bottom: 1.5px solid currentColor; cursor: pointer; }
</style>
