/**
 * v-reveal : fait apparaître un bloc en douceur quand il entre à l'écran.
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

export const reveal = {
  mounted(el, binding) {
    if (reduced() || typeof IntersectionObserver === 'undefined') return
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
