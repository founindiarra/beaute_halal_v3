<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import FormField from '@/components/forms/FormField.vue'
import { lookupCustomer } from '@/services/api'

const props = defineProps({
  customer: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update'])
const set = (key, value) => emit('update', key, value)

/* « Êtes-vous déjà venue ? » — même logique que les sites 1 et 2.
   Le numéro de téléphone identifie la fiche : on pose la question au lieu de deviner en silence.
   1. Aucune réponse ne mène à une impasse (numéro inconnu → on continue comme nouvelle cliente).
   2. « Première fois » reconnaît quand même un numéro déjà connu.
   3. On ne remplace jamais une saisie : seuls les champs vides sont complétés.
   4. Rien ne peut bloquer la réservation : `lookupCustomer` ne lève jamais. */

/** null = question posée · 'connue' · 'nouvelle' */
const parcours = ref(null)
const recherche = ref(false)
const reconnue = ref(null)
let dernierNumero = ''
let minuteur = null
const chiffres = (v) => String(v ?? '').replace(/\D/g, '')
const aujourdhui = new Date().toISOString().slice(0, 10)

const revelationForcee = ref(false)
watch(
  () => Object.keys(props.errors).length,
  (n) => {
    if (n > 0) revelationForcee.value = true
  },
)
const questionSansReponse = computed(() => !parcours.value && Object.keys(props.errors).length > 0)

/* Revenir depuis le récapitulatif ne repose pas la question. */
onMounted(() => {
  if (props.customer.phone?.trim() || props.customer.firstName?.trim()) parcours.value = 'nouvelle'
})

const choisir = (v) => {
  parcours.value = v
  if (v === 'connue') {
    /* Cliente connue : ni date de naissance ni commentaire, seulement Prénom, Nom et E-mail. */
    set('birthDate', '')
    set('note', '')
  }
  reconnue.value = null
  dernierNumero = ''
}
const revenirALaQuestion = () => {
  parcours.value = null
  reconnue.value = null
}
const continuerCommeNouvelle = () => {
  parcours.value = 'nouvelle'
  reconnue.value = null
}

watch(
  () => [props.customer.phone, parcours.value],
  () => {
    clearTimeout(minuteur)
    if (!parcours.value) return
    const saisie = chiffres(props.customer.phone)
    if (saisie.length < 8) {
      reconnue.value = null
      dernierNumero = ''
      return
    }
    if (saisie === dernierNumero) return
    minuteur = setTimeout(async () => {
      dernierNumero = saisie
      recherche.value = true
      try {
        const reponse = await lookupCustomer(props.customer.phone)
        if (chiffres(props.customer.phone) !== saisie) return
        reconnue.value = Boolean(reponse?.found)
        if (reponse?.found && reponse.customer) {
          if (!props.customer.firstName?.trim()) set('firstName', reponse.customer.firstName)
          if (!props.customer.lastName?.trim()) set('lastName', reponse.customer.lastName)
          if (!props.customer.email?.trim() && reponse.customer.email) set('email', reponse.customer.email)
        }
      } finally {
        recherche.value = false
      }
    }, 500)
  },
)
</script>

<template>
  <div class="details">
    <!-- La question -->
    <fieldset v-if="!parcours" class="ask">
      <legend>Êtes-vous déjà venue chez Beauté Halal&nbsp;?</legend>
      <p class="sub">Si oui, nous retrouvons vos coordonnées et vous n’avez rien à retaper.</p>
      <p v-if="questionSansReponse" class="alert" role="alert">Répondez d’abord à cette question pour continuer.</p>
      <div class="choices">
        <button type="button" class="choice" @click="choisir('connue')">
          <span class="ico" aria-hidden="true">👋</span>
          <span><strong>Oui, je suis déjà venue</strong><small>Votre numéro suffit à retrouver votre fiche.</small></span>
        </button>
        <button type="button" class="choice" @click="choisir('nouvelle')">
          <span class="ico" aria-hidden="true">✨</span>
          <span><strong>Non, c’est ma première fois</strong><small>Quelques informations et la demande est envoyée.</small></span>
        </button>
      </div>
    </fieldset>

    <!-- Le formulaire -->
    <template v-else>
      <div class="intro">
        <p>{{ parcours === 'connue' ? 'Votre numéro, et nous retrouvons le reste.' : 'Bienvenue ! Quelques informations pour traiter votre demande.' }}</p>
        <button type="button" class="linkish" @click="revenirALaQuestion">Revenir à la question</button>
      </div>

      <FormField :model-value="customer.phone" label="Téléphone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+225 00 00 00 00 00" hint="C’est lui qui identifie votre fiche au salon." :error="errors.phone" @update:model-value="set('phone', $event)" />

      <p v-if="recherche" class="status" role="status">Nous regardons si nous vous connaissons…</p>
      <p v-else-if="reconnue === true" class="status ok" role="status">
        <span aria-hidden="true">✓</span>
        {{ parcours === 'connue' ? 'Nous vous retrouvons ! Vérifiez simplement que tout est exact.' : 'Ce numéro correspond déjà à une fiche : nous avons repris vos coordonnées.' }}
      </p>
      <div v-else-if="reconnue === false && parcours === 'connue'" class="status unknown">
        <p>Nous ne retrouvons pas ce numéro. Il a peut-être changé depuis votre dernière visite.</p>
        <button type="button" class="linkish" @click="continuerCommeNouvelle">Continuer et saisir mes coordonnées</button>
      </div>

      <template v-if="parcours === 'nouvelle' || reconnue !== null || revelationForcee">
        <div class="two">
          <FormField :model-value="customer.firstName" label="Prénom" autocomplete="given-name" :error="errors.firstName" @update:model-value="set('firstName', $event)" />
          <FormField :model-value="customer.lastName" label="Nom" autocomplete="family-name" :error="errors.lastName" @update:model-value="set('lastName', $event)" />
        </div>
        <FormField :model-value="customer.email" label="E-mail" type="email" autocomplete="email" hint="La confirmation vous y est envoyée." :error="errors.email" @update:model-value="set('email', $event)" />
        <template v-if="parcours === 'nouvelle'">
          <FormField :model-value="customer.birthDate" label="Date de naissance" type="date" autocomplete="bday" optional :max="aujourdhui" hint="Pour vous souhaiter votre anniversaire. Vous pouvez laisser vide." :error="errors.birthDate" @update:model-value="set('birthDate', $event)" />
          <FormField :model-value="customer.note" label="Commentaire" textarea optional :maxlength="500" hint="Longueur de vos locks, souhait particulier…" @update:model-value="set('note', $event)" />
        </template>
        <p class="privacy">Vos informations servent uniquement à traiter votre demande de rendez-vous.</p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.details { display: grid; gap: 1.3rem; }
.two { display: grid; gap: 1.3rem; }
.privacy { font-size: 0.88rem; color: var(--muted); }

.ask { border: 0; padding: 0; margin: 0; display: grid; gap: 1rem; min-width: 0; }
.ask legend { padding: 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; }
.sub { color: var(--muted); margin-top: -0.3rem; }
.choices { display: grid; gap: 0.9rem; }
.choice { display: flex; align-items: flex-start; gap: 0.9rem; padding: 1.1rem 1.2rem; text-align: left; background: #fff; border: 1.5px solid var(--line); border-radius: 20px; cursor: pointer; min-height: 64px; transition: all 0.25s var(--ease); }
.choice:hover { border-color: var(--copper); background: var(--grad-soft); transform: translateY(-2px); box-shadow: var(--shadow); }
.choice span:last-child { display: grid; gap: 0.2rem; }
.choice small { color: var(--muted); font-size: 0.9rem; }
.ico { font-size: 1.5rem; line-height: 1; }

.intro { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; color: var(--muted); }
.linkish { background: none; border: 0; padding: 0; min-height: 44px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font-weight: 600; }
.status { margin: -0.4rem 0 0; font-size: 0.92rem; color: var(--muted); }
.status.ok { display: flex; gap: 0.5rem; color: var(--ink); }
.status.ok span { color: #1f7a4a; font-weight: 800; }
.status.unknown { display: grid; gap: 0.2rem; padding: 0.8rem 1rem; background: var(--grad-soft); border-radius: 16px; color: var(--ink); }
@media (min-width: 640px) { .two { grid-template-columns: 1fr 1fr; } .choices { grid-template-columns: 1fr 1fr; } }
</style>
