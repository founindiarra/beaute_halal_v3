<script setup>
/**
 * Compteur animé : monte de 0 à `to` quand il entre à l'écran.
 * Le lecteur d'écran lit directement la valeur finale ; sans animation (préférence
 * « moins de mouvement »), la valeur finale est affichée tout de suite.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  decimals: { type: Number, default: 0 },
  duration: { type: Number, default: 1600 },
})

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const value = ref(reduced ? props.to : 0)
const root = ref(null)
const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })
const shown = computed(() => fmt(value.value))
const final = computed(() => fmt(props.to))

let io = null
let raf = 0
let started = false
const run = () => {
  started = true
  cancelAnimationFrame(raf)
  const start = performance.now()
  const from = value.value
  const tick = (now) => {
    const t = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - t, 4)
    value.value = from + (props.to - from) * eased
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (reduced || typeof IntersectionObserver === 'undefined') {
    value.value = props.to
    return
  }
  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      run()
    },
    { threshold: 0.4 },
  )
  io.observe(root.value)
})
watch(
  () => props.to,
  () => {
    if (reduced) value.value = props.to
    else if (started) run()
  },
)
onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <span ref="root" class="count"><span aria-hidden="true">{{ shown }}</span><span class="sr-only">{{ final }}</span></span>
</template>

<style scoped>
.count { font-variant-numeric: tabular-nums; }
</style>
