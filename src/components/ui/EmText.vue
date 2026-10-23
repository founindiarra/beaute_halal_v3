<script setup>
import { computed } from 'vue'

/** Texte avec mots mis en valeur : « Locks et *micro-locks* » → « micro-locks » en italique coloré. */
const props = defineProps({ text: { type: String, default: '' } })
const parts = computed(() =>
  String(props.text)
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((t) => (t.startsWith('*') && t.endsWith('*') && t.length > 2 ? { t: t.slice(1, -1), em: true } : { t })),
)
</script>

<template>
  <template v-for="(p, i) in parts" :key="i"><em v-if="p.em">{{ p.t }}</em><template v-else>{{ p.t }}</template></template>
</template>
