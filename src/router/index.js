import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import { SITE } from '@/data/tarifs'
import { applyPageMeta } from '@/utils/seo'

const BRAND = 'Beauté Halal'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: `${BRAND} — Locks, Small Locks et Micro-Locks à Abidjan`,
      description:
        'Spécialiste des locks et soins capillaires texturés à Abidjan. Resserrage de locks traditionnelles, small locks et micro-locks. Prise de rendez-vous en ligne.',
    },
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('@/views/ServicesView.vue'),
    meta: {
      title: `Nos services — ${BRAND}`,
      description: 'Locks traditionnelles, small locks et micro-locks : grille tarifaire du resserrage selon le volume, le délai et l’état de vos locks. Réservez en ligne.',
    },
  },
  {
    path: '/galerie',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue'),
    meta: {
      title: `Nos coiffures — ${BRAND}`,
      description: 'Les coiffures réalisées au salon. Choisissez celle qui vous plaît et demandez un rendez-vous.',
    },
  },
  {
    path: '/a-propos',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: `À propos — ${BRAND}`,
      description: 'Beauté Halal, l’art du soin capillaire texturé : notre engagement sur les racines et les tiges, nos tarifs transparents et le déroulé de votre rendez-vous.',
    },
  },
  {
    path: '/paiement/:reference',
    name: 'payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { title: `Paiement de la consultation — ${BRAND}`, description: 'Réglez la consultation pour valider votre rendez-vous.', noindex: true },
  },
  {
    path: '/rendez-vous',
    name: 'booking',
    component: () => import('@/views/BookingView.vue'),
    meta: {
      title: `Rendez-vous — ${BRAND}`,
      description: 'Choisissez création complète ou resserrage, votre type de locks et votre volume, puis envoyez votre demande au salon.',
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: {
      title: `Contact — ${BRAND}`,
      description: 'Coordonnées du salon Beauté Halal. Écrivez-nous par formulaire, téléphone ou WhatsApp.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: `Page introuvable — ${BRAND}`, description: 'Cette page n’existe pas ou n’existe plus.', noindex: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    const position = saved || (to.hash ? { el: to.hash, top: 90, behavior: 'smooth' } : { top: 0 })
    /* Changement de page : on attend la fin du fondu de sortie (voir .page-leave-active)
       pour ne pas faire « sauter » l'ancienne page en haut avant qu'elle ne disparaisse. */
    const changesPage = from.name && to.name !== from.name
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!changesPage || reduced) return position
    return new Promise((resolve) => setTimeout(() => resolve(position), 240))
  },
})

/* Nouveau déploiement entre deux pages : le fichier de la vue a changé de nom.
   On recharge une seule fois (drapeau de session) plutôt que de rester figé. */
const FLAG = 'bh3_chunk_reload'
router.onError((error, to) => {
  const failed = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    String(error?.message ?? ''),
  )
  if (!failed || !to?.fullPath) return
  let already = false
  try {
    already = sessionStorage.getItem(FLAG) === '1'
    sessionStorage.setItem(FLAG, '1')
  } catch {
    /* stockage bloqué : une tentative suffit */
  }
  if (!already) window.location.assign(to.fullPath)
})

router.afterEach((to) => {
  try {
    sessionStorage.removeItem(FLAG)
  } catch {
    /* sans importance */
  }
  /* Titre et description de la page : ceux du dashboard (« Textes et règles du site ») s'ils existent. */
  const seo = SITE.seo?.[to.name] ?? {}
  applyPageMeta({
    title: seo.title || to.meta.title || BRAND,
    description: seo.description || to.meta.description || '',
    path: to.path,
    noindex: Boolean(to.meta.noindex),
  })
})

export default router
