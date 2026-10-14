<script setup>
import FormField from '@/components/forms/FormField.vue'

defineProps({
  customer: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  inspiration: { type: Object, default: null },
})
const emit = defineEmits(['update', 'clear-inspiration'])
const set = (key, value) => emit('update', key, value)
</script>

<template>
  <div class="details">
    <div v-if="inspiration" class="insp">
      <img v-if="inspiration.imageUrl" :src="inspiration.imageUrl" :alt="inspiration.title" width="72" height="72" />
      <p><span class="k">Coiffure choisie</span><strong>{{ inspiration.title }}</strong></p>
      <button type="button" class="btn btn-outline btn-sm" @click="$emit('clear-inspiration')">Retirer</button>
    </div>

    <div class="two">
      <FormField :model-value="customer.firstName" label="Prénom" autocomplete="given-name" :error="errors.firstName" @update:model-value="set('firstName', $event)" />
      <FormField :model-value="customer.lastName" label="Nom" autocomplete="family-name" :error="errors.lastName" @update:model-value="set('lastName', $event)" />
    </div>
    <div class="two">
      <FormField :model-value="customer.phone" label="Téléphone" type="tel" inputmode="tel" autocomplete="tel" hint="Le salon peut vous appeler pour confirmer." :error="errors.phone" @update:model-value="set('phone', $event)" />
      <FormField :model-value="customer.email" label="E-mail" type="email" autocomplete="email" hint="La confirmation vous y est envoyée." :error="errors.email" @update:model-value="set('email', $event)" />
    </div>
    <FormField :model-value="customer.note" label="Commentaire" textarea optional :maxlength="500" hint="Longueur de vos locks, souhait particulier…" @update:model-value="set('note', $event)" />
    <p class="privacy">Vos informations servent uniquement à traiter votre demande de rendez-vous.</p>
  </div>
</template>

<style scoped>
.details { display: grid; gap: 1.3rem; }
.two { display: grid; gap: 1.3rem; }
.insp { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; padding: 0.8rem; background: var(--grad-soft); border-radius: 20px; }
.insp img { width: 72px; height: 72px; object-fit: cover; border-radius: 14px; }
.insp p { display: grid; min-width: 0; }
.k { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
.privacy { font-size: 0.88rem; color: var(--muted); }
@media (min-width: 640px) { .two { grid-template-columns: 1fr 1fr; } }
</style>
