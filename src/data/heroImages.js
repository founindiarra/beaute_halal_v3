/**
 * Photos de héros de la v3 — différentes de celles des sites 1 et 2.
 *
 * Photos libres de droits (Unsplash) de locks, choisies une par page. Ce sont des photos
 * d'AMBIANCE : elles ne montrent pas le salon ni ses clientes. Pour utiliser les vraies
 * photos du salon, déposez-les dans /public/images et remplacez ci-dessous l'URL par
 * '/images/mon-fichier.jpg' (format conseillé : 1600×1000, paysage, sujet à droite).
 *
 * Si une photo ne se charge pas, le héros reste lisible : le dégradé de couleur prend le relais.
 */
const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

export const heroImages = {
  home: u('1624561272659-224ea122b2e9', 1400), // locks retombant sur le visage (photo choisie par la cliente)
  services: u('1635627091599-aedcf8241102'), // locks miel
  gallery: u('1630488971092-ebf24950529f'), // locks au soleil, ville
  about: u('1676293038867-84ee4e09c24b'), // coiffure en cours, au salon
  booking: u('1653263169788-9332cdbf07f5'), // longues locks
  contact: u('1535146981003-d37e3e2428c3'), // gros plan chaud
  cta: u('1662991859083-86e0b45208b0'), // locks cuivrés sur fond sombre
}

/** Photos des trois types de locks (cartes « Nos services »). Photos d'ambiance : remplaçables par les photos du salon. */
export const typeImages = {
  traditionnels: u('1635627091599-aedcf8241102', 900),
  small: u('1676293038867-84ee4e09c24b', 900),
  micro: u('1630488971092-ebf24950529f', 900),
}

export default heroImages
