<script setup>
/* Chiffres réels du salon, tirés de l'API (aucun chiffre inventé).
   Une statistique sans valeur n'est pas affichée ; moins de deux : la bande disparaît. */
import { computed } from 'vue'

import CountUp from '@/components/ui/CountUp.vue'
import { useApiData } from '@/composables/useApiData'
import { useSalon } from '@/composables/useSalon'
import { fetchGalleryItems, fetchServices, fetchTestimonials } from '@/services/api'

const { salon } = useSalon()
const { data: services } = useApiData(fetchServices, [])
const { data: gallery } = useApiData(() => fetchGalleryItems(), [])
const { data: reviews } = useApiData(fetchTestimonials, { items: [], averageRating: 0 })

const stats = computed(() => {
  const list = [
    { value: services.value?.length ?? 0, label: 'prestations pour vos locks' },
    { value: (gallery.value ?? []).filter((i) => i.imageUrl).length, label: 'coiffures à découvrir' },
    { value: Number(reviews.value?.averageRating) || 0, decimals: 1, label: 'note moyenne sur 5' },
    { value: Number(salon.value.bookingWindowDays) || 0, label: 'jours de créneaux ouverts' },
  ]
  return list.filter((s) => s.value > 0)
})
</script>

<template>
  <section v-if="stats.length >= 2" class="stats" aria-label="Le salon en chiffres">
    <div class="container">
      <ul class="row">
        <li v-for="(s, i) in stats" :key="s.label" v-reveal.zoom="i * 100">
          <span class="numeral big"><CountUp :to="s.value" :decimals="s.decimals ?? 0" /></span>
          <span class="lab">{{ s.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stats { padding-block: clamp(1rem, 3vw, 2rem) clamp(3rem, 6vw, 5rem); }
.row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; }
.row li { display: grid; gap: 0.3rem; justify-items: center; text-align: center; padding: clamp(1.2rem, 3vw, 2rem) 1rem; border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.62); border: 1px solid rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); box-shadow: var(--shadow); }
.big { font-size: clamp(2.4rem, 6vw, 3.8rem); }
.lab { font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
@media (min-width: 900px) { .row { grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 1.4rem; } }
</style>
