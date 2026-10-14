<script setup>
import VisitBlock from '@/components/sections/VisitBlock.vue'
import PageIntro from '@/components/ui/PageIntro.vue'
import { faq } from '@/data/editorial'
</script>

<template>
  <div>
    <PageIntro eyebrow="Questions fréquentes" title="Avant de demander un rendez-vous." lede="Les réponses ci-dessous décrivent le fonctionnement de ce site. Pour toute autre question, contactez le salon.">
      <template #title>Avant de <em>demander</em> un rendez-vous.</template>
    </PageIntro>
    <section class="section-tight">
      <div class="container narrow">
        <div class="list">
          <details v-for="(item, i) in faq" :key="item.q" :open="i === 0">
            <summary>
              <span>{{ item.q }}</span>
              <span class="plus" aria-hidden="true" />
            </summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
        <p class="more">Une autre question ? <RouterLink :to="{ name: 'contact' }" class="link-arrow">Contacter le salon <span class="arrow" aria-hidden="true">→</span></RouterLink></p>
      </div>
    </section>
    <VisitBlock />
  </div>
</template>

<style scoped>
.narrow { max-width: 52rem; margin-inline: 0; }
.list { border-top: 1px solid var(--line-strong); }
details { border-bottom: 1px solid var(--line); }
summary { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; min-height: 64px; padding-block: 1rem; cursor: pointer; list-style: none; font-family: var(--font-display); font-size: clamp(1.15rem, 2.2vw, 1.45rem); line-height: 1.25; }
summary::-webkit-details-marker { display: none; }
.plus { position: relative; flex: none; width: 18px; height: 18px; }
.plus::before, .plus::after { content: ''; position: absolute; background: var(--copper); inset: 8px 0 auto 0; height: 2px; transition: transform 0.3s var(--ease); }
.plus::after { transform: rotate(90deg); }
details[open] .plus::after { transform: rotate(0); }
details p { padding: 0 3rem 1.6rem 0; color: var(--muted); max-width: 60ch; }
.more { margin-top: 2.5rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.2rem; }
</style>
