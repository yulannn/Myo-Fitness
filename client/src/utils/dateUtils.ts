/**
 * Convertit un objet Date en string YYYY-MM-DD en utilisant l'heure LOCALE
 * Évite le bug de décalage d'un jour causé par toISOString() qui convertit en UTC
 * 
 * @param date - Date object à convertir
 * @returns String au format YYYY-MM-DD
 * 
 * @example
 * const date = new Date('2025-12-31'); // En France (UTC+1)
 * 
 * // ❌ MAUVAIS : toISOString() convertit en UTC
 * date.toISOString().split('T')[0] // "2025-12-30" (décalé d'un jour!)
 * 
 * // ✅ BON : utilise l'heure locale
 * formatDateToISO(date) // "2025-12-31" (correct!)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retourne la date d'aujourd'hui au format YYYY-MM-DD en heure locale
 * 
 * @returns String au format YYYY-MM-DD
 */
export function getTodayISO(): string {
  return formatDateToISO(new Date());
}
