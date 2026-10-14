<script setup>
/**
 * Rend les quatre états d'un bloc alimenté par l'API :
 * chargement, erreur (avec « Réessayer »), vide, contenu (slot par défaut).
 */
defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  empty: { type: Boolean, default: false },
  loadingLabel: { type: String, default: 'Chargement…' },
  emptyLabel: { type: String, default: 'Rien à afficher pour le moment.' },
  /** Hauteur minimale réservée pendant le chargement, pour éviter les sauts de page. */
  minHeight: { type: String, default: '12rem' },
})
defineEmits(['retry'])
</script>

<template>
  <div v-if="loading" class="ds" :style="{ minHeight }" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true" />
    <span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="error" class="ds ds-error" role="alert">
    <p>{{ error }}</p>
    <button type="button" class="btn btn-outline btn-sm" @click="$emit('retry')">Réessayer</button>
  </div>
  <div v-else-if="empty" class="ds">
    <p>{{ emptyLabel }}</p>
  </div>
  <slot v-else />
</template>

<style scoped>
.ds { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2.5rem 1rem; text-align: center; color: var(--muted); }
.ds-error { color: var(--ink); border: 1.5px dashed rgba(42, 21, 32, 0.25); border-radius: var(--radius-lg); }
</style>
