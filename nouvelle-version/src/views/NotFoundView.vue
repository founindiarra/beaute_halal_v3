<template>
  <section class="nf">
    <div class="blobs" aria-hidden="true" />
    <div class="container inner">
      <p class="big" aria-hidden="true">404</p>
      <h1>Cette page s’est <em>défaite</em>.</h1>
      <p class="lede">L’adresse demandée n’existe pas ou n’existe plus. Revenez à l’accueil ou demandez directement un rendez-vous.</p>
      <div class="cta">
        <RouterLink :to="{ name: 'home' }" class="btn btn-primary">Retour à l’accueil</RouterLink>
        <RouterLink :to="{ name: 'booking' }" class="link-arrow">Prendre rendez-vous <span class="arrow" aria-hidden="true">→</span></RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nf { position: relative; padding-block: clamp(4rem, 12vw, 9rem); overflow: hidden; }
.inner { position: relative; display: grid; gap: 1.5rem; }
.big { font-family: var(--font-display); font-weight: 600; font-size: clamp(6rem, 24vw, 15rem); line-height: 0.85; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
h1 { font-size: clamp(2.2rem, 6vw, 4rem); max-width: 14ch; }
.cta { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 2rem; }
</style>
