<script setup>
/**
 * Effets globaux, montés une seule fois dans App.vue :
 *  - écran de chargement élégant (une fois par session) ;
 *  - barre de progression de lecture ;
 *  - bouton « retour en haut » animé avec anneau de progression ;
 *  - onde au clic sur les boutons (micro-interaction).
 * Aucune animation si l'utilisateur préfère moins de mouvement.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

import Wordmark from '@/components/ui/Wordmark.vue'

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Écran de chargement : décidé avant le premier rendu pour éviter tout flash. */
const KEY = 'bh3_intro_seen'
let seen = false
try {
  seen = sessionStorage.getItem(KEY) === '1'
} catch {
  /* stockage bloqué : on montre l'intro, sans conséquence */
}
const loader = ref(!seen && !reduced)
const leaving = ref(false)

const progress = ref(0)
const showTop = ref(false)
const RING = 2 * Math.PI * 20

let frame = 0
const update = () => {
  frame = 0
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  showTop.value = window.scrollY > 700
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(update)
}

const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })

const ripple = (e) => {
  if (reduced) return
  const btn = e.target.closest?.('.btn')
  if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return
  const r = btn.getBoundingClientRect()
  const size = Math.max(r.width, r.height) * 2
  const dot = document.createElement('span')
  dot.className = 'ripple'
  dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`
  btn.appendChild(dot)
  dot.addEventListener('animationend', () => dot.remove(), { once: true })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  document.addEventListener('pointerdown', ripple, { passive: true })
  update()

  if (loader.value) {
    const started = performance.now()
    const finish = () => {
      const wait = Math.max(0, 900 - (performance.now() - started))
      setTimeout(() => {
        leaving.value = true
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {
          /* sans importance */
        }
        setTimeout(() => (loader.value = false), 800)
      }, wait)
    }
    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  document.removeEventListener('pointerdown', ripple)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div v-if="loader" class="loader on-dark" :class="{ leaving }" role="status" aria-live="polite">
    <div class="loader-inner">
      <Wordmark />
      <span class="loader-bar" aria-hidden="true"><i /></span>
      <span class="sr-only">Chargement du site…</span>
    </div>
  </div>

  <div class="progress" aria-hidden="true"><i :style="{ transform: `scaleX(${progress})` }" /></div>

  <Transition name="top">
    <button v-if="showTop" type="button" class="to-top" aria-label="Retour en haut de la page" @click="toTop">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle class="track" cx="24" cy="24" r="20" />
        <circle class="bar" cx="24" cy="24" r="20" :stroke-dasharray="RING" :stroke-dashoffset="RING * (1 - progress)" />
        <path class="chev" d="M17 27l7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.loader { position: fixed; inset: 0; z-index: 400; display: grid; place-items: center; background: var(--grad-dark); transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1); }
.loader::after { content: ''; position: absolute; inset: auto 0 -1px 0; height: 12vh; background: inherit; border-radius: 50% 50% 0 0 / 100% 100% 0 0; transform: translateY(100%); }
.loader.leaving { transform: translateY(-112%); pointer-events: none; }
.loader-inner { display: grid; justify-items: center; gap: 1.6rem; animation: loaderIn 0.8s var(--ease) both; }
.loader-inner :deep(.wordmark-badge) { animation: breathe 1.8s ease-in-out infinite; }
.loader.leaving .loader-inner { opacity: 0; transition: opacity 0.3s; }
.loader-bar { width: 9rem; height: 3px; border-radius: 3px; background: rgba(247, 244, 238, 0.16); overflow: hidden; }
.loader-bar i { display: block; height: 100%; background: linear-gradient(115deg, #f0d98c, #dcb95e 55%, #b8912f); transform-origin: left; animation: fill 0.95s var(--ease) both; }

.progress { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 210; pointer-events: none; }
.progress i { display: block; height: 100%; background: var(--grad); transform: scaleX(0); transform-origin: left; will-change: transform; }

.to-top { position: fixed; right: clamp(1rem, 3vw, 2rem); bottom: clamp(1rem, 3vw, 2rem); z-index: 120; width: 56px; height: 56px; padding: 0; display: grid; place-items: center; border: 0; border-radius: 50%; cursor: pointer; color: #fff; background: var(--ink); box-shadow: 0 16px 30px -12px rgba(74, 37, 18, 0.7); transition: transform 0.3s var(--ease), background-color 0.3s; }
.to-top:hover { transform: translateY(-4px); background: var(--wine); }
.to-top svg { position: absolute; inset: 4px; width: 48px; height: 48px; transform: rotate(-90deg); }
.to-top .track { fill: none; stroke: rgba(255, 255, 255, 0.18); stroke-width: 2.5; }
.to-top .bar { fill: none; stroke: var(--caramel); stroke-width: 2.5; stroke-linecap: round; }
.to-top .chev { fill: none; stroke: #fff; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; transform: rotate(90deg); transform-origin: 24px 24px; transition: translate 0.3s var(--ease); }
.to-top:hover .chev { translate: 0 -3px; }

.top-enter-active, .top-leave-active { transition: opacity 0.35s var(--ease), transform 0.35s var(--ease); }
.top-enter-from, .top-leave-to { opacity: 0; transform: translateY(18px) scale(0.8); }

@keyframes loaderIn { from { opacity: 0; transform: translateY(14px) scale(0.96); } }
@keyframes fill { from { transform: scaleX(0); } }
@keyframes breathe { 50% { transform: scale(1.12); box-shadow: 0 0 0 12px rgba(212, 175, 55, 0.12); } }
</style>
