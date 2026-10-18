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
    <span class="sk" aria-hidden="true"><i /><i /><i /></span>
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
.sk { display: grid; gap: 0.6rem; width: min(22rem, 80%); }
.sk i { display: block; height: 0.8rem; border-radius: 999px; background: linear-gradient(90deg, rgba(74, 37, 18, 0.07) 25%, rgba(124, 69, 39, 0.18) 50%, rgba(74, 37, 18, 0.07) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
.sk i:nth-child(2) { width: 80%; }
.sk i:nth-child(3) { width: 55%; }
@keyframes shimmer { to { background-position: -200% 0; } }
.ds-error { color: var(--ink); border: 1.5px dashed rgba(74, 37, 18, 0.25); border-radius: var(--radius-lg); }
</style>
