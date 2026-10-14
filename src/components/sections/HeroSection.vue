<script setup>
import { computed, ref } from 'vue'

import { useSalon } from '@/composables/useSalon'
import { heroImages } from '@/data/heroImages'

const { salon, loaded } = useSalon()
/* Photo d'accueil : si le salon dépose sa propre photo dans /public/images/hero-accueil-v3.jpg,
   elle est utilisée en priorité ; sinon (ou si elle ne se charge pas) la photo d'ambiance distante. */
const sources = ['/images/hero-accueil-v3.jpg', heroImages.home]
const idx = ref(0)
const failed = computed(() => idx.value >= sources.length)
const next = () => { idx.value += 1 }

const lede = computed(
  () =>
    salon.value.shortDescription ||
    'Salon spécialisé dans les locks. Choisissez votre prestation, un créneau disponible, et envoyez votre demande en quelques minutes.',
)
</script>

<template>
  <section class="hero blobs">
    <div class="container grid">
      <div class="copy">
        <p class="eyebrow">Salon spécialisé dans les locks</p>
        <h1>Des locks qui ont <em>du caractère</em>, de la création à l’entretien.</h1>
        <p class="lede">{{ lede }}</p>
        <div class="cta">
          <RouterLink :to="{ name: 'booking' }" class="btn btn-primary">Prendre rendez-vous</RouterLink>
          <RouterLink :to="{ name: 'services' }" class="link-arrow">Nos services <span class="arrow" aria-hidden="true">→</span></RouterLink>
        </div>
        <p v-if="loaded && salon.bookingWindowDays" class="note"><span class="dot" aria-hidden="true" /> Créneaux ouverts sur les {{ salon.bookingWindowDays }} prochains jours, mis à jour en direct.</p>
      </div>

      <div class="art">
        <div class="ring" aria-hidden="true" />
        <div class="photo">
          <img v-if="!failed" :key="idx" :src="sources[idx]" alt="Locks retombant en cascade, aux reflets chauds" fetchpriority="high" decoding="async" @error="next" />
          <svg v-else viewBox="0 0 120 200" aria-hidden="true"><path d="M60 6c-34 22-34 48 0 70s34 48 0 70-34 36 0 48" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".85" /></svg>
        </div>
        <div class="float f1" aria-hidden="true">
          <span class="pulse" /> <span><strong>Réservation en ligne</strong><br />Créneaux en direct</span>
        </div>
        <span class="stamp" aria-hidden="true">Locks<br />Soins<br />Entretien</span>
      </div>
    </div>
    <svg class="edge" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0,50 C220,100 460,10 720,45 C980,80 1200,100 1440,40 L1440,90 L0,90 Z" fill="#fcebdd" /></svg>
  </section>
</template>

<style scoped>
.hero { position: relative; padding-block: clamp(1.2rem, 3vw, 2.5rem) clamp(5.5rem, 9vw, 7.5rem); overflow: hidden; }
.edge { position: absolute; left: 0; right: 0; bottom: -1px; width: 100%; height: clamp(50px, 7vw, 90px); }
.grid { display: grid; gap: 3.5rem; align-items: center; }
.copy { display: grid; gap: 1.3rem; align-content: start; }
h1 { font-size: clamp(2rem, 4.6vw, 3.5rem); line-height: 1.08; }
.copy .lede { font-size: clamp(0.95rem, 1.15vw, 1.05rem); max-width: 34rem; }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.8rem; margin-top: 0.3rem; }
.note { display: flex; align-items: center; gap: 0.6rem; font-size: 0.92rem; color: var(--muted); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #2e9e63; box-shadow: 0 0 0 4px rgba(46, 158, 99, 0.2); flex: none; }

.art { position: relative; width: min(100%, 440px); justify-self: center; aspect-ratio: 1 / 1.05; }
.ring { position: absolute; inset: -4% -6% 6% 8%; border-radius: 58% 42% 46% 54% / 48% 56% 44% 52%; background: var(--grad); opacity: 0.95; animation: morph 14s ease-in-out infinite alternate; }
.photo { position: absolute; inset: 4% 8% 0 0; border-radius: 44% 56% 52% 48% / 52% 44% 56% 48%; overflow: hidden; background: var(--grad-dark); box-shadow: var(--shadow-lift); border: 6px solid #fff; display: grid; place-items: center; animation: morph2 14s ease-in-out infinite alternate; }
/* Cadrage serré sur les locks (comme la vignette choisie) : --zoom règle l'agrandissement, --focus le point visé. */
.photo img { --zoom: 1.75; --focus: 50% 45%; width: 100%; height: 100%; object-fit: cover; object-position: var(--focus); transform: scale(var(--zoom)); transform-origin: var(--focus); }
.photo svg { width: 38%; height: auto; }
.float { position: absolute; display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem 1.1rem; background: rgba(255, 255, 255, 0.95); border-radius: 18px; box-shadow: var(--shadow); font-size: 0.82rem; line-height: 1.3; color: var(--muted); }
.float strong { color: var(--ink); font-size: 0.9rem; }
.f1 { left: -4%; bottom: 12%; }
.pulse { width: 12px; height: 12px; border-radius: 50%; background: #2e9e63; animation: pulse 2s infinite; flex: none; }
.stamp { position: absolute; right: -2%; top: 2%; display: grid; place-items: center; width: 6.4rem; height: 6.4rem; border-radius: 50%; background: var(--ink); color: #fff; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; text-align: center; line-height: 1.55; transform: rotate(12deg); box-shadow: var(--shadow); }

@keyframes morph { to { border-radius: 42% 58% 54% 46% / 56% 44% 56% 44%; transform: rotate(4deg); } }
@keyframes morph2 { to { border-radius: 52% 48% 44% 56% / 46% 54% 46% 54%; } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(46, 158, 99, 0.5); } 70% { box-shadow: 0 0 0 10px rgba(46, 158, 99, 0); } 100% { box-shadow: 0 0 0 0 rgba(46, 158, 99, 0); } }

@media (min-width: 900px) { .grid { grid-template-columns: 1.1fr 1fr; gap: 4rem; } .art { justify-self: end; } }
@media (max-width: 420px) { .stamp { width: 5.2rem; height: 5.2rem; font-size: 0.56rem; } .f1 { left: 0; } }
</style>
