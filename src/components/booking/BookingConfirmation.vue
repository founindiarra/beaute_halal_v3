<script setup>
import { useSalon } from '@/composables/useSalon'
import { BESOINS, WHATSAPP } from '@/data/tarifs'
import { formatDateLong } from '@/utils/format'

/** Récapitulatif de ce qui vient d'être envoyé au salon (POST /contact accepté par le serveur). */
const props = defineProps({ confirmation: { type: Object, required: true } })
defineEmits(['restart'])

const { whatsappLink } = useSalon()
const besoin = () => BESOINS.find((b) => b.id === props.confirmation.besoin)?.name
const wa = () => whatsappLink(`Bonjour Beauté Halal, je viens d’envoyer une demande de rendez-vous sur le site.\n\n${props.confirmation.message}`) || `https://wa.me/${WHATSAPP.number}`
</script>

<template>
  <div class="ok" role="status">
    <span class="tick" aria-hidden="true">
      <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" /><path d="M15 27l8 8 14-16" /></svg>
    </span>
    <p class="eyebrow">Demande envoyée</p>
    <h2>Merci{{ confirmation.firstName ? `, ${confirmation.firstName}` : '' }}. Votre demande est <em>bien reçue</em>.</h2>
    <p class="lede">
      Ce n’est pas encore une confirmation : le salon examine votre demande, puis vous confirme le jour et l’heure par téléphone ou WhatsApp. Le tarif final vous est annoncé avant la prestation.
    </p>

    <dl class="recap">
      <div v-if="confirmation.reference"><dt>Référence</dt><dd>{{ confirmation.reference }}</dd></div>
      <div v-if="besoin()"><dt>Besoin</dt><dd>{{ besoin() }}</dd></div>
      <div v-if="confirmation.type"><dt>Type de locks</dt><dd>{{ confirmation.type }}</dd></div>
      <div v-if="confirmation.desiredDate"><dt>Jour souhaité</dt><dd>{{ formatDateLong(confirmation.desiredDate) }}</dd></div>
    </dl>
    <pre class="msg">{{ confirmation.message }}</pre>

    <div class="cta">
      <RouterLink :to="{ name: 'home' }" class="btn btn-primary">Retour à l’accueil</RouterLink>
      <a :href="wa()" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Compléter sur WhatsApp<span class="sr-only"> (nouvel onglet)</span></a>
      <button type="button" class="link-arrow" @click="$emit('restart')">Faire une autre demande</button>
    </div>
  </div>
</template>

<style scoped>
.tick { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: var(--grad-soft); animation: pop 0.7s var(--ease) both; box-shadow: 0 0 0 0 rgba(201, 162, 39, 0.35), var(--shadow); }
.tick svg { width: 56px; height: 56px; fill: none; stroke: var(--copper); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.tick circle { stroke-dasharray: 145; stroke-dashoffset: 145; animation: draw 0.9s 0.2s var(--ease) forwards; }
.tick path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: draw 0.5s 0.9s var(--ease) forwards; }
.ok > :not(.tick) { animation: rise 0.8s var(--ease) both; }
.ok > :nth-child(2) { animation-delay: 0.5s; }
.ok > :nth-child(3) { animation-delay: 0.6s; }
.ok > :nth-child(4) { animation-delay: 0.7s; }
.ok > :nth-child(5) { animation-delay: 0.8s; }
.ok > :nth-child(6) { animation-delay: 0.9s; }
.ok > :nth-child(7) { animation-delay: 1s; }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes pop { from { opacity: 0; transform: scale(0.5); } 60% { transform: scale(1.08); } }
@keyframes rise { from { opacity: 0; transform: translate3d(0, 18px, 0); } }
.ok { display: grid; gap: 1.5rem; max-width: 46rem; margin-inline: auto; padding: clamp(1.5rem, 5vw, 3rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lift); }
.recap { margin: 0.5rem 0 0; border-top: 1px solid var(--line); }
.recap > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 0.9rem 0; border-bottom: 1px solid var(--line); }
dt { color: var(--muted); }
dd { margin: 0; font-weight: 600; text-align: right; }
.ref { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.08em; color: var(--copper); font-weight: 500; }
.msg { margin: 0; padding: 1rem 1.2rem; font: inherit; font-size: 0.9rem; white-space: pre-wrap; color: var(--muted); background: var(--grad-soft); border-radius: 16px; }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.5rem; }
.link-arrow { background: none; border: 0; border-bottom: 1.5px solid currentColor; cursor: pointer; }
</style>
