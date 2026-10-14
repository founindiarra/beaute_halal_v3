<script setup>
import { computed, ref } from 'vue'

import { useSalon } from '@/composables/useSalon'
import { heroImages } from '@/data/heroImages'

const { salon, loaded } = useSalon()
const failed = ref(false)

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
          <img v-if="!failed" :src="heroImages.home" alt="Locks aux reflets dorés, à contre-jour" fetchpriority="high" decoding="async" @error="failed = true" />
          <svg v-else viewBox="0 0 120 200" aria-hidden="true"><path d="M60 6c-34 22-34 48 0 70s34 48 0 70-34 36 0 48" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".85" /></svg>
        </div>
        <div class="float f1" aria-hidden="true">
          <span class="pulse" /> <span><strong>Réservation en ligne</strong><br />Créneaux en direct</span>
        </div>
        <span class="stamp" aria-hidden="true">Locks<br />Soins<br />Entretien</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { padding-block: clamp(2rem, 5vw, 4.5rem) clamp(4rem, 8vw, 7rem); overflow: hidden; }
.grid { display: grid; gap: 3.5rem; align-items: center; }
.copy { display: grid; gap: 1.6rem; align-content: start; }
h1 { font-size: clamp(2.5rem, 7vw, 5rem); }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.8rem; margin-top: 0.3rem; }
.note { display: flex; align-items: center; gap: 0.6rem; font-size: 0.92rem; color: var(--muted); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #2e9e63; box-shadow: 0 0 0 4px rgba(46, 158, 99, 0.2); flex: none; }

.art { position: relative; width: min(100%, 460px); justify-self: center; aspect-ratio: 1 / 1.12; }
.ring { position: absolute; inset: -4% -6% 6% 8%; border-radius: 58% 42% 46% 54% / 48% 56% 44% 52%; background: var(--grad); opacity: 0.95; animation: morph 14s ease-in-out infinite alternate; }
.photo { position: absolute; inset: 4% 8% 0 0; border-radius: 44% 56% 52% 48% / 52% 44% 56% 48%; overflow: hidden; background: var(--grad-dark); box-shadow: var(--shadow-lift); border: 6px solid #fff; display: grid; place-items: center; animation: morph2 14s ease-in-out infinite alternate; }
.photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
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
