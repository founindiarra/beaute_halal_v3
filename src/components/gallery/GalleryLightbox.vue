<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  index: { type: Number, required: true },
})
const emit = defineEmits(['close', 'update:index', 'book'])

const item = computed(() => props.items[props.index])
const dialog = ref(null)
const closeBtn = ref(null)
let previouslyFocused = null
let touchX = null

const go = (step) => {
  const n = props.items.length
  emit('update:index', (props.index + step + n) % n)
}

const onKeydown = (e) => {
  if (e.key === 'Escape') return emit('close')
  if (e.key === 'ArrowRight') return go(1)
  if (e.key === 'ArrowLeft') return go(-1)
  if (e.key !== 'Tab' || !dialog.value) return
  const f = [...dialog.value.querySelectorAll('button:not([disabled]), a[href]')]
  if (!f.length) return
  if (e.shiftKey && document.activeElement === f[0]) {
    e.preventDefault()
    f[f.length - 1].focus()
  } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
    e.preventDefault()
    f[0].focus()
  }
}

onMounted(async () => {
  previouslyFocused = document.activeElement
  document.documentElement.style.overflow = 'hidden'
  await nextTick()
  closeBtn.value?.focus()
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  previouslyFocused?.focus?.()
})

const onTouchStart = (e) => (touchX = e.changedTouches[0].clientX)
const onTouchEnd = (e) => {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  touchX = null
}
</script>

<template>
  <div
    ref="dialog"
    class="lb on-dark"
    role="dialog"
    aria-modal="true"
    :aria-label="`Photo ${index + 1} sur ${items.length} : ${item.title}`"
    @keydown="onKeydown"
    @click.self="$emit('close')"
  >
    <button ref="closeBtn" type="button" class="close" aria-label="Fermer la photo" @click="$emit('close')">
      <span aria-hidden="true">✕</span>
    </button>

    <div class="stage" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <button v-if="items.length > 1" type="button" class="nav prev" aria-label="Photo précédente" @click="go(-1)"><span aria-hidden="true">←</span></button>
      <figure>
        <img :key="item.id" :src="item.imageUrl" :alt="item.title" />
        <figcaption>
          <p class="count">{{ index + 1 }} / {{ items.length }}<template v-if="item.category?.name"> · {{ item.category.name }}</template></p>
          <h2>{{ item.title }}</h2>
          <p v-if="item.description" class="desc">{{ item.description }}</p>
          <button type="button" class="btn btn-primary btn-sm" @click="$emit('book', item)">Réserver cette coiffure</button>
        </figcaption>
      </figure>
      <button v-if="items.length > 1" type="button" class="nav next" aria-label="Photo suivante" @click="go(1)"><span aria-hidden="true">→</span></button>
    </div>
  </div>
</template>

<style scoped>
.lb { position: fixed; inset: 0; z-index: 300; background: rgba(34, 14, 28, 0.96); display: grid; place-items: center; padding: 3.5rem 0.75rem 1rem; overflow-y: auto; }
.close { position: fixed; top: 0.6rem; right: 0.6rem; z-index: 2; width: 48px; height: 48px; background: none; border: 1.5px solid rgba(255, 240, 232, 0.5); border-radius: 50%; color: var(--ivory); cursor: pointer; font-size: 1.1rem; }
.close:hover { background: var(--ivory); color: var(--ink); }
.stage { display: grid; grid-template-columns: 1fr; width: min(1100px, 100%); gap: 0.75rem; align-items: center; }
figure { margin: 0; display: grid; gap: 1.1rem; min-width: 0; }
img { width: 100%; max-height: 66vh; object-fit: contain; background: #1d0d19; border-radius: 22px; animation: fade 0.35s var(--ease); }
figcaption { display: grid; gap: 0.5rem; justify-items: start; }
figcaption h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); }
.count { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--caramel); font-weight: 600; }
.desc { color: var(--on-dark-muted); max-width: 60ch; }
.nav { position: fixed; bottom: 0.8rem; width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid rgba(255, 240, 232, 0.5); background: rgba(34, 14, 28, 0.85); color: var(--ivory); cursor: pointer; font-size: 1.2rem; z-index: 2; }
.nav:hover { background: var(--ivory); color: var(--ink); }
.prev { right: 4.6rem; }
.next { right: 0.8rem; }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@media (min-width: 900px) {
  .lb { padding: 2rem; }
  .stage { grid-template-columns: 56px 1fr 56px; gap: 1.2rem; }
  figure { grid-template-columns: 1.5fr 1fr; align-items: end; gap: 2rem; }
  img { max-height: 82vh; }
  .nav { position: static; }
  .close { top: 1.2rem; right: 1.2rem; }
}
</style>
