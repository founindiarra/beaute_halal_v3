/**
 * Méthodes de pose proposées pour une INSTALLATION de locks, selon le type de locks choisi.
 * Le type vient du catalogue (traditionnels · small · micro) ; la méthode, elle, est propre à la technique du salon.
 * Les identifiants (interlocking, braid, twist, broderie) sont aussi ceux que le serveur accepte (voir le backend).
 * Les conseils d'épaisseur de cheveux viennent du salon ; le salon confirme toujours la méthode avec la cliente.
 */

/** Ce que chaque méthode est, en deux phrases : commun à tous les types. */
export const METHODES_BASE = {
  interlocking: {
    id: 'interlocking',
    resume: 'La lock est tenue par un passage de la mèche à travers elle, à la racine : un maintien net et solide.',
  },
  braid: {
    id: 'braid',
    resume: 'Les mèches sont démarrées en tresses, pour un départ régulier et un rendu propre dès le premier jour.',
  },
  twist: {
    id: 'twist',
    resume: 'Les mèches sont torsadées sur elles-mêmes, pour un rendu souple et naturel.',
  },
  broderie: {
    id: 'broderie',
    resume: 'Les mèches sont travaillées au crochet : un tissage fin des cheveux qui forme la lock.',
  },
}

/**
 * Par type de locks : le libellé de chaque méthode, pour qui elle est conseillée, et l'ordre d'affichage.
 * `conseil` répond à : « selon ce qui est conseillé, pour quelle coiffure ? ».
 */
export const METHODES_PAR_TYPE = {
  micro: {
    intro: 'Micro-locks : la finesse se joue à l’épaisseur de vos cheveux. Choisissez la méthode qui convient le mieux à vos cheveux.',
    methodes: [
      { id: 'interlocking', label: 'Micro interlocking', conseil: 'Une pose très tenue, adaptée aux micro-locks fines. À choisir pour un maintien durable.' },
      { id: 'braid', label: 'Micro braid', conseil: 'Un départ en micro-tresses : rendu régulier et soigné sur des locks très fines.' },
      { id: 'twist', label: 'Micro twist', conseil: 'Un départ en micro-torsades : rendu souple, pour un effet naturel.' },
      { id: 'broderie', label: 'Broderie', conseil: 'Conseillée sur des cheveux épais plutôt que fins : la broderie demande de la matière.' },
    ],
  },
  small: {
    intro: 'Small locks : un format intermédiaire. La méthode se choisit selon l’épaisseur de vos cheveux.',
    methodes: [
      { id: 'interlocking', label: 'Small interlocking', conseil: 'Une pose tenue et précise pour des locks fines à moyennes.' },
      { id: 'braid', label: 'Small micro braid', conseil: 'Un départ en petites tresses : rendu régulier et net.' },
      { id: 'twist', label: 'Small micro twist', conseil: 'Un départ en petites torsades : rendu souple et naturel.' },
      { id: 'broderie', label: 'Small broderie', conseil: 'Plutôt conseillée sur des cheveux épais que sur des cheveux fins.' },
    ],
  },
  traditionnels: {
    intro: 'Locks traditionnelles : des locks généreuses (environ 1,5 cm). Quatre méthodes sont possibles.',
    methodes: [
      { id: 'broderie', label: 'Broderie', conseil: 'Une technique au crochet qui convient bien aux locks traditionnelles.' },
      { id: 'twist', label: 'Twist', conseil: 'Un départ en torsades, pour un rendu naturel et souple.' },
      { id: 'braid', label: 'Braid', conseil: 'Un départ en tresses, pour un rendu régulier et net.' },
      { id: 'interlocking', label: 'Interlocking', conseil: 'Conseillé sur des locks fines plutôt que sur de grosses locks.' },
    ],
  },
}

/** Type inconnu (« Je ne sais pas ») : les quatre méthodes, sans libellé propre à un type. */
export const METHODES_GENERIQUES = {
  intro: 'Vous n’avez pas encore choisi de type de locks : voici les quatre méthodes. Le salon vous conseille selon l’épaisseur de vos cheveux.',
  methodes: [
    { id: 'interlocking', label: 'Interlocking', conseil: 'Plutôt conseillé sur des locks fines.' },
    { id: 'braid', label: 'Braid', conseil: 'Un départ en tresses, régulier et net.' },
    { id: 'twist', label: 'Twist', conseil: 'Un départ en torsades, souple et naturel.' },
    { id: 'broderie', label: 'Broderie', conseil: 'Plutôt conseillée sur des cheveux épais que sur des cheveux fins.' },
  ],
}

/** « Le salon me conseille » : valeur choisie quand la cliente ne souhaite pas trancher. */
export const METHODE_CONSEIL = 'conseil'

/** Méthodes affichables pour un type (les types ajoutés plus tard au catalogue retombent sur la liste générique). */
export const methodesDuType = (typeId) => METHODES_PAR_TYPE[typeId] ?? METHODES_GENERIQUES

/** Libellé lisible d'une méthode pour un type ; '' si inconnue. */
export const libelleMethode = (typeId, methodeId) => {
  if (methodeId === METHODE_CONSEIL) return 'Le salon me conseille'
  return methodesDuType(typeId).methodes.find((m) => m.id === methodeId)?.label ?? ''
}
