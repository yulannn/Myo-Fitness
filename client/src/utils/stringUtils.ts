/**
 * Normalise une chaîne de caractères pour la recherche :
 * - Retire les accents
 * - Met en minuscules
 * - Retire les espaces superflus
 */
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Retire les diacritiques (accents)
    .toLowerCase()
    .trim();
};

/**
 * Valide une chaîne pour la recherche d'exercices.
 * Autorise uniquement :
 * - Lettres (avec ou sans accents)
 * - Chiffres
 * - Espaces
 * - Tirets et apostrophes
 */
export const isValidSearchInput = (str: string): boolean => {
  // Regex qui autorise lettres, chiffres, espaces, tirets, apostrophes
  const validPattern = /^[a-zA-ZÀ-ÿ0-9\s\-']*$/;
  return validPattern.test(str);
};

/**
 * Nettoie l'input de l'utilisateur en retirant les caractères non autorisés
 */
export const sanitizeSearchInput = (str: string): string => {
  // Garde uniquement les caractères valides
  return str.replace(/[^a-zA-ZÀ-ÿ0-9\s\-']/g, '');
};

/**
 * Vérifie si une chaîne contient une autre (insensible aux accents et à la casse)
 */
export const includesNormalized = (haystack: string, needle: string): boolean => {
  return normalizeString(haystack).includes(normalizeString(needle));
};
