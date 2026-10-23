<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { SOINS, WHATSAPP } from '@/data/tarifs'
import { useBooking } from '@/composables/useBooking'
import { useSalon } from '@/composables/useSalon'
import { fetchPaymentStatus, initiatePayment } from '@/services/api'
import { capitalize, formatDateLong, formatPrice } from '@/utils/format'

/**
 * Paiement de la consultation (nouvelles clientes) : montant + moyen de paiement, puis redirection vers la page Jèko
 * où la cliente saisit son numéro et valide. Le retour sur cette page ne vaut jamais confirmation : on relit l'état
 * côté serveur (confirmé par Jèko) avant d'annoncer quoi que ce soit.
 */
const route = useRoute()
const reference = computed(() => String(route.params.reference || '').toUpperCase())
const retour = computed(() => route.query.retour === '1')
const echec = computed(() => route.query.echec === '1')
const { whatsappLink } = useSalon()
const booking = useBooking()

const MOYENS = [
  { id: 'wave', name: 'Wave' },
  { id: 'orange', name: 'Orange Money' },
  { id: 'mtn', name: 'MTN MoMo' },
  { id: 'moov', name: 'Moov Money' },
  { id: 'djamo', name: 'Djamo' },
]

const loading = ref(true)
const loadError = ref('')
const info = ref(null)
const method = ref('')
const submitting = ref(false)
const payError = ref('')
/* Retour de Jèko : on affiche tout de suite « confirmation en cours », sans passer par « Chargement… ». */
const waiting = ref(retour.value && !echec.value)
const timedOut = ref(false)
let timer = null
let tries = 0

const paid = computed(() => info.value?.payment?.status === 'paid')
const amount = computed(() => info.value?.payment?.amount ?? 0)
const mustPay = computed(() => Boolean(info.value?.payment?.required) && !paid.value)
/* Consultation prise en rendez-vous : le parcours s'arrête ici ; les explications sur les soins sont sur cette page. */
const seule = computed(() => Boolean(info.value?.consultationOnly))
const afficherSoins = computed(() => info.value?.consultation && info.value.consultation.mode !== 'ignoree')
const soinsOuvert = ref(false)
/** Logos des moyens de paiement : /public/images/payment/<id>.webp ; absent → seul le nom s'affiche. */
const logoKo = ref({})
const logoSrc = (id) => `/images/payment/${id}.webp`
const bloc = computed(() => (info.value?.consultation?.hasLocks ? SOINS.avecLocks : SOINS.sansLocks))
const quand = computed(() => {
  const k = info.value?.consultation
  const date = k?.date || info.value?.desiredDate
  const time = k?.date ? k.time : info.value?.desiredTime
  if (!date) return ''
  return `${capitalize(formatDateLong(date))}${time ? ` à ${String(time).slice(0, 5)}` : ''}`
})
/* Jèko non configuré : la page s'affiche quand même, sans moyen de paiement. */
const indisponible = computed(() => info.value?.payment?.available === false)

const load = async ({ verifier = false } = {}) => {
  try {
    info.value = await fetchPaymentStatus(reference.value, { verifier })
    loadError.value = ''
  } catch (error) {
    loadError.value = error?.status === 404 ? 'Aucune demande ne correspond à cette référence.' : 'Impossible de lire l’état du paiement pour le moment.'
  }
}

const poll = async () => {
  await load({ verifier: true })
  if (loadError.value && !info.value) {
    waiting.value = false
    return
  }
  if (paid.value) {
    waiting.value = false
    booking.reset()
    return
  }
  tries += 1
  if (tries >= 40) {
    waiting.value = false
    timedOut.value = true
    return
  }
  timer = setTimeout(poll, 3000)
}

onMounted(async () => {
  if (waiting.value) {
    // Retour de Jèko : le serveur relit tout de suite le statut chez Jèko, sans attendre le webhook.
    loading.value = false
    await poll()
    return
  }
  await load()
  loading.value = false
  if (paid.value) booking.reset()
})

/** « Vérifier à nouveau » après l'attente : on relance la confirmation sans refaire payer. */
const reverifier = () => {
  timedOut.value = false
  waiting.value = true
  tries = 0
  poll()
}
onBeforeUnmount(() => clearTimeout(timer))

const pay = async () => {
  if (!method.value || submitting.value) return
  submitting.value = true
  payError.value = ''
  try {
    const r = await initiatePayment(reference.value, method.value)
    if (r?.redirectUrl) window.location.href = r.redirectUrl
    else payError.value = 'Le paiement n’a pas pu être démarré. Réessayez.'
  } catch (error) {
    const detail = Array.isArray(error?.details) ? error.details.map((d) => d?.message).filter(Boolean).slice(0, 3).join(' ') : ''
    payError.value = `${error?.message || 'Le paiement n’a pas pu être démarré. Réessayez.'}${detail ? ` ${detail}` : ''}`
  } finally {
    submitting.value = false
  }
}

const wa = computed(() => whatsappLink(indisponible.value ? `Bonjour Beauté Halal, le paiement en ligne n’est pas disponible. Je souhaite confirmer ma demande ${reference.value}.` : `Bonjour Beauté Halal, j’ai une question sur le paiement de ma demande ${reference.value}.`) || `https://wa.me/${WHATSAPP.number}`)
</script>

<template>
  <div>
    <section class="section-tight top">
      <div class="container wrap">
        <h1 class="sr-only">{{ seule ? 'Paiement de votre consultation' : 'Paiement pour confirmer votre rendez-vous' }}</h1>
        <div class="card">
          <!-- Retour de Jèko : on attend la confirmation serveur -->
          <div v-if="waiting && !paid" class="wait" role="status">
            <span class="spinner" aria-hidden="true" />
            <h2>Nous confirmons votre paiement…</h2>
            <p>Cela prend quelques secondes. Ne fermez pas cette page.</p>
          </div>

          <p v-else-if="loading" class="hint" role="status">Chargement…</p>
          <p v-else-if="loadError" class="alert" role="alert">{{ loadError }}</p>

          <!-- Payé -->
          <div v-else-if="paid" class="ok" role="status">
            <span class="tick" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" /><path d="M15 27l8 8 14-16" /></svg></span>
            <h2>Paiement reçu{{ info.firstName ? `, merci ${info.firstName}` : '' }} !</h2>
            <p v-if="seule">Votre consultation <strong>{{ info.reference }}</strong> est réservée{{ quand ? ` : ${quand}` : '' }}. Une confirmation vous est envoyée par SMS, e-mail et WhatsApp. Il n’y a rien d’autre à faire : à très bientôt au salon.</p>
            <p v-else>Votre rendez-vous <strong>{{ info.reference }}</strong> est validé{{ quand ? ` : ${quand}` : '' }}. Une confirmation vous est envoyée par SMS, e-mail et WhatsApp. L’avance versée n’est pas remboursable ; en cas de retard, le salon peut annuler ou déplacer votre rendez-vous.</p>
            <div class="cta"><RouterLink :to="{ name: 'home' }" class="btn btn-primary">Retour à l’accueil</RouterLink></div>
          </div>

          <!-- Aucun paiement à régler -->
          <div v-else-if="!mustPay" class="ok">
            <h2>Aucun paiement à régler</h2>
            <p v-if="info.payment.status === 'none' && !info.payment.required">Votre demande <strong>{{ info.reference }}</strong> est enregistrée : le salon vous confirme le jour et l’heure par téléphone ou WhatsApp.</p>
            <div class="cta"><RouterLink :to="{ name: 'home' }" class="btn btn-primary">Retour à l’accueil</RouterLink></div>
          </div>

          <!-- À payer -->
          <div v-else class="pay">
            <RouterLink :to="{ name: 'booking' }" class="back" :aria-disabled="submitting" @click="submitting && $event.preventDefault()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
              Retour à ma demande
            </RouterLink>
            <p class="eyebrow">Demande {{ info.reference }}</p>
            <h2>{{ seule ? 'Consultation capillaire' : 'Confirmez votre rendez-vous' }}</h2>
            <p v-if="seule && quand" class="when">{{ quand }}</p>
            <p v-else-if="!seule" class="sub">Réglez {{ formatPrice(amount) }} pour valider votre rendez-vous{{ quand ? ` du ${quand}` : '' }} : il est validé automatiquement dès le paiement.</p>
            <p class="sub">Cette avance n’est pas remboursable, quel que soit le motif d’annulation.</p>
            <p class="amount">{{ formatPrice(amount) }}</p>

            <aside v-if="afficherSoins && bloc" class="why" :class="{ open: soinsOuvert }">
              <button type="button" class="why-head" :aria-expanded="soinsOuvert" aria-controls="why-body" @click="soinsOuvert = !soinsOuvert">
                <span class="why-title">L’importance des soins capillaires</span>
                <span class="why-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg></span>
                <span class="sr-only">{{ soinsOuvert ? 'Masquer' : 'Afficher' }} l’explication</span>
              </button>
              <div v-show="soinsOuvert" id="why-body" class="why-body">
                <h3>{{ bloc.title }}</h3>
                <p class="lead">{{ bloc.lead }}</p>
                <ul>
                  <li v-for="(point, i) in bloc.points" :key="i"><strong>{{ point.title }}</strong> {{ point.text }}</li>
                </ul>
                <p v-if="bloc.outro" class="lead">{{ bloc.outro }}</p>
              </div>
            </aside>

            <p v-if="echec" class="alert" role="alert">Le paiement n’a pas abouti. Aucun montant n’a été retenu pour cette tentative : vous pouvez réessayer.</p>
            <div v-else-if="timedOut" class="alert alert-info" role="status">
              <p>Votre paiement n’est pas encore confirmé. S’il a été débité, ne payez pas une seconde fois : patientez un peu puis vérifiez à nouveau.</p>
              <button type="button" class="btn btn-copper recheck" @click="reverifier">Vérifier à nouveau</button>
            </div>

            <div v-if="indisponible" class="alert alert-info unavailable" role="status">
              <p><strong>Le paiement en ligne n’est pas disponible pour le moment.</strong></p>
              <p>Votre demande <strong>{{ info.reference }}</strong> est enregistrée mais pas encore confirmée : le salon a été prévenu. Contactez-le sur WhatsApp en indiquant cette référence pour régler et confirmer.</p>
              <a class="btn btn-copper" :href="wa" target="_blank" rel="noopener noreferrer">Écrire au salon sur WhatsApp<span class="sr-only"> (nouvel onglet)</span></a>
            </div>

            <fieldset v-if="!indisponible" class="methods">
              <legend>Moyen de paiement</legend>
              <div role="radiogroup" aria-label="Moyen de paiement" class="grid">
                <button v-for="m in MOYENS" :key="m.id" type="button" role="radio" class="m" :aria-checked="method === m.id" @click="method = m.id">
                  <span v-if="!logoKo[m.id]" class="logo"><img :src="logoSrc(m.id)" alt="" loading="lazy" decoding="async" @error="logoKo[m.id] = true" /></span>
                  <span class="mname">{{ m.name }}</span>
                </button>
              </div>
            </fieldset>
            <p v-if="!indisponible" class="sub">Vous serez redirigée vers la page sécurisée de Jèko : vous y saisissez le numéro qui paie et validez, le montant est prélevé automatiquement.</p>

            <p v-if="payError" class="alert" role="alert">{{ payError }}</p>
            <button v-if="!indisponible" type="button" class="btn btn-copper go" :disabled="!method || submitting" @click="pay">
              <span v-if="submitting" class="spinner" aria-hidden="true" />
              {{ submitting ? 'Redirection…' : `Payer ${formatPrice(amount)}` }}
            </button>
            <p class="help">Un souci ? <a :href="wa" target="_blank" rel="noopener noreferrer">Écrivez-nous sur WhatsApp<span class="sr-only"> (nouvel onglet)</span></a></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.top { padding-top: calc(var(--header-h) + 2rem); background: var(--grad-soft); min-height: 70vh; }
.wrap { max-width: 40rem; }
.card { display: grid; gap: 1.2rem; padding: clamp(1.4rem, 5vw, 2.6rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lift); }
.back { display: inline-flex; align-items: center; gap: 0.3rem; min-height: 44px; padding-right: 0.6rem; color: var(--copper); font-weight: 700; text-decoration: none; }
.back svg { width: 1.2rem; height: 1.2rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.back:hover { text-decoration: underline; text-underline-offset: 4px; }
.pay, .ok, .wait { display: grid; gap: 1.1rem; justify-items: start; }
.wait { justify-items: center; text-align: center; }
.recheck { margin-top: 0.7rem; }
.amount { font-family: var(--font-display); font-size: clamp(2.2rem, 7vw, 3.2rem); color: var(--copper); line-height: 1; }
.methods { border: 0; padding: 0; margin: 0; display: grid; gap: 0.7rem; width: 100%; min-width: 0; }
.methods legend { padding: 0; font-weight: 700; margin-bottom: 0.4rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 0.6rem; }
.m { display: grid; justify-items: center; align-content: center; gap: 0.4rem; min-height: 52px; padding: 0.6rem 1rem; font: inherit; font-weight: 700; color: var(--ink); background: #fff; border: 1.5px solid var(--line); border-radius: 14px; cursor: pointer; transition: all 0.2s var(--ease); }
.logo { display: flex; align-items: center; justify-content: center; width: 100%; height: 2.8rem; overflow: hidden; border-radius: 10px; background: #fff; box-shadow: inset 0 0 0 1px rgba(50, 24, 15, 0.08); }
.logo img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; }
.m:hover { border-color: var(--copper); transform: translateY(-2px); }
.m[aria-checked='true'] { background: #fbf6ec; color: var(--ink); border-color: var(--copper); box-shadow: 0 0 0 2px var(--copper), var(--shadow); }
.when { margin: 0; font-weight: 700; font-size: 1.1rem; }
.unavailable p { margin: 0; }
.unavailable { display: grid; gap: 0.7rem; justify-items: start; width: 100%; }
.why { position: relative; display: grid; gap: 0.2rem; width: 100%; padding: 1.4rem 1.4rem 1.3rem 1.7rem; background: linear-gradient(160deg, #fbf6ec 0%, #f1e7d3 100%); border-radius: 22px; box-shadow: inset 0 0 0 1.5px rgba(107, 61, 36, 0.18); overflow: hidden; }
.why::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--grad-gold); }
.why-head { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; min-height: 44px; cursor: pointer; }
.why-head:focus-visible { outline: 3px solid rgba(229, 197, 107, 0.7); outline-offset: 4px; border-radius: 10px; }
.why-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; line-height: 1.25; color: var(--ink); }
.why-icon { flex: none; display: grid; place-items: center; width: 2.2rem; height: 2.2rem; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 1.5px rgba(107, 61, 36, 0.25); transition: transform 0.25s var(--ease); }
.why-icon svg { width: 1.2rem; height: 1.2rem; fill: none; stroke: var(--copper); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.why.open .why-icon { transform: rotate(180deg); }
.why-body { display: grid; gap: 0.8rem; }
.why-eyebrow { margin: 0; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
.why h3 { font-family: var(--font-display); font-size: 1.25rem; line-height: 1.25; }
.why p { margin: 0; line-height: 1.6; }
.why ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.6rem; }
.why li { line-height: 1.6; }
.sub, .help { margin: 0; color: var(--muted); font-size: 0.92rem; }
.help a { color: var(--copper); font-weight: 700; }
.go { width: 100%; justify-content: center; }
.tick { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: var(--grad-soft); }
.tick svg { width: 56px; height: 56px; fill: none; stroke: var(--copper); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.cta { display: flex; flex-wrap: wrap; gap: 1rem; }
</style>
