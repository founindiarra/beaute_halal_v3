<script setup>
import ProcessSection from '@/components/sections/ProcessSection.vue'
import TeamSection from '@/components/sections/TeamSection.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import GoodToKnow from '@/components/sections/GoodToKnow.vue'
import SignatureBand from '@/components/sections/SignatureBand.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { heroImages } from '@/data/heroImages'
import { values } from '@/data/editorial'
import { BRAND_INTRO } from '@/data/tarifs'
import { pad2 } from '@/utils/format'

</script>

<template>
  <div>
    <PageHero
      :image="heroImages.about"
      eyebrow="À propos"
      title="L’art du soin capillaire texturé."
      :lede="BRAND_INTRO"
    >
      <template #title>L’art du soin capillaire <em>texturé</em>.</template>
    </PageHero>

    <section class="section">
      <div class="container grid">
        <div v-reveal.left class="intro">
          <p class="eyebrow">Notre approche</p>
          <h2>Trois engagements, <em>sans fioritures</em>.</h2>
        </div>
        <ol class="values">
          <li v-for="(v, i) in values" :key="v.title" v-reveal.right="i * 110">
            <span class="numeral">{{ pad2(i + 1) }}</span>
            <div><h3>{{ v.title }}</h3><p>{{ v.text }}</p></div>
          </li>
        </ol>
      </div>
    </section>

    <SignatureBand />
    <GoodToKnow />
    <TeamSection />
    <ProcessSection />
    <VisitBlock />
  </div>
</template>

<style scoped>
.grid { display: grid; gap: 2.5rem; }
.intro { display: grid; gap: 1rem; align-content: start; }
.values { display: grid; gap: 1rem; }
.values li { display: grid; grid-template-columns: 3.6rem 1fr; gap: 1rem; padding: 1.5rem; background: #fff; border-radius: 22px; box-shadow: var(--shadow); }
.values .numeral { font-size: 2.4rem; }
.values li { transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease); }
.values li:hover { transform: translateX(8px); box-shadow: var(--shadow-lift); }
.values p { color: var(--muted); margin-top: 0.4rem; }
@media (min-width: 900px) { .grid { grid-template-columns: 1fr 1.2fr; gap: 5rem; } .intro { position: sticky; top: 7rem; } }
</style>
