<script setup>
import Wordmark from '@/components/ui/Wordmark.vue'
import { useSalon } from '@/composables/useSalon'

const { salon, hours, hasWhatsapp, whatsappLink } = useSalon()
const year = new Date().getFullYear()

const nav = [
  { name: 'home', label: 'Accueil' },
  { name: 'services', label: 'Nos services' },
  { name: 'gallery', label: 'Nos coiffures' },
  { name: 'about', label: 'À propos' },
  { name: 'booking', label: 'Rendez-vous' },
  { name: 'contact', label: 'Contact' },
]
</script>

<template>
  <footer class="footer-wrap on-dark">
    <svg class="wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" fill="#181310" /></svg>
    <div class="footer on-dark">
      <div v-reveal.fade class="container grid">
        <div class="col-brand">
          <RouterLink :to="{ name: 'home' }" class="brand" aria-label="Beauté Halal — accueil"><Wordmark /></RouterLink>
          <p v-if="salon.tagline || salon.shortDescription" class="blurb">{{ salon.tagline || salon.shortDescription }}</p>
          <ul v-if="salon.socials?.length" class="socials" aria-label="Réseaux sociaux">
            <li v-for="s in salon.socials" :key="s.id || s.url">
              <a :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.label || s.id }}<span class="sr-only"> (nouvel onglet)</span></a>
            </li>
          </ul>
        </div>

        <nav class="col" aria-label="Pied de page">
          <h2 class="h">Navigation</h2>
          <ul>
            <li v-for="l in nav" :key="l.name"><RouterLink :to="{ name: l.name }">{{ l.label }}</RouterLink></li>
          </ul>
        </nav>

        <div class="col">
          <h2 class="h">Contact</h2>
          <ul>
            <li v-if="salon.address.city">
              <address>
                <template v-if="salon.address.line1">{{ salon.address.line1 }}<br /></template>
                <template v-if="salon.address.line2">{{ salon.address.line2 }}<br /></template>
                {{ salon.address.city }}<template v-if="salon.address.country">, {{ salon.address.country }}</template>
              </address>
            </li>
            <li v-if="salon.phone.display"><a :href="salon.phone.href || `tel:${salon.phone.display.replace(/\s/g, '')}`">{{ salon.phone.display }}</a></li>
            <li v-if="hasWhatsapp"><a :href="whatsappLink()" target="_blank" rel="noopener noreferrer">WhatsApp<span class="sr-only"> (nouvel onglet)</span></a></li>
            <li v-if="salon.email"><a :href="`mailto:${salon.email}`">{{ salon.email }}</a></li>
            <li v-if="!salon.address.city && !salon.phone.display && !hasWhatsapp && !salon.email">
              <RouterLink :to="{ name: 'contact' }">Page contact</RouterLink>
            </li>
          </ul>
        </div>

        <div v-if="hours.length" class="col">
          <h2 class="h">Horaires</h2>
          <dl class="hours">
            <div v-for="h in hours" :key="h.day"><dt>{{ h.day }}</dt><dd>{{ h.value }}</dd></div>
          </dl>
        </div>
      </div>

      <div class="container legal"><p>© {{ year }} Beauté Halal. Tous droits réservés.</p></div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wrap { margin-top: -1px; background: var(--ivory); }
.footer { background: var(--grad-dark); padding-top: clamp(2.5rem, 6vw, 4.5rem); }
.wave { margin-bottom: -1px; }
.grid { display: grid; gap: 2.75rem 2rem; grid-template-columns: 1fr; padding-bottom: 3.5rem; }
.brand { display: inline-block; text-decoration: none; margin-bottom: 1.25rem; color: #f7f4ee; }
.brand :deep(.wordmark), .brand :deep(.wordmark-name) { color: #f7f4ee; }
.brand :deep(.wordmark-sub) { color: rgba(246, 243, 235, 0.78); }
.blurb { color: var(--on-dark-muted); max-width: 26rem; }
.socials { display: flex; flex-wrap: wrap; gap: 0.25rem 1.25rem; margin-top: 1.25rem; }
.h { font-family: var(--font-body); font-size: 0.76rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: var(--caramel); margin-bottom: 1rem; line-height: 1.2; }
.col ul { display: flex; flex-direction: column; gap: 0.1rem; }
.col a, .socials a { display: inline-flex; align-items: center; min-height: 40px; text-decoration: none; color: #f7f4ee; }
.col a:hover, .socials a:hover { color: var(--caramel); text-decoration: underline; text-underline-offset: 4px; }
address { font-style: normal; color: var(--on-dark-muted); padding-block: 0.4rem; }
.hours > div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.45rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.14); font-size: 0.95rem; }
.hours dt { color: var(--on-dark-muted); }
.hours dd { margin: 0; text-align: right; }
.legal { border-top: 1px solid rgba(255, 255, 255, 0.14); padding-block: 1.4rem 1.8rem; color: var(--on-dark-muted); font-size: 0.88rem; }
@media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } .col-brand { grid-column: 1 / -1; } }
@media (min-width: 1024px) { .grid { grid-template-columns: 1.5fr 1fr 1.1fr 1.1fr; } .col-brand { grid-column: auto; } }
</style>
