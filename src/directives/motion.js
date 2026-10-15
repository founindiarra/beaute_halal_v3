/**
 * Micro-interactions « premium » : parallaxe, bouton magnétique, inclinaison 3D.
 * Toutes sont désactivées si l'utilisateur préfère moins d'animations, et celles qui
 * dépendent du pointeur ne s'activent que sur les appareils à souris (pas de tactile).
 * Seules les propriétés `translate`, `scale` et `transform` sont animées (GPU).
 */
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

/* ── Parallaxe : v-parallax="0.12" (négatif = sens inverse) ─────────────── */
const parallaxed = new Set()
let ticking = false
const updateParallax = () => {
  ticking = false
  const vh = window.innerHeight
  for (const el of parallaxed) {
    const r = el.getBoundingClientRect()
    if (r.bottom < -100 || r.top > vh + 100) continue
    const offset = (r.top + r.height / 2 - vh / 2) * el.__speed
    el.style.translate = `0 ${offset.toFixed(1)}px`
  }
}
const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateParallax)
}
export const parallax = {
  mounted(el, binding) {
    if (reduced()) return
    el.__speed = Number(binding.value ?? 0.1)
    el.style.willChange = 'translate'
    if (!parallaxed.size) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
    }
    parallaxed.add(el)
    onScroll()
  },
  updated(el, binding) {
    el.__speed = Number(binding.value ?? 0.1)
  },
  unmounted(el) {
    parallaxed.delete(el)
    if (!parallaxed.size) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  },
}

/* ── Bouton magnétique : v-magnetic ou v-magnetic="0.3" ─────────────────── */
export const magnetic = {
  mounted(el, binding) {
    const strength = Number(binding.value ?? 0.28)
    if (!strength || reduced() || !finePointer()) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
    }
    /* Retour en douceur via l'API Web Animations : n'écrase pas les transitions CSS du bouton. */
    const leave = () => {
      const from = el.style.translate || '0 0'
      el.style.translate = ''
      el.animate([{ translate: from }, { translate: '0 0' }], { duration: 450, easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)' })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.__magnetic = { move, leave }
  },
  unmounted(el) {
    if (!el.__magnetic) return
    el.removeEventListener('pointermove', el.__magnetic.move)
    el.removeEventListener('pointerleave', el.__magnetic.leave)
  },
}

/* ── Inclinaison 3D + reflet : v-tilt ou v-tilt="6" (degrés max) ────────────
   Pose les variables --rx, --ry (angles) et --mx, --my (position du reflet, en %)
   que la feuille de style du composant utilise. */
export const tilt = {
  mounted(el, binding) {
    if (reduced() || !finePointer()) return
    const max = Number(binding.value ?? 5)
    let frame = 0
    const move = (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`)
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      el.style.removeProperty('--rx')
      el.style.removeProperty('--ry')
    }
    el.classList.add('is-tilt')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.__tilt = { move, leave }
  },
  unmounted(el) {
    if (!el.__tilt) return
    el.removeEventListener('pointermove', el.__tilt.move)
    el.removeEventListener('pointerleave', el.__tilt.leave)
  },
}
