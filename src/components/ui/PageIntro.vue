<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  lede: { type: String, default: '' },
})
</script>

<template>
  <section class="intro">
    <div class="container inner">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="title"><slot name="title">{{ title }}</slot></h1>
      <p v-if="lede" class="lede">{{ lede }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.intro { padding-block: clamp(3rem, 8vw, 6.5rem) clamp(2rem, 4vw, 3.5rem); border-bottom: 1px solid var(--line); }
.inner { display: grid; gap: 1.4rem; }
.title { font-size: clamp(2.4rem, 7vw, 5.2rem); max-width: 14ch; }
</style>
