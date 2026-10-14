<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
onBeforeUnmount(() => setLock(false))

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
  <header class="site-header" @keydown="onKeydown">
    <div class="bar">
      <RouterLink :to="{ name: 'home' }" class="brand" aria-label="Beauté Halal — accueil">
        <Wordmark />
      </RouterLink>

      <nav class="nav-desktop" aria-label="Navigation principale">
        <RouterLink
          v-for="l in links"
          :key="l.name"
          :to="{ name: l.name }"
          class="nav-link"
          :class="{ cta: l.cta }"
          :active-class="l.name === 'home' ? '' : 'is-active'"
          exact-active-class="is-active"
        >
          {{ l.label }}
        </RouterLink>
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
          <RouterLink v-for="(l, i) in links" :key="l.name" :to="{ name: l.name }" class="mobile-link" exact-active-class="is-active">
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
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: rgba(255, 248, 241, 0.88); backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 12px 34px -18px rgba(107, 35, 71, 0.55);
}
.brand { text-decoration: none; display: inline-flex; min-height: 44px; align-items: center; }
.nav-desktop { display: none; align-items: center; gap: 0.15rem; }
.nav-link { position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0 1rem; font-weight: 500; font-size: 0.97rem; text-decoration: none; color: var(--ink); border-radius: 999px; transition: color 0.2s, background-color 0.2s; }
.nav-link::after { content: ''; position: absolute; left: 1rem; right: 1rem; bottom: 6px; height: 3px; border-radius: 3px; background: var(--grad); transform: scaleX(0); transform-origin: left; transition: transform 0.35s var(--ease); }
.nav-link:hover::after, .nav-link.is-active::after { transform: scaleX(1); }
.nav-link.is-active { font-weight: 700; }
.nav-link.cta { margin-inline: 0.35rem; background: var(--grad-btn); color: #fff; font-weight: 700; box-shadow: 0 10px 22px -12px rgba(184, 48, 106, 0.8); }
.nav-link.cta::after { display: none; }
.nav-link.cta:hover { filter: brightness(1.08); }
.nav-link.cta.is-active { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--rose); }

.menu-btn { display: inline-flex; align-items: center; gap: 0.7rem; min-height: 44px; padding: 0 0.9rem; background: var(--paper); border: 0; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; }
.menu-btn.light { background: rgba(255, 255, 255, 0.14); color: #fff3ec; }
.menu-bars { position: relative; width: 22px; height: 12px; }
.menu-bars i { position: absolute; left: 0; width: 100%; height: 2px; border-radius: 2px; background: currentColor; transition: transform 0.3s var(--ease); }
.menu-bars i:first-child { top: 0; }
.menu-bars i:last-child { bottom: 0; }
.menu-bars.is-x i:first-child { top: 5px; transform: rotate(45deg); }
.menu-bars.is-x i:last-child { bottom: 5px; transform: rotate(-45deg); }

.mobile { pointer-events: auto; position: fixed; inset: 0; z-index: 150; display: flex; flex-direction: column; overflow-y: auto; padding: 12px var(--gutter) 2rem; }
.mobile-top { height: 64px; display: flex; align-items: center; justify-content: space-between; }
.mobile-nav { display: flex; flex-direction: column; padding-top: 1.5rem; flex: 1; }
.mobile-link { display: flex; align-items: baseline; gap: 1.2rem; padding: 0.8rem 0; min-height: 56px; border-bottom: 1px solid rgba(255, 255, 255, 0.14); font-family: var(--font-display); font-size: clamp(1.8rem, 8vw, 2.5rem); text-decoration: none; color: #fff3ec; letter-spacing: -0.02em; }
.mobile-link .numeral { font-size: 0.95rem; font-family: var(--font-body); font-weight: 700; letter-spacing: 0.1em; }
.mobile-link.is-active { color: var(--caramel); }

.menu-enter-active, .menu-leave-active { transition: opacity 0.3s var(--ease), transform 0.3s var(--ease); }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-12px); }

@media (min-width: 1024px) {
  .nav-desktop { display: flex; }
  .menu-btn { display: none; }
  .bar { padding-right: 0.9rem; }
}
</style>
