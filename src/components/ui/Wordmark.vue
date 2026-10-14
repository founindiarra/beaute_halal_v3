<script setup>
defineProps({ compact: { type: Boolean, default: false } })
</script>

<template>
  <span class="wordmark">
    <span class="wordmark-badge" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <path d="M20 5c-7 5-7 10 0 15s7 10 0 15" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" />
        <path d="M14 8c7 5 7 10 0 15" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6" />
      </svg>
    </span>
    <span class="wordmark-text">
      <span class="wordmark-name">Beauté Halal</span>
      <span v-if="!compact" class="wordmark-sub">Spécialiste des locks</span>
    </span>
  </span>
</template>

<style scoped>
.wordmark { display: inline-flex; align-items: center; gap: 0.65rem; color: var(--ink); }
.wordmark-badge { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: var(--grad); flex: none; box-shadow: 0 8px 18px -8px rgba(232, 88, 127, 0.8); }
.wordmark-badge svg { width: 24px; height: 24px; }
.wordmark-text { display: flex; flex-direction: column; line-height: 1; }
.wordmark-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 560; letter-spacing: -0.02em; font-variation-settings: 'opsz' 48; }
.wordmark-sub { margin-top: 0.3rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
:global(.on-dark) .wordmark { color: #fff3ec; }
:global(.on-dark) .wordmark-sub { color: var(--on-dark-muted); }
</style>
