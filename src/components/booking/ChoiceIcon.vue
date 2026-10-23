<script setup>
defineProps({ name: { type: String, required: true } })
const PATHS = {
  returning: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 11l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-5 5-8 9-10',
  skip: 'M5 12h14m-5-5 5 5-5 5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  phone: 'M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2 2A14 14 0 0 1 4.5 6a2 2 0 0 1 2-2Z',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  calendar: 'M5 6h14v14H5V6Zm0 5h14M9 3v4m6-4v4',
}
</script>

<template>
  <span class="cico" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="PATHS[name]" /></svg>
  </span>
</template>

<style scoped>
.cico { flex: none; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 50%; color: #4e2e1e; background: var(--grad-gold); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 8px 16px -10px rgba(78, 46, 30, 0.7); transition: transform 0.35s var(--ease); }
.cico svg { width: 1.45rem; height: 1.45rem; }
:global(.choice:hover) .cico, :global(.choice.on) .cico { transform: scale(1.08) rotate(-4deg); }
</style>
