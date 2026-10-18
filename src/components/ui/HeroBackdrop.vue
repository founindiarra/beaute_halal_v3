<script setup>
import { computed, ref } from 'vue'

/**
 * Fond commun à tous les bandeaux : marron « espresso » à deux halos, deux cercles fins derrière la photo,
 * photo détourée fondue en haut et en bas, voile marron côté texte.
 */
const props = defineProps({ src: { type: String, default: '' }, eager: { type: Boolean, default: false }, lift: { type: Number, default: 1 }, disc: { type: String, default: '' } })
const failed = ref(false)
const discFailed = ref(false)
const mobileSrc = computed(() => props.src.replace(/\.webp$/, '-mobile.webp'))
</script>

<template>
  <div class="bgwrap" :class="{ 'has-disc': disc && !discFailed }" aria-hidden="true">
    <span class="glow" />
    <span class="ring r1" />
    <span class="ring r2" />
    <img v-if="disc && !discFailed" class="disc" :src="disc" alt="" decoding="async" @error="discFailed = true" />
    <picture v-if="src && !failed && (!disc || discFailed)" class="bg" :style="{ '--zoom': lift }">
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
  background: radial-gradient(60rem 36rem at 85% -10%, rgba(124, 69, 39, 0.55), transparent 70%), radial-gradient(44rem 30rem at 0% 110%, rgba(176, 138, 87, 0.16), transparent 70%), #4a2512; }
/* Les deux traits qui dessinent le rond derrière la photo */
.ring { position: absolute; left: 71%; top: 46%; border-radius: 50%; border: 1px solid rgba(203, 172, 129, 0.6); transform: translate(-50%, -50%); pointer-events: none; }
.r1 { width: var(--r1); aspect-ratio: 1; }
.r2 { width: calc(var(--r1) + 3.4rem); aspect-ratio: 1; border-color: rgba(203, 172, 129, 0.3); }
.bg { position: absolute; left: 0; right: 0; top: 8%; bottom: 0; display: block; -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 100%); mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 100%); }
.bg img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; transform: scale(var(--zoom, 1)); transform-origin: 50% 100%; filter: saturate(1.08) contrast(1.04) brightness(1.02); animation: cine 2.4s var(--ease) both; }
.veil-x { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(74, 37, 18, 0.9) 5%, rgba(74, 37, 18, 0.45) 40%, transparent 75%); }
.veil-y { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(74, 37, 18, 0.8) 4%, transparent 40%); }
/* Éclat : grande lueur caramel douce derrière la personne, qui respire ; petit point doré et petit rond comme sur le site de référence */
.glow { position: absolute; left: 74%; top: 44%; width: clamp(34rem, 96vh, 60rem); aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(214, 150, 92, 0.55) 0%, rgba(176, 108, 62, 0.32) 32%, rgba(124, 69, 39, 0.1) 55%, transparent 70%); pointer-events: none; animation: breathe 6s ease-in-out infinite; }
.dot { position: absolute; left: calc(71% - clamp(13rem, 36vh, 22rem)); top: 14%; width: 0.55rem; aspect-ratio: 1; border-radius: 50%; background: #cbac81; box-shadow: 0 0 12px 2px rgba(203, 172, 129, 0.7); animation: twinkle 3.6s ease-in-out infinite; pointer-events: none; }
.mini { position: absolute; left: calc(71% - clamp(8rem, 24vh, 14rem)); top: 16%; width: 2.6rem; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(203, 172, 129, 0.8); pointer-events: none; animation: twinkle 4.6s ease-in-out 1s infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes breathe { 0%, 100% { opacity: 0.7; scale: 0.96; } 50% { opacity: 1; scale: 1.04; } }
/* Photo ronde au contour net, sans cadre ni ombre : posée dans le premier cercle */
.disc { position: absolute; left: 71%; top: 46%; width: calc(var(--r1) - 2.2rem); aspect-ratio: 1; object-fit: cover; object-position: 50% 40%; border-radius: 50%; transform: translate(-50%, -50%); animation: cine 2.4s var(--ease) both; }
@media (min-width: 1024px) {
  .has-disc { --r1: clamp(20rem, 46vh, 28rem); }
  .has-disc .ring, .has-disc .disc, .has-disc .glow { top: 56%; }
}
@keyframes cine { from { scale: 1.12; filter: blur(5px); } }
@media (max-width: 1023px) {
  .ring { left: 66%; top: calc(18svh + 5rem); }
  .bgwrap { --r1: min(21rem, 92vw); }
  .disc { left: 66%; top: calc(18svh + 5rem); }
  .bg { top: 9svh; bottom: auto; height: 62svh; -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%); mask-image: linear-gradient(to bottom, #000 55%, transparent 100%); }
  .bg img { object-position: 72% 0%; transform: none; }
  .glow { left: 66%; top: calc(18svh + 5rem); width: 34rem; }
  .dot { left: 12%; top: calc(9svh + 3rem); }
  .mini { left: 24%; top: calc(9svh + 2.6rem); }
  .veil-x { display: none; }
  .veil-y { background: linear-gradient(0deg, #4a2512 4%, rgba(74, 37, 18, 0.65) 38%, transparent 62%); }
}
</style>
