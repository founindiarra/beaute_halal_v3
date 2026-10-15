<script setup>
import { ref } from 'vue'

/**
 * Bandeau de page : photo en fond, voile aubergine dégradé, titre en blanc, vague de transition.
 * Si la photo ne se charge pas, le dégradé de couleur seul reste lisible.
 */
defineProps({
  image: { type: String, default: '' },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  lede: { type: String, default: '' },
  position: { type: String, default: 'center 30%' },
  compact: { type: Boolean, default: false },
})
const failed = ref(false)
</script>

<template>
  <section class="phero on-dark" :class="{ compact }">
    <img v-if="image && !failed" v-parallax="0.12" class="bg" :src="image" alt="" fetchpriority="high" decoding="async" :style="{ objectPosition: position }" @error="failed = true" />
    <div class="veil" aria-hidden="true" />
    <div class="container content">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1><slot name="title">{{ title }}</slot></h1>
      <p v-if="lede" class="lede">{{ lede }}</p>
      <slot />
    </div>
    <svg class="wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" fill="#faf8f4" /></svg>
  </section>
</template>

<style scoped>
.phero { position: relative; isolation: isolate; margin-top: calc(var(--header-h) * -1); padding: calc(var(--header-h) + clamp(3rem, 8vw, 6rem)) 0 clamp(5rem, 10vw, 8rem); overflow: hidden; background: var(--grad-dark); }
.bg { position: absolute; left: 0; top: -14%; z-index: -2; width: 100%; height: 128%; object-fit: cover; animation: cine 2.2s var(--ease) both; }
.veil { position: absolute; inset: 0; z-index: -1; background:
  linear-gradient(180deg, rgba(24, 19, 16, 0.55) 0%, rgba(24, 19, 16, 0) 30%),
  linear-gradient(90deg, rgba(24, 19, 16, 0.92) 0%, rgba(51, 36, 26, 0.74) 45%, rgba(74, 54, 36, 0.2) 100%); }
.content { display: grid; gap: 1.3rem; max-width: calc(var(--max) + var(--gutter) * 2); }
.content > * { max-width: 40rem; animation: rise 0.95s var(--ease) both; }
.content > :nth-child(2) { animation-delay: 0.12s; }
.content > :nth-child(3) { animation-delay: 0.26s; }
.content > :nth-child(n + 4) { animation-delay: 0.4s; }
@keyframes rise { from { opacity: 0; transform: translate3d(0, 26px, 0); } }
@keyframes cine { from { scale: 1.18; } }
h1 { font-size: clamp(2.4rem, 7vw, 4.6rem); color: #fff; }
.lede { color: rgba(247, 244, 238, 0.9); }
.wave { position: absolute; left: 0; right: 0; bottom: -1px; }
.compact { padding-bottom: clamp(4rem, 8vw, 6rem); }
.compact h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); }
@media (max-width: 700px) { .veil { background: linear-gradient(180deg, rgba(24, 19, 16, 0.7), rgba(51, 36, 26, 0.78)); } }
</style>
