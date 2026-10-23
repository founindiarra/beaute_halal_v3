<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import Wordmark from '@/components/ui/Wordmark.vue'
import { pad2 } from '@/utils/format'

/* Mêmes pages, mêmes libellés que les sites 1 et 2. */
const links = [
  { name: 'home', label: 'Accueil' },
  { name: 'services', label: 'Nos services' },
  { name: 'gallery', label: 'Nos coiffures' },
  { name: 'about', label: 'À propos' },
  { name: 'booking', label: 'Rendez-vous', cta: true },
  { name: 'contact', label: 'Contact' },
]

const route = useRoute()
const open = ref(false)
const panel = ref(null)
const toggle = ref(null)
const closeBtn = ref(null)

const setLock = (on) => {
  document.documentElement.style.overflow = on ? 'hidden' : ''
}
const close = (restoreFocus = true) => {
  open.value = false
  if (restoreFocus) nextTick(() => toggle.value?.focus())
}

watch(open, async (isOpen) => {
  setLock(isOpen)
  if (isOpen) {
    await nextTick()
    closeBtn.value?.focus()
  }
})
watch(
  () => route.fullPath,
  () => {
    if (open.value) close(false)
  },
)

/* En-tête : prend un aspect plus compact et plus opaque dès qu'on descend dans la page. */
const scrolled = ref(false)
let frame = 0
const onScroll = () => {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    scrolled.value = window.scrollY > 24
  })
}

/* Indicateur animé : une barre qui glisse sous le lien de la page active. */
const nav = ref(null)
const bar = ref({ x: 0, w: 0, on: false })
const placeBar = async () => {
  await nextTick()
  const active = nav.value?.querySelector('.nav-link.is-active:not(.cta)')
  if (!active) {
    bar.value = { ...bar.value, on: false }
    return
  }
  bar.value = { x: active.offsetLeft + 16, w: Math.max(0, active.offsetWidth - 32), on: true }
}
watch(() => route.fullPath, placeBar)
const onResize = () => placeBar()

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  onScroll()
  placeBar()
  document.fonts?.ready?.then(placeBar)
})
onBeforeUnmount(() => {
  setLock(false)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (frame) cancelAnimationFrame(frame)
})

const onKeydown = (e) => {
  if (!open.value) return
  if (e.key === 'Escape') return close()
  if (e.key !== 'Tab' || !panel.value) return
  const items = [...panel.value.querySelectorAll('a[href], button:not([disabled])')]
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled }" @keydown="onKeydown">
    <div class="bar">
      <RouterLink :to="{ name: 'home' }" class="brand" aria-label="Beauté Halal — accueil">
        <Wordmark />
      </RouterLink>

      <nav ref="nav" class="nav-desktop" aria-label="Navigation principale">
        <RouterLink
          v-for="l in links"
          :key="l.name"
          :to="{ name: l.name }"
          v-magnetic="l.cta ? 0.2 : 0"
          class="nav-link"
          :class="{ cta: l.cta }"
          :active-class="l.name === 'home' ? '' : 'is-active'"
          exact-active-class="is-active"
        >
          {{ l.label }}
        </RouterLink>
        <span class="indicator" :class="{ on: bar.on }" :style="{ transform: `translateX(${bar.x}px) scaleX(${bar.w / 100})` }" aria-hidden="true" />
      </nav>

      <button ref="toggle" type="button" class="menu-btn" :aria-expanded="open" aria-controls="mobile-menu" @click="open = true">
        <span class="menu-label">Menu</span>
        <span class="menu-bars" aria-hidden="true"><i /><i /></span>
      </button>
    </div>

    <Transition name="menu">
      <div v-if="open" id="mobile-menu" ref="panel" class="mobile on-dark" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="mobile-top">
          <Wordmark compact />
          <button ref="closeBtn" type="button" class="menu-btn light" @click="close()">
            <span class="menu-label">Fermer</span>
            <span class="menu-bars is-x" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
        <nav class="mobile-nav" aria-label="Navigation principale (mobile)">
          <RouterLink v-for="(l, i) in links" :key="l.name" :to="{ name: l.name }" class="mobile-link" :style="{ '--i': i }" exact-active-class="is-active">
            <span class="numeral">{{ pad2(i + 1) }}</span>
            <span>{{ l.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header { position: sticky; top: 0; z-index: 100; padding: 12px var(--gutter) 0; pointer-events: none; }
.bar {
  pointer-events: auto; max-width: calc(var(--max) + 2rem); margin-inline: auto;
  height: 64px; padding: 0 0.7rem 0 1rem; border-radius: 999px;
  transition: height 0.4s var(--ease), background-color 0.4s, box-shadow 0.4s, max-width 0.5s var(--ease);
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: rgba(245, 237, 227, 0.97); backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 12px 34px -18px rgba(50, 24, 15, 0.55);
}
.is-scrolled .bar { height: 56px; max-width: calc(var(--max) - 2rem); background: rgba(245, 237, 227, 0.98); box-shadow: 0 16px 40px -16px rgba(50, 24, 15, 0.7); }
.brand { text-decoration: none; display: inline-flex; min-height: 44px; align-items: center; }
.nav-desktop { position: relative; display: none; align-items: center; gap: 0.15rem; }
.indicator { position: absolute; left: 0; bottom: 6px; width: 100px; height: 3px; border-radius: 3px; background: var(--grad); transform-origin: left; opacity: 0; transition: transform 0.55s var(--ease), opacity 0.3s; pointer-events: none; }
.indicator.on { opacity: 1; }
.nav-link { position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0 1rem; font-weight: 500; font-size: 0.97rem; text-decoration: none; color: var(--ink); border-radius: 999px; transition: color 0.2s, background-color 0.2s; }
.nav-link::after { content: ''; position: absolute; left: 1rem; right: 1rem; bottom: 6px; height: 3px; border-radius: 3px; background: var(--grad); transform: scaleX(0); transform-origin: left; transition: transform 0.35s var(--ease); }
.nav-link:hover::after { transform: scaleX(1); }
.nav-link.is-active:not(.cta)::after { transform: scaleX(0); }
.nav-link.is-active { font-weight: 700; }
.nav-link.cta { margin-inline: 0.35rem; background: var(--grad-btn); color: #fff; font-weight: 700; box-shadow: 0 10px 22px -12px rgba(107, 61, 36, 0.8); }
.nav-link.cta::after { display: none; }
.nav-link.cta:hover { filter: brightness(1.08); }
.nav-link.cta.is-active { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--rose); }

.menu-btn { display: inline-flex; align-items: center; gap: 0.7rem; min-height: 44px; padding: 0 0.9rem; background: var(--paper); border: 0; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; }
.menu-btn.light { background: rgba(255, 255, 255, 0.14); color: #f7f4ee; }
.menu-bars { position: relative; width: 22px; height: 12px; }
.menu-bars i { position: absolute; left: 0; width: 100%; height: 2px; border-radius: 2px; background: currentColor; transition: transform 0.3s var(--ease); }
.menu-bars i:first-child { top: 0; }
.menu-bars i:last-child { bottom: 0; }
.menu-bars.is-x i:first-child { top: 5px; transform: rotate(45deg); }
.menu-bars.is-x i:last-child { bottom: 5px; transform: rotate(-45deg); }

.mobile { pointer-events: auto; position: fixed; inset: 0; z-index: 150; display: flex; flex-direction: column; overflow-y: auto; padding: 12px var(--gutter) 2rem; }
.mobile-top { height: 64px; display: flex; align-items: center; justify-content: space-between; }
.mobile-nav { display: flex; flex-direction: column; padding-top: 1.5rem; flex: 1; }
.mobile-link { display: flex; align-items: baseline; gap: 1.2rem; padding: 0.8rem 0; min-height: 56px; border-bottom: 1px solid rgba(255, 255, 255, 0.14); font-family: var(--font-display); font-size: clamp(1.8rem, 8vw, 2.5rem); text-decoration: none; color: #f7f4ee; letter-spacing: -0.02em; }
.mobile-link .numeral { font-size: 0.95rem; font-family: var(--font-body); font-weight: 700; letter-spacing: 0.1em; }
.mobile-link { opacity: 0; animation: linkIn 0.7s var(--ease) calc(var(--i) * 70ms + 180ms) forwards; transition: color 0.25s, padding-left 0.35s var(--ease); }
.mobile-link:hover { padding-left: 0.6rem; color: var(--caramel); }
.mobile-link.is-active { color: var(--caramel); }
@keyframes linkIn { from { opacity: 0; transform: translate3d(0, 28px, 0); } to { opacity: 1; transform: none; } }

.menu-enter-active { transition: clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1); }
.menu-leave-active { transition: clip-path 0.5s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.5s; }
.menu-enter-from, .menu-leave-to { clip-path: circle(0% at calc(100% - 3rem) 2.6rem); }
.menu-enter-to, .menu-leave-from { clip-path: circle(150% at calc(100% - 3rem) 2.6rem); }
.menu-leave-to { opacity: 0.4; }

@media (min-width: 1024px) {
  .nav-desktop { display: flex; }
  .menu-btn { display: none; }
  .bar { padding-right: 0.9rem; }
}
</style>
