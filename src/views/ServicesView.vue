<script setup>
import GoodToKnow from '@/components/sections/GoodToKnow.vue'
import LockTypesSection from '@/components/sections/LockTypesSection.vue'
import SignatureBand from '@/components/sections/SignatureBand.vue'
import TarifGrid from '@/components/services/TarifGrid.vue'
import VisitBlock from '@/components/sections/VisitBlock.vue'
import PageHero from '@/components/ui/PageHero.vue'
import { heroArt } from '@/data/heroImages'
import { SITE } from '@/data/tarifs'
</script>

<template>
  <div>
    <PageHero
      :image="heroArt.services"
      :eyebrow="SITE.pages.services.eyebrow"
      :title="SITE.pages.services.titre"
      :lede="SITE.pages.services.intro"
    />

    <LockTypesSection :title="false" detailed />
    <TarifGrid />
    <SignatureBand />
    <GoodToKnow />

    <VisitBlock />
  </div>
</template>
