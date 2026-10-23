<script setup>
import { useSalon } from '@/composables/useSalon'
import EmText from '@/components/ui/EmText.vue'
import { SITE } from '@/data/tarifs'
import { pad2 } from '@/utils/format'

const { salon } = useSalon()
</script>

<template>
  <section class="section approach">
    <div class="container">
      <div class="panel">
        <div v-reveal.left class="statement">
          <p class="eyebrow">{{ SITE.approche.eyebrow }}</p>
          <h2><EmText :text="SITE.approche.titre" /></h2>
          <p v-if="salon.tagline" class="lede">{{ salon.tagline }}</p>
          <RouterLink :to="{ name: 'about' }" class="link-arrow">{{ SITE.approche.lien }} <span class="arrow" aria-hidden="true">→</span></RouterLink>
        </div>
        <ul class="values">
          <li v-for="(v, i) in SITE.approche.valeurs" :key="v.title" v-reveal.right="i * 110">
            <span class="numeral">{{ pad2(i + 1) }}</span>
            <div>
              <h3>{{ v.title }}</h3>
              <p>{{ v.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.approach { padding-block: 1rem clamp(3rem, 6vw, 5rem); }
.panel { display: grid; gap: 2.5rem; padding: clamp(1.6rem, 4vw, 3.5rem); border-radius: var(--radius-lg); background: var(--grad-soft); box-shadow: var(--shadow); }
.statement { display: grid; gap: 1.4rem; align-content: start; }
.values { display: grid; gap: 1rem; }
.values li { display: grid; grid-template-columns: 3.4rem 1fr; gap: 0.8rem; padding: 1.3rem 1.4rem; background: rgba(255, 255, 255, 0.78); border-radius: 22px; backdrop-filter: blur(6px); }
.values .numeral { font-size: 2.2rem; }
.values li { transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease), background-color 0.3s; }
.values li:hover { transform: translateX(8px); background: rgba(255, 255, 255, 0.95); box-shadow: var(--shadow); }
.values p { color: var(--muted); margin-top: 0.3rem; font-size: 0.97rem; }
@media (min-width: 900px) { .panel { grid-template-columns: 1.05fr 1fr; gap: 4rem; align-items: center; } }
</style>
