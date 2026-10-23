<script setup>
import { computed, ref } from 'vue'

import { useSalon } from '@/composables/useSalon'
import { heroImages } from '@/data/heroImages'
import { SITE } from '@/data/tarifs'

const props = defineProps({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
})
/* Textes réglés dans le dashboard (« Textes et règles du site ») ; une page peut imposer les siens. */
const titre = computed(() => props.title || SITE.invitation.titre)
const texte = computed(() => props.text || SITE.invitation.texte)

const { salon, hasWhatsapp, whatsappLink } = useSalon()
const failed = ref(false)
</script>

<template>
  <section class="cta-band">
    <div class="container">
      <div class="card on-dark" v-reveal.zoom>
        <img v-if="!failed" v-parallax="0.07" class="bg" :src="heroImages.cta" alt="" loading="lazy" decoding="async" @error="failed = true" />
        <div class="veil" aria-hidden="true" />
        <div class="grid">
          <div class="lead">
            <p class="eyebrow">Rendez-vous</p>
            <h2>{{ titre }}</h2>
            <p class="lede">{{ texte }}</p>
            <div class="cta">
              <RouterLink :to="{ name: 'booking' }" v-magnetic class="btn btn-primary btn-glow">Prendre rendez-vous</RouterLink>
              <a v-if="hasWhatsapp" :href="whatsappLink()" class="btn btn-outline" target="_blank" rel="noopener noreferrer">WhatsApp<span class="sr-only"> (nouvel onglet)</span></a>
            </div>
          </div>
          <div v-if="salon.address.city || salon.phone.display" class="info">
            <address v-if="salon.address.city">
              {{ [salon.address.line1, salon.address.line2].filter(Boolean).join(', ') }}<br v-if="salon.address.line1 || salon.address.line2" />
              {{ salon.address.city }}
            </address>
            <a v-if="salon.phone.display" class="tel" :href="salon.phone.href || `tel:${salon.phone.display.replace(/\s/g, '')}`">{{ salon.phone.display }}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-band { padding-block: clamp(2rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem); }
.card { position: relative; isolation: isolate; overflow: hidden; border-radius: var(--radius-lg); padding: clamp(1.8rem, 5vw, 4rem); box-shadow: var(--shadow-lift); }
.bg { position: absolute; left: 0; top: -12%; z-index: -2; width: 100%; height: 124%; object-fit: cover; object-position: center 40%; }
.veil { position: absolute; inset: 0; z-index: -1; background: linear-gradient(100deg, rgba(50, 24, 15, 0.95) 0%, rgba(50, 24, 15, 0.8) 55%, rgba(107, 61, 36, 0.45) 100%); }
.grid { display: grid; gap: 2.5rem; }
.lead { display: grid; gap: 1.2rem; align-content: start; }
.lead h2 { color: #fff; }
.cta { display: flex; flex-wrap: wrap; gap: 0.9rem; margin-top: 0.4rem; }
.info { display: grid; gap: 1.4rem; align-content: start; padding: 1.4rem; border-radius: 22px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); }
address { font-style: normal; color: var(--on-dark-muted); }
.tel { font-family: var(--font-display); font-size: 1.6rem; text-decoration: none; color: var(--caramel); width: fit-content; }
@media (min-width: 900px) { .grid { grid-template-columns: 1.3fr 1fr; gap: 3.5rem; align-items: center; } }
</style>
