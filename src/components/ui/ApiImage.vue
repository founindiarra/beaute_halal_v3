<script setup>
import { ref, watch } from 'vue'

/**
 * Image issue de l'API, avec cadre à ratio fixe (pas de saut de mise en page),
 * chargement différé et repli sobre si la photo est absente ou ne se charge pas.
 */
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ratio: { type: String, default: '4 / 5' },
  eager: { type: Boolean, default: false },
  position: { type: String, default: 'center' },
})

const failed = ref(!props.src)
const loaded = ref(false)
watch(
  () => props.src,
  (v) => {
    failed.value = !v
    loaded.value = false
  },
)
</script>

<template>
  <div class="aimg" :style="{ aspectRatio: ratio }">
    <img
      v-if="!failed"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      :style="{ objectPosition: position }"
      :class="{ 'is-loaded': loaded }"
      @load="loaded = true"
      @error="failed = true"
    />
    <div v-else class="aimg-fallback" role="img" :aria-label="alt ? `${alt} — photo à venir` : 'Photo à venir'">
      <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c-7 5-7 11 0 16s7 11 0 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </div>
  </div>
</template>

<style scoped>
.aimg { position: relative; width: 100%; overflow: hidden; background: var(--paper); }
.aimg img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.6s var(--ease); }
.aimg img.is-loaded { opacity: 1; }
.aimg-fallback { position: absolute; inset: 0; display: grid; place-items: center; color: var(--caramel); background: var(--grad-soft); }
.aimg-fallback svg { width: 38%; max-width: 64px; height: auto; opacity: 0.7; }
</style>
