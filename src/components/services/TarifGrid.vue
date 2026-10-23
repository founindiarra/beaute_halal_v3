<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import EmText from '@/components/ui/EmText.vue'
import { FORMULES, LOCK_TYPES, LONGUEURS, SITE, VOLUMES, consultation, engagement, findType, videoAdvice } from '@/data/tarifs'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const activeId = ref(findType(route.query.type)?.id ?? LOCK_TYPES[0].id)
watch(() => route.query.type, (t) => { if (findType(t)) activeId.value = t })
const active = computed(() => LOCK_TYPES.find((t) => t.id === activeId.value))
const fmt = (n) => formatPrice(Math.abs(n))
const signed = (d) => (d.amount === 0 ? 'Tarif standard' : `${d.amount > 0 ? '+' : '−'} ${fmt(d.amount)}${d.orMore ? ' ou plus' : ''}`)
const etatLabel = (e) => (e.pct ? `+ ${e.pct} %${e.orMore ? ' à 50 %' : ''}` : 'Pas de majoration')
const reserver = (volume) => ({ name: 'booking', query: { type: activeId.value, volume } })
</script>

<template>
  <section id="tarifs" class="section on-paper tarifs" aria-labelledby="tarifs-title">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">{{ SITE.sections.grille.eyebrow }}</p>
        <h2 id="tarifs-title"><EmText :text="SITE.sections.grille.titre" /></h2>
        <p class="lede">{{ SITE.sections.grille.intro }}</p>
      </header>

      <div class="tabs" role="group" aria-label="Type de locks">
        <button v-for="t in LOCK_TYPES" :key="t.id" type="button" class="tab" :aria-pressed="activeId === t.id" @click="activeId = t.id">{{ t.name }}</button>
      </div>

      <div class="board" v-reveal>
        <div class="meta">
          <h3>{{ active.name }}</h3>
          <p class="size">{{ active.size }}</p>
          <p class="rhythm">{{ active.rhythm }}</p>
        </div>
        <div class="scroll">
          <table>
            <caption class="sr-only">Tarifs du resserrage {{ active.name }} selon le volume</caption>
            <thead>
              <tr>
                <th scope="col">Volume</th>
                <th scope="col">Complet <small>racines + tiges</small></th>
                <th scope="col">Racines <small>seules, −30 %</small></th>
                <th scope="col"><span class="sr-only">Réserver</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in VOLUMES" :key="v.id">
                <th scope="row"><span class="vol">{{ v.id }}</span><small>{{ v.label }}</small></th>
                <td class="p">{{ formatPrice(active.prices[v.id][0]) }}</td>
                <td class="p alt">{{ formatPrice(active.prices[v.id][1]) }}</td>
                <td class="go"><RouterLink :to="reserver(v.id)" class="mini" :aria-label="`Réserver ${active.name}, volume ${v.id}`"><span class="t">Réserver</span><span class="ar" aria-hidden="true">→</span></RouterLink></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="adjust">
        <article class="note" v-reveal>
          <h3>Ajustements selon le délai</h3>
          <ul class="kv">
            <li v-for="d in active.delais" :key="d.id"><span>{{ d.label }}<small v-if="d.detail"> · {{ d.detail }}</small></span><strong>{{ signed(d) }}</strong></li>
          </ul>
        </article>
        <article class="note" v-reveal="80">
          <h3>Majoration selon l’état des locks</h3>
          <ul class="kv">
            <li v-for="e in active.etats" :key="e.id"><span>{{ e.label }}<small v-if="e.pct"> · {{ e.detail.split(' · ')[0] }}</small></span><strong>{{ etatLabel(e) }}</strong></li>
          </ul>
        </article>
        <article class="note" v-reveal="160">
          <h3>Réparation</h3>
          <p class="big">{{ active.repair.text }}</p>
          <p class="video">Tarif indicatif selon l’ampleur des dégâts. Réparations offertes pour les clientes abonnées à l’Institut Beauté Halal qui respectent le calendrier de suivi.</p>
        </article>
      </div>

      <div class="notes">
        <article class="note formules" v-reveal>
          <h3>Deux formules au choix</h3>
          <ul>
            <li v-for="f in FORMULES.slice(0, 2)" :key="f.id"><strong>{{ f.label }}</strong> {{ f.help }}</li>
          </ul>
        </article>
        <article class="note engage" v-reveal>
          <h3>Notre engagement</h3>
          <p>{{ engagement }}</p>
        </article>
        <article class="note" v-reveal="80">
          <h3>Reconnaître votre volume</h3>
          <ul>
            <li v-for="v in VOLUMES" :key="v.id"><strong>{{ v.id }}</strong> {{ v.hint }}</li>
          </ul>
          <p class="video">{{ videoAdvice }}</p>
        </article>
        <article class="note" v-reveal="160">
          <h3>Votre longueur</h3>
          <ul>
            <li v-for="l in LONGUEURS" :key="l.label"><strong>{{ l.label }}</strong> {{ l.hint }}</li>
          </ul>
          <p class="video">{{ consultation.nouvelle }}.<br />{{ consultation.ancienne }}.<br />{{ consultation.final }}</p>
        </article>
      </div>
      <p class="foot">Tarifs indicatifs en FCFA : le salon confirme votre volume et votre longueur avant le rendez-vous.</p>
    </div>
  </section>
</template>

<style scoped>
.tarifs { scroll-margin-top: 5rem; }
.head { display: grid; gap: 0.9rem; margin-bottom: 2rem; max-width: 46rem; }
.lede { color: var(--muted); }
.tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.2rem; }
.tab { min-height: 44px; padding: 0.4rem 1.3rem; font-weight: 700; font-size: 0.92rem; background: #fff; color: var(--ink); border: 1.5px solid rgba(42, 21, 32, 0.15); border-radius: 999px; cursor: pointer; transition: all 0.25s var(--ease); }
.tab:hover { border-color: var(--copper); color: var(--copper); }
.tab[aria-pressed='true'] { background: var(--grad-btn); border-color: transparent; color: #fff; }

.board { min-width: 0; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
.meta { display: grid; gap: 0.2rem; padding: 1.4rem 1.6rem 1rem; }
.meta h3 { font-size: clamp(1.4rem, 2.6vw, 1.9rem); }
.size { font-weight: 800; color: var(--copper); }
.rhythm { color: var(--muted); font-size: 0.95rem; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; padding: 0.8rem 1.2rem; font-size: 0.82rem; letter-spacing: 0.06em; text-transform: uppercase; color: #fff; background: var(--ink); }
thead small { display: block; font-size: 0.7rem; letter-spacing: 0; text-transform: none; color: var(--caramel); font-weight: 500; }
tbody tr:nth-child(even) { background: var(--paper); }
tbody th, tbody td { padding: 0.9rem 1.2rem; text-align: left; vertical-align: middle; }
tbody th { display: grid; grid-template-columns: auto 1fr; gap: 0 0.8rem; align-items: baseline; font-weight: 500; }
.vol { font-family: var(--font-display); font-size: 1.5rem; color: var(--copper); min-width: 2.2rem; }
tbody th small { color: var(--muted); font-size: 0.8rem; }
.p { font-weight: 700; white-space: nowrap; }
.p.alt { font-weight: 600; color: var(--muted); }
.go { text-align: right; }
.mini { display: inline-flex; align-items: center; min-height: 44px; padding: 0 1rem; font-weight: 700; font-size: 0.85rem; color: var(--copper); text-decoration: none; border: 1.5px solid currentColor; border-radius: 999px; transition: all 0.25s var(--ease); }
.ar { display: none; }
.mini:hover { background: var(--grad-btn); border-color: transparent; color: #fff; }
.adjust, .notes { display: grid; gap: 1.2rem; margin-top: 1.6rem; }
.kv { display: grid; gap: 0.5rem; }
.kv li { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--line); font-size: 0.93rem; }
.kv small { color: var(--muted); }
.big { font-family: var(--font-display); font-size: 1.4rem; color: var(--copper); }
.note { position: relative; padding: clamp(1.5rem, 3vw, 2.1rem); background: #fff; border-radius: 26px; box-shadow: var(--shadow); display: grid; gap: 1rem; align-content: start; overflow: hidden; transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease); }
.note:hover { transform: translateY(-4px); box-shadow: var(--shadow-lift); }
.note::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 4px; background: var(--grad); }
.note h3 { font-size: clamp(1.35rem, 2.4vw, 1.7rem); }
.note ul { display: grid; gap: 0.85rem; font-size: 0.97rem; line-height: 1.5; }
.note li { display: grid; grid-template-columns: 5.6rem 1fr; gap: 0.2rem 1rem; align-items: baseline; padding-bottom: 0.85rem; border-bottom: 1px solid rgba(50, 24, 15, 0.08); }
.note li:last-child { border-bottom: 0; padding-bottom: 0; }
.note li strong { display: grid; place-items: center; min-height: 2.1rem; padding: 0.2rem 0.6rem; font-size: 0.82rem; letter-spacing: 0.04em; color: var(--copper); background: var(--grad-soft); border-radius: 999px; }
.formules li { grid-template-columns: 1fr; gap: 0.35rem; }
.formules li strong { justify-self: start; place-items: start; padding: 0.3rem 0.9rem; font-size: 0.88rem; }
.video { padding: 0.9rem 1.1rem; font-size: 0.92rem; line-height: 1.55; color: var(--muted); background: var(--grad-soft); border-radius: 16px; }
.engage { background: linear-gradient(155deg, #2a1d14 0%, var(--ink) 70%); color: #fff; align-content: center; }
.engage::before { background: var(--grad); }
.engage h3 { color: var(--caramel); font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; font-family: var(--font-body, inherit); }
.engage p { font-family: var(--font-display); font-style: italic; font-size: clamp(1.3rem, 2.6vw, 1.7rem); line-height: 1.4; }
.foot { margin-top: 1rem; font-size: 0.88rem; color: var(--muted); }
@media (max-width: 599px) {
  thead th, tbody th, tbody td { padding: 0.7rem 0.6rem; }
  thead th:first-child, tbody th { padding-left: 0.9rem; }
  tbody th small { display: none; }
  .p { font-size: 0.85rem; white-space: normal; }
  .mini { min-width: 44px; justify-content: center; padding: 0; }
  .mini .t { display: none; }
  .mini .ar { display: inline; font-size: 1.1rem; }
}
@media (min-width: 900px) { .adjust { grid-template-columns: repeat(3, 1fr); } .notes { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 720px) { .notes { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } }
</style>
