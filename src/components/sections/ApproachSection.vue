<script setup>
import { useSalon } from '@/composables/useSalon'
import { values } from '@/data/editorial'
import { pad2 } from '@/utils/format'

const { salon } = useSalon()
</script>

<template>
  <section class="section approach">
    <div class="container">
      <div class="panel">
        <div v-reveal class="statement">
          <p class="eyebrow">Le savoir-faire</p>
          <h2>Une affaire de <em>geste</em>, de tension et de régularité.</h2>
          <p v-if="salon.tagline" class="lede">{{ salon.tagline }}</p>
          <RouterLink :to="{ name: 'about' }" class="link-arrow">Découvrir le salon <span class="arrow" aria-hidden="true">→</span></RouterLink>
        </div>
        <ul class="values">
          <li v-for="(v, i) in values" :key="v.title" v-reveal="i * 90">
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
.values p { color: var(--muted); margin-top: 0.3rem; font-size: 0.97rem; }
@media (min-width: 900px) { .panel { grid-template-columns: 1.05fr 1fr; gap: 4rem; align-items: center; } }
</style>
