/**
 * v-reveal : fait apparaître un bloc en douceur quand il entre à l'écran.
 *   v-reveal                → fondu + montée
 *   v-reveal="120"          → idem, avec un délai (ms) : sert à l'effet « cascade » (stagger)
 *   v-reveal.zoom           → fondu + léger zoom
 *   v-reveal.left / .right  → glissement latéral
 *   v-reveal.fade           → fondu seul
 *   v-reveal.clip           → révélation par masque (photos)
 * Sans effet (contenu visible d'emblée) si l'utilisateur préfère moins d'animations
 * ou si IntersectionObserver n'existe pas.
 */
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let observer = null
const getObserver = () => {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  return observer
}

const VARIANTS = ['zoom', 'left', 'right', 'fade', 'clip']

export const reveal = {
  mounted(el, binding) {
    if (reduced() || typeof IntersectionObserver === 'undefined') return
    el.classList.add('reveal')
    const variant = VARIANTS.find((v) => binding.modifiers?.[v])
    if (variant) el.dataset.reveal = variant
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
