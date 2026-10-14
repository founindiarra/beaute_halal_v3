<script setup>
import { process } from '@/data/editorial'
import { pad2 } from '@/utils/format'
</script>

<template>
  <section class="section">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">Comment ça marche</p>
        <h2>Votre demande en <em>quatre temps</em></h2>
      </header>
      <ol class="steps">
        <li v-for="(s, i) in process" :key="s.title" v-reveal="i * 90">
          <span class="numeral">{{ pad2(i + 1) }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.head { display: grid; gap: 1rem; margin-bottom: 2.5rem; }
.steps { display: grid; gap: 1.2rem; }
.steps li { display: grid; gap: 0.6rem; padding: 1.7rem; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); position: relative; overflow: hidden; }
.steps li::before { content: ''; position: absolute; left: 0; top: 0; right: 0; height: 5px; background: var(--grad); }
.numeral { font-size: 3rem; }
.steps p { color: var(--muted); }
@media (min-width: 640px) { .steps { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .steps { grid-template-columns: repeat(4, 1fr); } .steps li:nth-child(even) { transform: translateY(1.6rem); } }
</style>
