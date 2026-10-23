<script setup>
import EmText from '@/components/ui/EmText.vue'
import HeroBackdrop from '@/components/ui/HeroBackdrop.vue'

/**
 * Bandeau de page, même dessin que l'accueil : fond marron, deux cercles fins, photo détourée,
 * titre en blanc, vague de transition.
 */
defineProps({
  image: { type: String, default: '' },
  /** Photo ronde posée dans le premier cercle (quand la photo n'est pas détourée). */
  disc: { type: String, default: '' },
  /** Vidéo d'ambiance (muette, en boucle) qui remplace la photo ; la photo sert d'image d'attente et de secours. */
  video: { type: String, default: '' },
  poster: { type: String, default: '' },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  lede: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <section class="phero on-dark" :class="{ compact }">
    <HeroBackdrop :src="image" :disc="disc" :video="video" :poster="poster" eager />
    <div class="container content">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1><slot name="title"><EmText :text="title" /></slot></h1>
      <p v-if="lede" class="lede">{{ lede }}</p>
      <slot />
    </div>
    <svg class="wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" fill="#fdfbf7" /></svg>
  </section>
</template>

<style scoped>
.phero { margin-bottom: -1px; position: relative; isolation: isolate; display: flex; align-items: center; min-height: min(62svh, 34rem); margin-top: calc(var(--header-h) * -1); padding: calc(var(--header-h) + clamp(2.75rem, 6vw, 4.75rem)) 0 clamp(4.5rem, 8vw, 6.5rem); overflow: hidden; background: #32180f; }
.phero > .content { width: 100%; }
.content { display: grid; gap: 1.2rem; max-width: calc(var(--max) + var(--gutter) * 2); }
.content > * { max-width: 40rem; animation: rise 0.95s var(--ease) both; }
.content > :nth-child(2) { animation-delay: 0.12s; }
.content > :nth-child(3) { animation-delay: 0.26s; }
.content > :nth-child(n + 4) { animation-delay: 0.4s; }
@keyframes rise { from { opacity: 0; transform: translate3d(0, 26px, 0); } }
h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); color: #fff; text-shadow: 0 2px 24px rgba(58, 33, 19, 0.35); }
.lede { color: rgba(253, 251, 247, 0.9); }
.wave { position: absolute; left: 0; right: 0; bottom: -3px; width: 100%; height: clamp(40px, 6vw, 80px); }
.compact { min-height: min(52svh, 28rem); padding-bottom: clamp(4rem, 7vw, 5.5rem); }
.compact h1 { font-size: clamp(2.2rem, 5.4vw, 3.6rem); }
@media (max-width: 1023px) { .phero, .compact { align-items: flex-start; min-height: 0; padding-top: calc(var(--hero-img-top) + var(--hero-img-h) - 0.75rem); padding-bottom: 5rem; } }
</style>
