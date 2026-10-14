# Beauté Halal — site public v3

Troisième site public de Beauté Halal. **Vue 3 + Vite + Vue Router, JavaScript, CSS sur mesure** (aucune bibliothèque d'interface).
Il se branche sur le **backend commun** (`https://backend-beaute-halal.aeemci-ce.ci/api`) et donc sur le **dashboard commun** :
aucun backend, aucune base, aucun dashboard n'est créé ici, et les sites 1 et 2 ne sont pas touchés.

Direction artistique : « Lumière dorée » — crème, aubergine, dégradés abricot → terracotta → rose, boutons pilule, vagues et formes organiques ; titres Fraunces, textes DM Sans (polices auto-hébergées).
(polices **embarquées** via `@fontsource-variable`, aucun appel à Google Fonts) ; angles vifs, filets fins, grands chiffres, listes
éditoriales plutôt que cartes répétées.

## Démarrage

```powershell
cd C:\Users\foune\beaute_halal_v3
npm install
npm run dev          # http://localhost:5173 — lit l'API de PRODUCTION
npm run build        # génère robots.txt/sitemap puis dist/
npm run preview      # sert dist/ en local
npm run lint
```

Prérequis : Node `^20.19.0 || >=22.12.0`.

## Variables d'environnement (lues au build, donc publiques — aucun secret)

| Variable | Rôle |
| --- | --- |
| `VITE_API_URL` | API commune, préfixe `/api` inclus. Production : `https://backend-beaute-halal.aeemci-ce.ci/api` |
| `VITE_SITE_URL` | Adresse publique **de ce site** (canonical, Open Graph, sitemap). Vide = origine du navigateur |
| `VITE_ALLOW_INDEXING` | `true` / `false` — voir « SEO » |

Fichiers : `.env.example` (modèle), `.env.development`, `.env.production` (versionnés, sans secret). Vos surcharges locales vont dans `.env.local` (ignoré par Git).

## Tester la réservation SANS toucher à la production

`npm run dev` lit l'API de production : **ne créez pas de rendez-vous de test dessus.** Pour tester le parcours complet :

```powershell
npm run dev:mock                     # API SIMULÉE sur http://localhost:4010/api (données fictives, rien n'est persisté)
# .env.local :  VITE_API_URL=http://localhost:4010/api
npm run dev
```

Dans le mock : un commentaire contenant `TEST409` provoque un conflit de créneau ; un e-mail contenant `invalid422` provoque une erreur de validation.
`scripts/mock-api.mjs` n'est **pas** un backend : c'est un outil de test qui reproduit le contrat des routes déjà utilisées par les sites 1 et 2.

## Routes de l'API utilisées

Toutes publiques, déjà exploitées par les sites 1 et 2 (client unique : `src/services/api.js`, aucun `fetch` ailleurs) :
`GET /salon`, `/service-categories`, `/services[?featured=true]`, `/services/:slug`, `/gallery[?category&featured]`, `/gallery/categories`,
`/testimonials`, `/team`, `/availability/days`, `/availability/slots` · `POST /appointments`, `POST /contact`.
Aucune route `/admin`. Aucune route inventée. La route `/customers/lookup` du site 1 n'est volontairement pas reprise (minimisation des données).

> ⚠️ **Non vérifié en direct** : l'API de production n'était pas joignable depuis l'environnement de développement (liste d'autorisation réseau).
> Les formes de réponse sont celles du client déjà validé du site 1. `GET /team` figure dans la documentation du backend mais n'est
> pas appelé par le site 1 : la section équipe se masque d'elle-même si la route échoue ou renvoie une liste vide.

## Ce que fait le site (et ce qu'il ne fait pas)

- Pages (mêmes libellés que les sites 1 et 2) : Accueil, Nos services, Nos coiffures (visionneuse clavier/tactile), À propos, Rendez-vous, Contact, 404. URLs : `/`, `/services`, `/galerie`, `/a-propos`, `/rendez-vous`, `/contact`. La FAQ a été retirée.
- Services, tarifs, durées, horaires, coordonnées, galerie, avis, équipe : **lus depuis l'API**. Avis et équipe n'apparaissent que s'il y en a. Aucun tarif ni avis inventé.
- **Photos de héros** : ce sont des photos d'ambiance libres (Unsplash) chargées à distance, listées dans `src/data/heroImages.js`. Ce ne sont PAS des photos du salon : remplacez-les par ses vraies photos (fichiers dans `public/images`, puis modifier ce fichier). Si une photo ne charge pas, un fond dégradé prend le relais.
- Réservation : Prestation → Date et heure (jours et créneaux fournis par le serveur) → Informations → Récapitulatif → envoi.
  Ni prix ni durée ne sont envoyés (le serveur les relit). Écran final = réponse du serveur, présentée comme une **demande à confirmer** (jamais « réservé » tant que le salon n'a pas confirmé). Créneau pris entre-temps (409) → message clair, retour au choix de l'heure, créneaux rechargés. Double envoi bloqué.
- WhatsApp : lien `wa.me` seulement si le salon a renseigné son numéro ; jamais présenté comme une réservation.

## SEO — trois sites aux contenus proches

Chaque site déclare **sa propre** adresse comme canonique. Pour éviter la concurrence (contenu dupliqué) : **un seul des trois sites devrait être indexable.**
`VITE_ALLOW_INDEXING=false` (défaut) → `noindex, follow` sur toutes les pages, pas de sitemap. Quand vous aurez choisi le site à référencer :
renseignez `VITE_SITE_URL`, passez `VITE_ALLOW_INDEXING=true`, rebuild (`npm run build` régénère `robots.txt` et `sitemap.xml`). `robots.txt` autorise toujours l'exploration, pour que le `noindex` reste lisible.
Données structurées `HairSalon` construites uniquement à partir de `GET /salon` (aucune note, aucun avis).

## Déploiement

Dossier de sortie : `dist/`. Application monopage en mode « history » : **toute URL doit renvoyer `index.html`** — déjà prévu dans `vercel.json`, `netlify.toml` et `public/_redirects`. Sur un hébergement Apache/Nginx, ajoutez la réécriture équivalente.
Définissez les trois variables dans l'interface de l'hébergeur (elles sont lues au build).

**CORS (backend, à faire AVANT la mise en ligne)** : le backend n'autorise que les origines de son `CORS_ORIGINS`. Ajoutez-y l'adresse publique de ce site, sinon le navigateur bloquera tous les appels. Aucun changement de code n'est nécessaire, seulement cette variable côté backend. Vérifiez aussi que les trois sites coexistent dans la liste.

## Contenu à faire valider

`src/data/editorial.js` (principes de la page À propos, déroulé en 4 temps) est un texte éditorial **rédigé sans confirmation du salon** : relisez-le. Il ne contient ni chiffre, ni diplôme, ni politique d'annulation.

## Limites connues

- Réponse de l'API de production non vérifiée en direct (voir plus haut). Parcours de réservation testé de bout en bout **contre le mock**, pas contre la production.
- L'API ne donne pas de route `GET /gallery/:id` : une coiffure ouverte par lien est retrouvée en lisant la liste.
- Protection contre les doubles réservations : c'est le backend qui en est responsable (colonne `slot_lock` d'après sa documentation) ; ce site gère le 409 renvoyé.
- Pas de test automatisé versionné dans ce dépôt (les contrôles navigateur ont été exécutés hors dépôt) ; pas de test sur vrai téléphone.
