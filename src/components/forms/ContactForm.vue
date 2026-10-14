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
    <p><strong>Message envoyé.</strong> Merci, le salon vous répondra par e-mail ou par téléphone.</p>
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
.two { display: grid; gap: 1.2rem; }
@media (min-width: 640px) { .two { grid-template-columns: 1fr 1fr; } }
</style>
