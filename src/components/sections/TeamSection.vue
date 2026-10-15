<script setup>
import { computed } from 'vue'

import ApiImage from '@/components/ui/ApiImage.vue'
import { useApiData } from '@/composables/useApiData'
import { fetchTeam } from '@/services/api'

/* Aucune donnée d'équipe (ou erreur) : la section n'est pas rendue, aucun profil fictif. */
const { data } = useApiData(fetchTeam, [])
const team = computed(() => (data.value ?? []).filter((m) => m?.name))
</script>

<template>
  <section v-if="team.length" class="section">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">L’équipe</p>
        <h2>Les mains <em>derrière</em> vos locks</h2>
      </header>
      <ul class="team">
        <li v-for="(m, i) in team" :key="m.id || m.name" v-reveal.zoom="i * 100">
          <ApiImage :src="m.imageUrl" :alt="`${m.name}${m.role ? `, ${m.role}` : ''}`" ratio="3 / 4" />
          <h3>{{ m.name }}</h3>
          <p v-if="m.role" class="role">{{ m.role }}</p>
          <p v-if="m.specialty" class="spec">{{ m.specialty }}</p>
          <p v-if="m.bio" class="bio">{{ m.bio }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.head { display: grid; gap: 1rem; margin-bottom: 2.5rem; }
.team { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem 1rem; }
.team li { display: grid; gap: 0.35rem; align-content: start; }
.team :deep(.aimg) { border-radius: 999px 999px 24px 24px; margin-bottom: 0.7rem; box-shadow: var(--shadow); }
.team :deep(img) { transition: transform 1s var(--ease); }
.team li:hover :deep(img) { transform: scale(1.06); }
.role { font-size: 0.74rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
.spec { font-weight: 700; }
.bio { color: var(--muted); font-size: 0.95rem; }
@media (min-width: 900px) { .team { grid-template-columns: repeat(4, 1fr); gap: 2.5rem 1.5rem; } }
@media (max-width: 380px) { .team { grid-template-columns: 1fr; } }
</style>
