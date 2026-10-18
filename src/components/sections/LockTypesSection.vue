<script setup>
import ApiImage from '@/components/ui/ApiImage.vue'
import { BRAND_TAGLINE, LOCK_TYPES, startingPrice } from '@/data/tarifs'
import { typeImages } from '@/data/heroImages'
import { formatPrice } from '@/utils/format'

/* Les 3 familles de prestations du salon (documents du salon) : Traditionnels, Small, Micro.
   `detailed` (page Nos services) ajoute le délai de resserrage, la réparation et l'état des locks. */
defineProps({ title: { type: Boolean, default: true }, detailed: { type: Boolean, default: false } })
/* Photo du salon facultative : /public/images/types/<id>.jpg ; sinon photo d'ambiance. */
const src = (id) => typeImages[id]
</script>

<template>
  <section class="section on-paper types" aria-labelledby="types-title">
    <div class="container">
      <header v-if="title" class="head" v-reveal>
        <div>
          <p class="eyebrow">Nos services</p>
          <h2 id="types-title">Trois types de locks, <em>un même savoir-faire</em></h2>
        </div>
        <RouterLink :to="{ name: 'services', hash: '#tarifs' }" class="link-arrow">Voir tous les tarifs <span class="arrow" aria-hidden="true">→</span></RouterLink>
      </header>
      <h2 v-else id="types-title" class="sr-only">Nos types de locks</h2>
      <ul class="grid">
        <li v-for="(t, i) in LOCK_TYPES" :key="t.id" v-reveal="i * 90">
          <article class="card">
            <div class="media">
              <ApiImage :src="src(t.id)" :alt="`Exemple de ${t.name}`" ratio="4 / 5" class="pic" />
              <span class="chip">{{ t.tagline }}</span>
              <span class="badge"><small>à partir de</small><strong>{{ formatPrice(startingPrice(t.id)) }}</strong></span>
              <div class="over">
                <h3>{{ t.name }}</h3>
                <p class="size">Diamètre {{ t.size }}</p>
              </div>
            </div>
            <div class="body">
              <p class="desc">{{ t.description }}</p>
              <ul class="facts">
                <li>{{ t.rhythm }}</li>
                <li v-if="detailed">Réparation : {{ t.repair.text }}</li>
                <li v-if="detailed">Resserrage complet ou reprise de racines seule (−30 %)</li>
                <li v-if="detailed">Tarif ajusté selon le délai et l’état des locks</li>
              </ul>
              <div class="actions">
                <RouterLink :to="{ name: 'services', query: { type: t.id }, hash: '#tarifs' }" class="btn btn-outline btn-xs">Voir les tarifs</RouterLink>
                <RouterLink :to="{ name: 'booking', query: { type: t.id } }" class="btn btn-primary btn-xs" :aria-label="`Réserver ${t.name}`">Réserver</RouterLink>
              </div>
            </div>
          </article>
        </li>
      </ul>
      <p class="brand">{{ BRAND_TAGLINE }}</p>
    </div>
  </section>
</template>

<style scoped>
.types { padding-top: clamp(1.5rem, 3vw, 2.5rem); }
.head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 2.5rem; }
.head > div { display: grid; gap: 1rem; }
.grid { display: grid; gap: 1.6rem; }
.card { position: relative; display: flex; flex-direction: column; height: 100%; background: #fff; border-radius: 30px; box-shadow: var(--shadow); overflow: hidden; transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease); }
.card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lift); }
.media { position: relative; overflow: hidden; }
.pic :deep(img) { transition: transform 1.1s var(--ease); }
.card:hover .pic :deep(img) { transform: scale(1.07); }
.media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(74, 37, 18, 0.18) 0%, transparent 35%, rgba(74, 37, 18, 0.88) 100%); pointer-events: none; }
.chip { position: absolute; z-index: 1; left: 1rem; top: 1rem; padding: 0.35rem 0.85rem; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink); background: rgba(255, 255, 255, 0.92); border-radius: 999px; backdrop-filter: blur(6px); }
.badge { position: absolute; z-index: 1; right: 1rem; top: 1rem; display: grid; justify-items: end; padding: 0.4rem 0.85rem; color: #fff; background: var(--grad-btn); border-radius: 16px; box-shadow: var(--shadow); line-height: 1.1; }
.badge small { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
.badge strong { font-family: var(--font-display); font-size: 1.05rem; }
.over { position: absolute; z-index: 1; left: 0; right: 0; bottom: 0; padding: 1.3rem 1.4rem; color: #fff; }
.over h3 { font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: #fff; }
.size { margin-top: 0.2rem; font-size: 0.92rem; font-weight: 600; color: #f1dfb2; }
.body { display: flex; flex-direction: column; flex: 1; gap: 0.9rem; padding: 1.3rem 1.5rem 1.5rem; }
.desc { color: var(--muted); }
.facts { display: grid; gap: 0.45rem; padding: 0; list-style: none; font-size: 0.92rem; font-weight: 600; }
.facts li { position: relative; padding-left: 1.6rem; }
.facts li::before { content: '✦'; position: absolute; left: 0; top: 0; color: var(--copper); }
.actions { display: flex; gap: 0.7rem; margin-top: auto; padding-top: 0.4rem; }
.actions .btn { flex: 1 1 0; justify-content: center; text-align: center; white-space: nowrap; }
.brand { margin-top: 1.8rem; text-align: center; font-family: var(--font-display); font-style: italic; color: var(--muted); }
@media (min-width: 900px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 1.8rem; } }
</style>
