<script setup>
import GoodToKnow from '@/components/sections/GoodToKnow.vue'
import LockTypesSection from '@/components/sections/LockTypesSection.vue'
import SignatureBand from '@/components/sections/SignatureBand.vue'
import TarifGrid from '@/components/services/TarifGrid.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { heroImages } from '@/data/heroImages'
</script>

<template>
  <div>
    <PageHero
      :image="heroImages.services"
      eyebrow="Nos services"
      title="Locks, small locks et micro-locks."
      lede="Trois types de locks, une grille tarifaire claire et un engagement : le travail des racines et des tiges."
    >
      <template #title>Locks, small locks et <em>micro-locks</em>.</template>
    </PageHero>

    <LockTypesSection :title="false" detailed />
    <TarifGrid />
    <SignatureBand />
    <GoodToKnow />

    <VisitBlock />
  </div>
</template>
