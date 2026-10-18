<script setup>
import { ref } from 'vue'

import HeroBackdrop from '@/components/ui/HeroBackdrop.vue'
import { heroArt } from '@/data/heroImages'
import { BRAND_INTRO, BRAND_TAGLINE } from '@/data/tarifs'

/* Photo d'accueil : la même que celle du site de référence (public/images/hero-accueil*.jpg),
   en deux cadrages — large pour l'ordinateur, portrait pour le téléphone. */

/* Titre découpé mot à mot pour l'apparition progressive (le mot en couleur reste d'un seul bloc). */
const titleWords = [
  { t: 'Locks,' }, { t: 'small' }, { t: 'locks' }, { t: 'et' }, { t: 'micro-locks', em: true },
  { t: 'à' }, { t: 'Abidjan.' },
]
const titleLabel = 'Locks, small locks et micro-locks à Abidjan.'
const root = ref(null)
const scrollDown = () => {
  const end = root.value?.offsetHeight ?? window.innerHeight
  window.scrollTo({ top: end - 70, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

const lede = BRAND_INTRO
</script>

<template>
  <section ref="root" class="hero on-dark">
    <!-- Photo plein cadre + voile cacao (ombre côté texte, raccord en bas) -->
    <HeroBackdrop :src="heroArt.home" eager :lift="1.12" />

    <div class="container copy-wrap">
      <div class="copy">
        <p class="eyebrow">{{ BRAND_TAGLINE }}</p>
        <h1 :aria-label="titleLabel">
          <span v-for="(w, i) in titleWords" :key="i" class="w" :class="{ punct: w.t === ',' }" :style="{ '--i': i }" aria-hidden="true"><span><em v-if="w.em">{{ w.t }}</em><template v-else>{{ w.t }}</template></span></span>
        </h1>
        <p class="lede">{{ lede }}</p>
        <div class="cta">
          <RouterLink v-magnetic :to="{ name: 'booking' }" class="btn btn-primary btn-glow">Réserver mon rendez-vous</RouterLink>
          <RouterLink :to="{ name: 'services' }" class="link-arrow">Nos services et tarifs <span class="arrow" aria-hidden="true">→</span></RouterLink>
        </div>
      </div>
    </div>
    <button type="button" class="cue" aria-label="Faire défiler vers les services" @click="scrollDown"><span class="mouse" aria-hidden="true"><i /></span></button>
    <svg class="edge" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0,50 C220,100 460,10 720,45 C980,80 1200,100 1440,40 L1440,90 L0,90 Z" fill="#fdfbf7" /></svg>
  </section>
</template>

<style scoped>
.hero { position: relative; isolation: isolate; margin-top: calc(var(--header-h) * -1); display: flex; align-items: center; min-height: min(80svh, 48rem); padding: calc(var(--header-h) + clamp(0.5rem, 2vw, 1.5rem)) 0 clamp(5.5rem, 9vw, 7.5rem); overflow: hidden; background: #4a2512; }
.copy-wrap { width: 100%; }
.edge { position: absolute; left: 0; right: 0; bottom: -3px; width: 100%; height: clamp(50px, 7vw, 90px); }
.copy { display: grid; gap: 1.3rem; align-content: start; max-width: 38rem; }
.copy > :not(h1) { animation: rise 0.9s var(--ease) both; }
.copy > .eyebrow { animation-delay: 0.1s; }
.copy > .lede { animation-delay: 0.85s; }
.copy > .cta { animation-delay: 1.0s; }
/* Apparition mot par mot */
.w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0 0.07em 0.14em 0; margin: 0 0.2em -0.14em 0; }
.w > span { display: inline-block; transform: translate3d(0, 112%, 0); animation: wordUp 0.95s var(--ease) calc(var(--i) * 70ms + 220ms) forwards; }
.w.punct { margin-left: -0.27em; }
h1 em { background-size: 220% 100%; animation: sheen 7s linear infinite; }
h1 { font-size: clamp(2.5rem, 5.6vw, 4.4rem); line-height: 1.05; color: #fff; text-shadow: 0 2px 24px rgba(58, 33, 19, 0.35); }
.copy .lede { font-size: clamp(1rem, 1.2vw, 1.12rem); max-width: 34rem; color: rgba(253, 251, 247, 0.9); }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.8rem; margin-top: 0.3rem; }

@media (max-width: 1023px) {
  .hero { align-items: flex-end; min-height: calc(100svh + 5rem); padding-top: 47svh; }
}

/* Indicateur de défilement */
.cue { position: absolute; left: 50%; bottom: clamp(3.4rem, 6vw, 5.4rem); z-index: 2; display: none; width: 44px; height: 44px; padding: 0; margin-left: -22px; place-items: center; background: none; border: 0; cursor: pointer; opacity: 0; animation: fadeIn 1s 1.8s forwards; }
.mouse { position: relative; display: block; width: 22px; height: 36px; border: 2px solid rgba(253, 251, 247, 0.7); border-radius: 12px; }
.mouse i { position: absolute; left: 50%; top: 6px; width: 3px; height: 7px; margin-left: -1.5px; border-radius: 3px; background: #fdfbf7; animation: wheel 1.8s ease-in-out infinite; }
@media (min-width: 900px) and (min-height: 700px) { .cue { display: grid; } }

@keyframes wordUp { to { transform: translate3d(0, 0, 0); } }
@keyframes rise { from { opacity: 0; transform: translate3d(0, 24px, 0); } }
@keyframes sheen { to { background-position: -220% 0; } }
@keyframes wheel { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
@keyframes fadeIn { to { opacity: 1; } }

</style>
