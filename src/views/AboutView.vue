<script setup>
import ProcessSection from '@/components/sections/ProcessSection.vue'
import TeamSection from '@/components/sections/TeamSection.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { useSalon } from '@/composables/useSalon'
import { heroImages } from '@/data/heroImages'
import { values } from '@/data/editorial'
import { pad2 } from '@/utils/format'

const { salon } = useSalon()
</script>

<template>
  <div>
    <PageHero
      :image="heroImages.about"
      eyebrow="À propos"
      title="Un salon entièrement tourné vers les locks."
      :lede="salon.shortDescription || 'Beauté Halal est un salon spécialisé dans les locks : de la création à l’entretien et aux soins.'"
    >
      <template #title>Un salon entièrement tourné vers les <em>locks</em>.</template>
    </PageHero>

    <section class="section">
      <div class="container grid">
        <div v-reveal class="intro">
          <p class="eyebrow">Notre approche</p>
          <h2>Trois principes, <em>sans fioritures</em>.</h2>
        </div>
        <ol class="values">
          <li v-for="(v, i) in values" :key="v.title" v-reveal="i * 90">
            <span class="numeral">{{ pad2(i + 1) }}</span>
            <div><h3>{{ v.title }}</h3><p>{{ v.text }}</p></div>
          </li>
        </ol>
      </div>
    </section>

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
.values p { color: var(--muted); margin-top: 0.4rem; }
@media (min-width: 900px) { .grid { grid-template-columns: 1fr 1.2fr; gap: 5rem; } .intro { position: sticky; top: 7rem; } }
</style>
