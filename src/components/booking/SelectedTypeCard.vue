<script setup>
import ApiImage from '@/components/ui/ApiImage.vue'
import { typeImages } from '@/data/heroImages'
import { consultation, estimate, findFormule, startingPrice } from '@/data/tarifs'
import { formatPrice } from '@/utils/format'
import { computed } from 'vue'

/** Le type de locks choisi, affiché en carte avec ses informations et un prix indicatif. */
const props = defineProps({
  type: { type: Object, required: true },
  besoin: { type: String, default: '' },
  resserrage: { type: Object, required: true },
})
defineEmits(['change'])

const price = computed(() => {
  if (props.besoin === 'creation') return { label: 'Création', text: 'Tarif annoncé après la consultation', note: consultation.nouvelle }
  if (props.besoin === 'resserrage' && props.resserrage.type === props.type.id) {
    const est = estimate(props.resserrage)
    if (est) {
      const f = findFormule(props.resserrage.formule)
      return { label: `Tarif indicatif · ${f?.short ?? ''}`, text: `${est.partial ? 'dès ' : ''}${formatPrice(est.total)}`, note: consultation.final }
    }
  }
  return { label: 'Resserrage', text: `à partir de ${formatPrice(startingPrice(props.type.id))}`, note: 'Tarif indicatif, affiné selon votre volume, délai et état.' }
})
</script>

<template>
  <aside class="sel" aria-label="Type de locks choisi">
    <ApiImage :src="typeImages[type.id]" :alt="`Exemple de ${type.name}`" ratio="4 / 3" class="pic" />
    <div class="txt">
      <p class="eyebrow">Votre choix</p>
      <h2>{{ type.name }}</h2>
      <p class="meta">Diamètre : {{ type.size }} · {{ type.rhythm }}</p>
      <p class="desc">{{ type.description }}</p>
      <p class="price"><span>{{ price.label }}</span> <strong>{{ price.text }}</strong></p>
      <p class="note">{{ price.note }}</p>
      <button type="button" class="linkish" @click="$emit('change')">Modifier mon choix</button>
    </div>
  </aside>
</template>

<style scoped>
.sel { display: grid; overflow: hidden; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lift); }
.pic { min-height: 15rem; }
.pic :deep(img), .pic :deep(div) { height: 100%; }
.txt { display: grid; gap: 0.55rem; align-content: center; min-width: 0; padding: clamp(1.4rem, 3.5vw, 2.4rem); }
.txt h2 { font-size: clamp(1.9rem, 4vw, 2.8rem); line-height: 1.05; }
.meta { font-size: 0.9rem; font-weight: 700; color: var(--copper); }
.desc { color: var(--muted); font-size: 1.02rem; max-width: 44ch; }
.price { display: grid; gap: 0.1rem; margin-top: 0.4rem; padding: 0.9rem 1.1rem; background: var(--grad-soft); border-radius: 16px; }
.price span { color: var(--muted); font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.price strong { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); color: var(--ink); }
.note { font-size: 0.85rem; color: var(--muted); }
.linkish { justify-self: start; background: none; border: 0; padding: 0; min-height: 44px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; color: var(--copper); font-weight: 600; }
@media (min-width: 720px) { .sel { grid-template-columns: minmax(16rem, 2fr) 3fr; min-height: 22rem; } .pic { min-height: 100%; } }
</style>
