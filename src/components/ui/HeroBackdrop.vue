<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { heroMobile } from '@/data/heroImages'

/**
 * Fond commun à tous les bandeaux : marron « espresso » à deux halos, deux cercles fins derrière la photo,
 * photo détourée fondue en haut et en bas, voile marron côté texte.
 */
const props = defineProps({ src: { type: String, default: '' }, eager: { type: Boolean, default: false }, lift: { type: Number, default: 1 }, disc: { type: [String, Array], default: '' }, video: { type: String, default: '' }, poster: { type: String, default: '' } })
const failed = ref(false)
const discFailed = ref(false)
/** Vidéo d'ambiance : muette, en boucle. Fichier absent, erreur ou « réduire les animations » → la photo reste affichée. */
const videoFailed = ref(false)
const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const showVideo = computed(() => Boolean(props.video) && !videoFailed.value && !reduced)
/** Plusieurs photos rondes : elles défilent en fondu (toutes les 4,5 s). */
const discs = computed(() => (Array.isArray(props.disc) ? props.disc : props.disc ? [props.disc] : []))
const current = ref(0)
let timer = null
onMounted(() => {
  if (discs.value.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    timer = setInterval(() => { current.value = (current.value + 1) % discs.value.length }, 4500)
  }
})
onBeforeUnmount(() => clearInterval(timer))
const mobileSrc = computed(() => heroMobile.get(props.src) ?? props.src.replace(/\.webp$/, '-mobile.webp'))
</script>

<template>
  <div class="bgwrap" :class="{ 'has-disc': discs.length && !discFailed, 'has-video': showVideo && (!discs.length || discFailed) }" aria-hidden="true">
    <span class="glow" />
    <span class="ring r1" />
    <span class="ring r2" />
    <template v-if="discs.length && !discFailed">
      <img v-for="(d, i) in discs" :key="d" class="disc" :class="{ slide: discs.length > 1, on: i === current }" :src="d" alt="" decoding="async" @error="discFailed = true" />
    </template>
    <div v-if="showVideo && (!discs.length || discFailed)" class="bg bgvideo">
      <video :src="video" :poster="poster || src" autoplay muted loop playsinline preload="auto" @error="videoFailed = true" />
    </div>
    <picture v-else-if="src && !failed && (!discs.length || discFailed)" class="bg" :style="{ '--zoom': lift }">
      <source media="(max-width: 1023px)" :srcset="mobileSrc" />
      <img :src="src" alt="" :fetchpriority="eager ? 'high' : 'auto'" decoding="async" @error="failed = true" />
    </picture>
    <span class="dot" />
    <span class="mini" />
    <div class="veil-x" />
    <div class="veil-y" />
  </div>
</template>

<style scoped>
.bgwrap { --r1: clamp(26rem, 74vh, 46rem); position: absolute; inset: 0; z-index: -2; overflow: hidden;
  background: radial-gradient(60rem 36rem at 85% -10%, rgba(107, 61, 36, 0.55), transparent 70%), radial-gradient(44rem 30rem at 0% 110%, rgba(176, 138, 87, 0.16), transparent 70%), #32180f; }
/* Les deux traits qui dessinent le rond derrière la photo */
.ring { position: absolute; left: 71%; top: 46%; border-radius: 50%; border: 1px solid rgba(229, 197, 107, 0.6); transform: translate(-50%, -50%); pointer-events: none; }
.r1 { width: var(--r1); aspect-ratio: 1; }
.r2 { width: calc(var(--r1) + 3.4rem); aspect-ratio: 1; border-color: rgba(229, 197, 107, 0.3); }
.bg { position: absolute; left: 0; right: 0; top: 8%; bottom: 0; display: block; -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 100%); }
.bg img, .bgvideo video { width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; transform: scale(var(--zoom, 1)); transform-origin: 50% 100%; filter: saturate(1.08) contrast(1.04) brightness(1.02); animation: cine 2.4s var(--ease) both; }
.veil-x { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(50, 24, 15, 0.9) 5%, rgba(50, 24, 15, 0.45) 40%, transparent 75%); }
.veil-y { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(50, 24, 15, 0.8) 4%, transparent 40%); }
/* Éclat : grande lueur caramel douce derrière la personne, qui respire ; petit point doré et petit rond comme sur le site de référence */
.glow { position: absolute; left: 74%; top: 44%; width: clamp(34rem, 96vh, 60rem); aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(214, 150, 92, 0.55) 0%, rgba(176, 108, 62, 0.32) 32%, rgba(107, 61, 36, 0.1) 55%, transparent 70%); pointer-events: none; animation: breathe 6s ease-in-out infinite; }
.dot { position: absolute; left: calc(71% - clamp(13rem, 36vh, 22rem)); top: 14%; width: 0.55rem; aspect-ratio: 1; border-radius: 50%; background: #e5c56b; box-shadow: 0 0 12px 2px rgba(229, 197, 107, 0.7); animation: twinkle 3.6s ease-in-out infinite; pointer-events: none; }
.mini { position: absolute; left: calc(71% - clamp(8rem, 24vh, 14rem)); top: 16%; width: 2.6rem; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(229, 197, 107, 0.8); pointer-events: none; animation: twinkle 4.6s ease-in-out 1s infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes breathe { 0%, 100% { opacity: 0.7; scale: 0.96; } 50% { opacity: 1; scale: 1.04; } }
/* Photo ronde au contour net, sans cadre ni ombre : posée dans le premier cercle */
.disc { position: absolute; left: 71%; top: 46%; width: calc(var(--r1) - 2.2rem); aspect-ratio: 1; object-fit: cover; object-position: 50% 40%; border-radius: 50%; transform: translate(-50%, -50%); animation: cine 2.4s var(--ease) both; }
/* Vidéo : posée dans le rond, comme une photo ronde. */
@media (min-width: 1024px) {
  .has-video { --r1: clamp(20rem, 46vh, 28rem); }
  .has-video .ring, .has-video .glow { top: 56%; }
  .bgvideo { inset: auto; left: 71%; right: auto; top: 56%; width: calc(var(--r1) - 2.2rem); height: auto; aspect-ratio: 1; transform: translate(-50%, -50%); -webkit-mask-image: none; mask-image: none; }
  .bgvideo video { border-radius: 50%; object-position: 50% 25%; transform: none; animation: none; }
}
@media (min-width: 1024px) {
  .has-disc { --r1: clamp(20rem, 46vh, 28rem); }
  .has-disc .ring, .has-disc .disc, .has-disc .glow { top: 56%; }
}
.disc.slide { opacity: 0; transition: opacity 1.4s ease; }
.disc.slide.on { opacity: 1; }
@keyframes cine { from { scale: 1.12; filter: blur(5px); } }
@media (max-width: 1023px) {
  /* Mobile : la photo occupe sa propre zone sous l'en-tête ; le texte vient dessous (voir --hero-img-* dans style.css). */
  .ring { left: 66%; top: var(--hero-img-mid); }
  .bgwrap { --r1: min(21rem, 92vw); }
  .disc { left: 66%; top: var(--hero-img-mid); }
  .bg { top: var(--hero-img-top); bottom: auto; height: var(--hero-img-h); -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%); mask-image: linear-gradient(to bottom, #000 62%, transparent 100%); }
  .bg img { object-position: 72% 0%; transform: none; }
  /* Vidéo : posée dans le rond, centrée, sans déborder de l'écran. */
  .has-video .ring, .has-video .glow { left: 50%; }
  .has-video .dot { left: 14%; }
  .bgvideo { inset: auto; left: 50%; right: auto; top: var(--hero-img-mid); width: calc(var(--r1) - 2.2rem); height: auto; aspect-ratio: 1; transform: translate(-50%, -50%); -webkit-mask-image: none; mask-image: none; }
  .bgvideo video { border-radius: 50%; object-position: 50% 25%; transform: none; animation: none; }
  .glow { left: 66%; top: var(--hero-img-mid); width: 34rem; }
  .dot { left: 12%; top: calc(var(--hero-img-top) + 1.2rem); }
  .mini { left: 24%; top: calc(var(--hero-img-top) + 0.8rem); }
  .veil-x { display: none; }
  .veil-y { background: linear-gradient(0deg, #32180f 4%, rgba(50, 24, 15, 0.4) 22%, transparent 40%); }
}
</style>
