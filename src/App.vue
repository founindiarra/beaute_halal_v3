<script setup>
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
</script>

<template>
  <a href="#contenu" class="skip-link">Aller au contenu</a>
  <SiteHeader />
  <main id="contenu" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <Transition name="page" appear>
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
</template>
