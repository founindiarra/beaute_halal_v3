<script setup>
import { computed, ref } from 'vue'

import { heroImages } from '@/data/heroImages'
import { BRAND_INTRO, BRAND_TAGLINE } from '@/data/tarifs'

/* Photo d'accueil : si le salon dépose sa propre photo dans /public/images/hero-accueil-v3.jpg,
   elle est utilisée en priorité ; sinon (ou si elle ne se charge pas) la photo d'ambiance distante. */
const sources = ['/images/hero-accueil-v3.jpg', heroImages.home]
const idx = ref(0)
const failed = computed(() => idx.value >= sources.length)
const next = () => { idx.value += 1 }

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
  <section ref="root" class="hero blobs">
    <div class="container grid">
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
        <p class="note"><span class="dot" aria-hidden="true" /> Sur rendez-vous : le salon vous confirme le jour et l’heure.</p>
      </div>

      <div class="art">
        <div class="ring" aria-hidden="true" />
        <div v-parallax="0.04" class="photo">
          <img v-if="!failed" :key="idx" :src="sources[idx]" alt="Locks retombant en cascade, aux reflets chauds" fetchpriority="high" decoding="async" @error="next" />
          <svg v-else viewBox="0 0 120 200" aria-hidden="true"><path d="M60 6c-34 22-34 48 0 70s34 48 0 70-34 36 0 48" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".85" /></svg>
        </div>
        <div class="float f1" aria-hidden="true">
          <span class="pulse" /> <span><strong>Demande en ligne</strong><br />Réponse du salon</span>
        </div>
        <span v-parallax="-0.08" class="stamp" aria-hidden="true">Locks<br />Small<br />Micro</span>
      </div>
    </div>
    <button type="button" class="cue" aria-label="Faire défiler vers les services" @click="scrollDown"><span class="mouse" aria-hidden="true"><i /></span></button>
    <svg class="edge" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0,50 C220,100 460,10 720,45 C980,80 1200,100 1440,40 L1440,90 L0,90 Z" fill="#f2ede3" /></svg>
  </section>
</template>

<style scoped>
.hero { position: relative; padding-block: clamp(1.2rem, 3vw, 2.5rem) clamp(5.5rem, 9vw, 7.5rem); overflow: hidden; }
.edge { position: absolute; left: 0; right: 0; bottom: -1px; width: 100%; height: clamp(50px, 7vw, 90px); }
.grid { display: grid; gap: 3.5rem; align-items: center; }
.copy { display: grid; gap: 1.3rem; align-content: start; }
.copy > :not(h1) { animation: rise 0.9s var(--ease) both; }
.copy > .eyebrow { animation-delay: 0.1s; }
.copy > .lede { animation-delay: 0.85s; }
.copy > .cta { animation-delay: 1.0s; }
.copy > .note { animation-delay: 1.15s; }
/* Apparition mot par mot */
.w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0 0.07em 0.14em 0; margin: 0 0.2em -0.14em 0; }
.w > span { display: inline-block; transform: translate3d(0, 112%, 0); animation: wordUp 0.95s var(--ease) calc(var(--i) * 70ms + 220ms) forwards; }
.w.punct { margin-left: -0.27em; }
h1 em { background-size: 220% 100%; animation: sheen 7s linear infinite; }
h1 { font-size: clamp(2rem, 4.6vw, 3.5rem); line-height: 1.08; }
.copy .lede { font-size: clamp(0.95rem, 1.15vw, 1.05rem); max-width: 34rem; }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.8rem; margin-top: 0.3rem; }
.note { display: flex; align-items: center; gap: 0.6rem; font-size: 0.92rem; color: var(--muted); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #2e9e63; box-shadow: 0 0 0 4px rgba(46, 158, 99, 0.2); flex: none; }

.art { animation: artIn 1.3s var(--ease) 0.2s both; position: relative; width: min(100%, 440px); justify-self: center; aspect-ratio: 1 / 1.05; }
.ring { position: absolute; inset: -4% -6% 6% 8%; border-radius: 58% 42% 46% 54% / 48% 56% 44% 52%; background: var(--grad); opacity: 0.95; animation: morph 14s ease-in-out infinite alternate; }
.photo { position: absolute; inset: 4% 8% 0 0; border-radius: 44% 56% 52% 48% / 52% 44% 56% 48%; overflow: hidden; background: var(--grad-dark); box-shadow: var(--shadow-lift); border: 6px solid #fff; display: grid; place-items: center; animation: morph2 14s ease-in-out infinite alternate; }
/* Cadrage serré sur les locks (comme la vignette choisie) : --zoom règle l'agrandissement, --focus le point visé. */
.photo img { --zoom: 1.75; --focus: 50% 45%; width: 100%; height: 100%; object-fit: cover; object-position: var(--focus); transform: scale(var(--zoom)); transform-origin: var(--focus); animation: cine 2.4s var(--ease) both, drift 24s ease-in-out 2.4s infinite alternate; }
.photo svg { width: 38%; height: auto; }
.float { position: absolute; display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem 1.1rem; background: rgba(255, 255, 255, 0.95); border-radius: 18px; box-shadow: var(--shadow); font-size: 0.82rem; line-height: 1.3; color: var(--muted); }
.float strong { color: var(--ink); font-size: 0.9rem; }
.f1 { left: -4%; bottom: 12%; animation: bob 6s ease-in-out infinite alternate; }
.pulse { width: 12px; height: 12px; border-radius: 50%; background: #2e9e63; animation: pulse 2s infinite; flex: none; }
.stamp { position: absolute; right: -2%; top: 2%; display: grid; place-items: center; width: 6.4rem; height: 6.4rem; border-radius: 50%; background: var(--ink); color: #fff; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; text-align: center; line-height: 1.55; transform: rotate(12deg); box-shadow: var(--shadow); }
.stamp::before { content: ''; position: absolute; inset: 5px; border: 1px dashed rgba(255, 255, 255, 0.45); border-radius: 50%; animation: spin 24s linear infinite; }

/* Indicateur de défilement */
.cue { position: absolute; left: 50%; bottom: clamp(3.4rem, 6vw, 5.4rem); z-index: 2; display: none; width: 44px; height: 44px; padding: 0; margin-left: -22px; place-items: center; background: none; border: 0; cursor: pointer; opacity: 0; animation: fadeIn 1s 1.8s forwards; }
.mouse { position: relative; display: block; width: 22px; height: 36px; border: 2px solid rgba(24, 19, 16, 0.55); border-radius: 12px; }
.mouse i { position: absolute; left: 50%; top: 6px; width: 3px; height: 7px; margin-left: -1.5px; border-radius: 3px; background: var(--copper); animation: wheel 1.8s ease-in-out infinite; }
@media (min-width: 900px) and (min-height: 700px) { .cue { display: grid; } }

@keyframes wordUp { to { transform: translate3d(0, 0, 0); } }
@keyframes rise { from { opacity: 0; transform: translate3d(0, 24px, 0); } }
@keyframes artIn { from { opacity: 0; transform: translate3d(0, 30px, 0) scale(0.94); } }
@keyframes cine { from { scale: 1.28; filter: blur(6px); } }
@keyframes drift { from { scale: 1; } to { scale: 1.07; } }
@keyframes sheen { to { background-position: -220% 0; } }
@keyframes bob { to { transform: translate3d(0, -12px, 0); } }
@keyframes wheel { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
@keyframes fadeIn { to { opacity: 1; } }
@keyframes morph { to { border-radius: 42% 58% 54% 46% / 56% 44% 56% 44%; transform: rotate(4deg); } }
@keyframes morph2 { to { border-radius: 52% 48% 44% 56% / 46% 54% 46% 54%; } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(46, 158, 99, 0.5); } 70% { box-shadow: 0 0 0 10px rgba(46, 158, 99, 0); } 100% { box-shadow: 0 0 0 0 rgba(46, 158, 99, 0); } }

@media (min-width: 900px) { .grid { grid-template-columns: 1.1fr 1fr; gap: 4rem; } .art { justify-self: end; } }
@media (max-width: 420px) { .stamp { width: 5.2rem; height: 5.2rem; font-size: 0.56rem; } .f1 { left: 0; } }
</style>
