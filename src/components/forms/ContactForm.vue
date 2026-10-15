<script setup>
import { reactive, ref } from 'vue'

import FormField from '@/components/forms/FormField.vue'
import { sendContactMessage } from '@/services/api'

const form = reactive({ name: '', email: '', phone: '', message: '' })
const errors = reactive({})
const sending = ref(false)
const sent = ref(false)
const failure = ref('')

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (form.name.trim().length < 2) errors.name = 'Indiquez votre nom.'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Indiquez une adresse e-mail valide.'
  if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 8) errors.phone = 'Numéro de téléphone invalide.'
  if (form.message.trim().length < 10) errors.message = 'Votre message est un peu court (10 caractères minimum).'
  return Object.keys(errors).length === 0
}

const submit = async () => {
  if (sending.value) return
  failure.value = ''
  if (!validate()) {
    document.querySelector('.contact-form [aria-invalid="true"]')?.focus()
    return
  }
  sending.value = true
  try {
    await sendContactMessage(form)
    sent.value = true
    Object.assign(form, { name: '', email: '', phone: '', message: '' })
  } catch (error) {
    failure.value = error?.message || 'Votre message n’a pas pu être envoyé.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="sent" class="alert alert-ok" role="status">
    <p class="sent"><span class="mini-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span><span><strong>Message envoyé.</strong> Merci, le salon vous répondra par e-mail ou par téléphone.</span></p>
    <button type="button" class="btn btn-outline btn-sm" style="margin-top: 0.9rem" @click="sent = false">Envoyer un autre message</button>
  </div>

  <form v-else class="contact-form" novalidate @submit.prevent="submit">
    <FormField v-model="form.name" label="Nom complet" autocomplete="name" :error="errors.name" />
    <div class="two">
      <FormField v-model="form.email" label="E-mail" type="email" autocomplete="email" :error="errors.email" />
      <FormField v-model="form.phone" label="Téléphone" type="tel" inputmode="tel" autocomplete="tel" optional :error="errors.phone" />
    </div>
    <FormField v-model="form.message" label="Votre message" textarea :maxlength="2000" :error="errors.message" />
    <p v-if="failure" class="alert" role="alert">{{ failure }}</p>
    <button type="submit" class="btn btn-primary" :disabled="sending">
      <span v-if="sending" class="spinner" aria-hidden="true" />
      {{ sending ? 'Envoi en cours…' : 'Envoyer le message' }}
    </button>
    <p class="field-hint">Ce formulaire n’est pas une demande de rendez-vous : pour réserver, utilisez la page « Demander un rendez-vous ».</p>
  </form>
</template>

<style scoped>
.contact-form { display: grid; gap: 1.2rem; }
.sent { display: flex; align-items: flex-start; gap: 0.8rem; }
.mini-tick { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #2e8b57; animation: pop 0.6s var(--ease) both; }
.mini-tick svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.mini-tick path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw 0.5s 0.35s var(--ease) forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes pop { from { opacity: 0; transform: scale(0.4); } 60% { transform: scale(1.12); } }
.two { display: grid; gap: 1.2rem; }
@media (min-width: 640px) { .two { grid-template-columns: 1fr 1fr; } }
</style>
