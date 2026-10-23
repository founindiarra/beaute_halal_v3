/**
 * Vraies photos du salon (réalisations Beauté Halal).
 * Affichées par « Nos coiffures » et le bandeau de l'accueil UNIQUEMENT tant que le dashboard (page « Prestations »)
 * ne fournit aucune coiffure avec photo : dès que le salon en publie, ce sont les siennes qui s'affichent.
 * Identifiants ≥ 9000 : jamais envoyés au serveur comme « coiffure d'inspiration » (seul le nom l'est).
 */
const photo = (slug) => `/images/coiffures/${slug}.webp`
const t = (typeId, name) => ({ slug: typeId, name })

const rows = [
  ['traditionnels', 'Locks longues dégradé miel', 'locks-longues-degrade', 'Locks longues avec un dégradé miel vers les pointes : une coloration chaude qui met en valeur la longueur.'],
  ['traditionnels', 'Locks traditionnelles et perles', 'locks-perles', 'Locks traditionnelles ornées de perles et d’anneaux dorés, pour une touche personnelle.'],
  ['micro', 'Micro locks 0,4 cm, coupe carré', 'small-locks-carre', 'Micro locks de 0,4 cm coupées en carré, légères et faciles à coiffer au quotidien.'],
  ['micro', 'Micro-locks dégradé cuivré', 'micro-locks-cuivre', 'Micro-locks longues aux reflets cuivrés, souples et bien réparties sur toute la tête.'],
  ['traditionnels', 'Locks dégradé ambré', 'locks-degrade-miel', 'Locks traditionnelles avec dégradé ambré : du noir profond à l’or en pointes.'],
  ['micro', 'Micro-locks mi-longues', 'micro-locks-longues', 'Micro-locks longues et fines, racines nettes et réparties avec précision.'],
  ['small', 'Small locks racines nettes', 'small-locks-racines', 'Small locks aux racines nettes et au tracé régulier, signature du salon.'],
  ['micro', 'Twists dégradé miel', 'twists-degrade', 'Twists très fournies avec dégradé miel : un volume important et une belle densité.'],
  ['small', 'Small locks 0,8 cm mi-longues, méthode interlocking', 'locks-mi-longues', 'Small locks de 0,8 cm posées en interlocking, à hauteur d’épaules, après presque deux ans de locks.'],
  ['small', 'Small locks de profil', 'small-locks-profil', 'Small locks de profil, fines et légères, avec une base propre.'],
  ['micro', 'Micro-locks et boucles', 'micro-locks-boucles', 'Micro-locks et boucles naturelles : un beau volume, une texture vivante.'],
  ['traditionnels', 'Locks courtes noires, taille 1 cm', 'locks-courtes-noires', 'Locks courtes noires de 1 cm de diamètre, entretien simple et allure nette.'],
  ['small', 'Small locks en chignon', 'small-locks-chignon', 'Small locks relevées en chignon : une coiffure pratique qui laisse voir les racines.'],
  ['traditionnels', 'Locks longues, racines nettes', 'locks-chignon-pince', 'Locks longues tenues par une pince, racines nettes et parting soigné.'],
  ['micro', 'Installation micro-locks 0,4 cm, teinte ginger', 'bantu-knots', 'Installation de micro-locks de 0,4 cm, dans une teinte ginger (orange cuivré).'],
  ['traditionnels', 'Locks noires, taille 1 cm, carré dégradé', 'small-locks-pointe', 'Locks noires de 1 cm de taille, en carré dégradé, avec une pointe fine et légère.'],
  ['micro', 'Micro locks 0,4 cm, mise en place', 'small-locks-pince', 'Micro locks de 0,4 cm tenues par une pince, mise en place avant la finition.'],
  ['micro', 'Départ de micro-locks, méthode microbraid, taille 0,2 cm', 'micro-braids-depart', 'Départ de micro-locks de 0,2 cm par la méthode microbraid : la base d’une chevelure fine et régulière.'],
  ['small', 'Resserrage en cours', 'resserrage-en-cours', 'Resserrage en cours au salon : racines reprises mèche par mèche.'],
  ['small', 'Small locks, vue de dessus', 'small-locks-vue-dessus', 'Small locks vues de dessus : la répartition des racines, régulière et nette.'],
  ['small', 'Small locks, méthode crochet broderie', 'small-locks-dessus-net', 'Small locks installés par la méthode crochet broderie : des racines nettes, vues de dessus.'],
  ['small', 'Small locks, méthode instantanée', 'small-locks-racines-claires', 'Small locks installés par la méthode instantanée : une finition naturelle, racines bien dégagées.'],
  ['small', 'Small locks, séparation des racines', 'small-locks-depart', 'Small locks, séparation des racines : un tracé précis, signature du salon.'],
  ['small', 'Small locks, installation méthode interlocking', 'micro-locks-courtes-boucles', 'Installation de small locks par la méthode interlocking : un volume léger, facile à porter.'],
  ['small', 'Small locks, installation faite il y a 6 mois, méthode interlocking', 'bantu-knots-noirs', 'Small locks installés il y a 6 mois par la méthode interlocking.'],
  ['small', 'Small locks, installation faite il y a 6 mois, méthode interlocking', 'micro-locks-pose', 'Même cliente, autre angle : small locks installés il y a 6 mois par la méthode interlocking.'],
  ['micro', 'Micro-locks, raie centrale', 'micro-locks-raie-centrale', 'Micro-locks avec raie centrale : une chevelure compacte et ordonnée.'],
  ['micro', 'Micro-locks, finition soignée', 'micro-locks-finition', 'Micro-locks courtes, finition soignée : une allure nette, à hauteur d’oreilles.'],
]

const typeName = { traditionnels: 'Locks Traditionnels', small: 'Small Locks', micro: 'Micro-Locks' }
export const typeNameOf = (typeId) => typeName[typeId] ?? ''

export const SALON_COIFFURES = rows.map(([typeId, title, slug, description], i) => ({
  id: 9001 + i,
  title,
  description,
  imageUrl: photo(slug),
  isFeatured: i < 8,
  typeId,
  category: t(typeId, typeName[typeId]),
  service: null,
  static: true,
}))

