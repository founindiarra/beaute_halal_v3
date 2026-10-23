<script setup>
defineProps({ compact: { type: Boolean, default: false } })
</script>

<template>
  <span class="wordmark">
    <img class="wordmark-badge" src="/images/logo/badge.png" alt="" width="46" height="46" decoding="async" />
    <span class="wordmark-text">
      <span class="wordmark-name">Beauté Halal</span>
      <span v-if="!compact" class="wordmark-sub">Spécialiste des locks</span>
    </span>
  </span>
</template>

<style scoped>
.wordmark { display: inline-flex; align-items: center; gap: 0.65rem; color: var(--ink); }
/* Logo du salon : portrait doré sur fond blanc, cerclé d'or. */
.wordmark-badge { width: 46px; height: 46px; border-radius: 50%; flex: none; object-fit: cover; background: #fff; box-shadow: 0 0 0 2px #e5c56b, 0 8px 18px -8px rgba(50, 24, 15, 0.7); }
.wordmark-text { display: flex; flex-direction: column; line-height: 1; }
.wordmark-name { white-space: nowrap; font-family: var(--font-display); font-size: 1.4rem; font-weight: 560; letter-spacing: -0.02em; font-variation-settings: 'opsz' 48; }
.wordmark-sub { margin-top: 0.3rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
:global(.on-dark) .wordmark { color: #f7f4ee; }
:global(.on-dark) .wordmark-sub { color: var(--on-dark-muted); }
@media (max-width: 400px) { .wordmark-badge { width: 40px; height: 40px; } .wordmark-sub { display: none; } .wordmark-name { font-size: 1.3rem; } }
</style>
