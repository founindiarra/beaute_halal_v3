<script setup>
import { computed } from 'vue'

import ContactForm from '@/components/forms/ContactForm.vue'
import DataState from '@/components/ui/DataState.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useSalon } from '@/composables/useSalon'
import { heroArt } from '@/data/heroImages'

const { salon, loading, error, hasWhatsapp, whatsappLink, reload, loaded } = useSalon()

/* La carte n'est affichée que si le salon a fourni une adresse d'intégration https. */
const mapUrl = computed(() => {
  const url = salon.value.address.mapEmbedUrl
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : ''
})
const hasInfo = computed(
  () => salon.value.phone.display || salon.value.email || salon.value.address.city || hasWhatsapp.value,
)
</script>

<template>
  <div>
    <PageHero :image="heroArt.contact" eyebrow="Contact" title="Écrivez-nous, appelez-nous." lede="Pour une question avant de réserver, ou pour modifier une demande déjà envoyée (rappelez alors votre référence).">
      <template #title>Écrivez-<em>nous</em>, appelez-nous.</template>
    </PageHero>

    <section class="section-tight">
      <div class="container grid">
        <div v-reveal.left class="info">
          <DataState :loading="loading && !loaded" :error="!loaded ? error : null" :empty="loaded && !hasInfo" loading-label="Chargement des coordonnées…" empty-label="Les coordonnées seront bientôt renseignées. Utilisez le formulaire." min-height="8rem" @retry="reload">
            <dl class="list">
              <div v-if="salon.address.city">
                <dt>Adresse</dt>
                <dd>
                  <address>
                    <template v-if="salon.address.line1">{{ salon.address.line1 }}<br /></template>
                    <template v-if="salon.address.line2">{{ salon.address.line2 }}<br /></template>
                    {{ salon.address.city }}<template v-if="salon.address.country">, {{ salon.address.country }}</template>
                  </address>
                  <p v-if="salon.address.note" class="note">{{ salon.address.note }}</p>
                </dd>
              </div>
              <div v-if="salon.phone.display">
                <dt>Téléphone</dt>
                <dd><a :href="salon.phone.href || `tel:${salon.phone.display.replace(/\s/g, '')}`">{{ salon.phone.display }}</a></dd>
              </div>
              <div v-if="hasWhatsapp">
                <dt>WhatsApp</dt>
                <dd>
                  <a :href="whatsappLink('Bonjour Beauté Halal, j’aimerais avoir une information.')" target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp<span class="sr-only"> (nouvel onglet)</span></a>
                  <p class="note">Un message WhatsApp ne vaut pas demande de rendez-vous : utilisez la page de réservation.</p>
                </dd>
              </div>
              <div v-if="salon.email">
                <dt>E-mail</dt>
                <dd><a :href="`mailto:${salon.email}`">{{ salon.email }}</a></dd>
              </div>
              <div v-if="salon.socials.length">
                <dt>Réseaux</dt>
                <dd class="socials">
                  <a v-for="s in salon.socials" :key="s.id || s.url" :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.label || s.id }}<span class="sr-only"> (nouvel onglet)</span></a>
                </dd>
              </div>
            </dl>
          </DataState>
        </div>

        <div v-reveal.right="140" class="form-col">
          <h2>Un message ?</h2>
          <ContactForm />
        </div>
      </div>
    </section>

    <section v-if="mapUrl" class="section-tight map">
      <div v-reveal.zoom class="container">
        <iframe :src="mapUrl" title="Localisation du salon" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.grid { display: grid; gap: 2rem; align-items: start; }
.info, .form-col { padding: clamp(1.4rem, 4vw, 2.4rem); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.list { display: grid; margin: 0; }
.list > div { display: grid; gap: 0.3rem; padding-block: 1.1rem; border-bottom: 1px solid rgba(74, 37, 18, 0.1); }
.list > div:first-child { padding-top: 0; }
.list > div:last-child { border-bottom: 0; padding-bottom: 0; }
dt { font-size: 0.76rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--copper); }
dd { margin: 0; font-size: 1.08rem; }
address { font-style: normal; }
dd a { text-underline-offset: 4px; }
.note { font-size: 0.88rem; color: var(--muted); margin-top: 0.3rem; }
.socials { display: flex; flex-wrap: wrap; gap: 0.2rem 1.4rem; }
.form-col { display: grid; gap: 1.6rem; align-content: start; background: var(--grad-soft); }
.form-col h2 { font-size: clamp(1.7rem, 3.4vw, 2.4rem); }
.map iframe { width: 100%; height: clamp(280px, 40vw, 440px); border: 0; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
@media (min-width: 900px) { .grid { grid-template-columns: 1fr 1.1fr; gap: 2.5rem; } }
</style>
