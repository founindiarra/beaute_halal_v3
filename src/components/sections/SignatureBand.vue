<script setup>
import { engagement } from '@/data/tarifs'
</script>

<template>
  <section class="sig on-dark" aria-label="Notre engagement">
    <div class="container">
      <blockquote v-reveal>« {{ engagement }} »</blockquote>
      <p class="by">— Notre engagement —</p>
    </div>
  </section>
</template>

<style scoped>
.sig { padding-block: clamp(2.8rem, 6vw, 4.5rem); text-align: center; }
blockquote { margin: 0 auto; max-width: 52rem; font-family: var(--font-display); font-style: italic; font-size: clamp(1.35rem, 2.8vw, 2.1rem); line-height: 1.35; font-variation-settings: 'opsz' 72; }
.by { margin-top: 1.2rem; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--caramel); }
</style>
