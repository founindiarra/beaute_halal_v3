<script setup>
import EmText from '@/components/ui/EmText.vue'
import { SITE, goodToKnow } from '@/data/tarifs'
</script>

<template>
  <section class="section gtk" aria-labelledby="gtk-title">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">{{ SITE.sections.bonASavoir.eyebrow }}</p>
        <h2 id="gtk-title"><EmText :text="SITE.sections.bonASavoir.titre" /></h2>
      </header>
      <ul class="list">
        <li v-for="(g, i) in goodToKnow" :key="g.title" v-reveal="(i % 3) * 80">
          <h3>{{ g.title }}</h3>
          <p>{{ g.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.head { display: grid; gap: 1rem; margin-bottom: 2rem; }
.list { display: grid; gap: 1.2rem; }
.list li { display: grid; gap: 0.5rem; padding: 1.5rem; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); position: relative; overflow: hidden; }
.list li::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--grad); }
.list li:hover { transform: translateY(-6px); box-shadow: var(--shadow-lift); }
.list h3 { font-size: 1.2rem; }
.list p { color: var(--muted); font-size: 0.97rem; }
@media (min-width: 700px) { .list { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .list { grid-template-columns: repeat(3, 1fr); } }
</style>
