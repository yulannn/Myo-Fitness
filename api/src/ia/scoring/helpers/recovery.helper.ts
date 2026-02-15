import { ProgramTemplate } from '@prisma/client';
import { RecoveryCapacity, WeightIntent } from '../types/scoring.types';

/**
 * Détermine la capacité de récupération basée sur l'âge
 *
 * Science: Récupération musculaire diminue avec l'âge
 * - < 25 ans: Récupération rapide
 * - 25-35 ans: Bonne récupération
 * - 35-45 ans: Récupération moyenne
 * - > 45 ans: Récupération plus lente
 *
 * @param age - Âge de l'utilisateur
 * @returns Capacité de récupération
 */
export function determineRecoveryCapacity(age: number): RecoveryCapacity {
  if (age < 25) return 'EXCELLENT';
  if (age >= 25 && age < 35) return 'GOOD';
  if (age >= 35 && age < 45) return 'AVERAGE';
  return 'REDUCED';
}

/**
 * Score la compatibilité du template avec la capacité de récupération
 *
 * @param template - Template de programme
 * @param recoveryCapacity - Capacité de récupération
 * @param trainingFrequency - Nombre de séances par semaine
 * @returns Score de 0 à 10 et raison
 */
export function scoreRecoveryCompatibility(
  template: ProgramTemplate,
  recoveryCapacity: RecoveryCapacity,
  trainingFrequency: number,
): {
  score: number;
  reason: string;
} {
  // Récupération excellente ou bonne : pas de pénalité
  if (recoveryCapacity === 'EXCELLENT' || recoveryCapacity === 'GOOD') {
    return {
      score: 10,
      reason: `Bonne capacité de récupération`,
    };
  }

  // Récupération moyenne : pénalité sur templates très intenses
  if (recoveryCapacity === 'AVERAGE') {
    if (template === 'PUSH_PULL_LEGS' && trainingFrequency >= 6) {
      return {
        score: 5,
        reason: `⚠️ Volume élevé peut impacter récupération (35-45 ans)`,
      };
    }

    if (template === 'FULL_BODY' && trainingFrequency <= 3) {
      return {
        score: 10,
        reason: `Adapté à la récupération moyenne`,
      };
    }

    return {
      score: 8,
      reason: `Compatible avec récupération moyenne`,
    };
  }

  // Récupération réduite (> 45 ans) : favoriser templates moins intenses
  if (recoveryCapacity === 'REDUCED') {
    if (template === 'FULL_BODY' && trainingFrequency <= 3) {
      return {
        score: 10,
        reason: `✅ Full Body permet meilleure récupération (45+ ans)`,
      };
    }

    if (template === 'UPPER_LOWER' && trainingFrequency === 4) {
      return {
        score: 8,
        reason: `Upper/Lower adapté avec bon espacement`,
      };
    }

    if (trainingFrequency >= 6) {
      return {
        score: 3,
        reason: `⚠️ Volume très élevé difficile à récupérer (45+ ans)`,
      };
    }

    return {
      score: 6,
      reason: `Récupération plus lente à considérer (45+ ans)`,
    };
  }

  return { score: 8, reason: '' };
}

/**
 * Détermine l'intention de poids (bulk, cut, recomp, maintenance)
 *
 * @param currentWeight - Poids actuel
 * @param targetWeight - Poids objectif (optionnel)
 * @returns Intention de poids
 */
export function determineWeightIntent(
  currentWeight: number,
  targetWeight?: number | null,
): WeightIntent {
  if (!targetWeight) return 'MAINTENANCE';

  const delta = targetWeight - currentWeight;

  if (delta > 5) return 'BULK'; // Prise de masse
  if (delta < -5) return 'CUT'; // Perte de poids
  if (Math.abs(delta) <= 5 && Math.abs(delta) > 2) return 'RECOMP'; // Recomposition
  return 'MAINTENANCE';
}

/**
 * Score la compatibilité du template avec l'objectif de poids
 *
 * @param template - Template de programme
 * @param weightIntent - Intention de poids
 * @param volumeCapacity - Capacité de volume du template
 * @returns Score de 0 à 10 et raison
 */
export function scoreWeightIntentCompatibility(
  template: ProgramTemplate,
  weightIntent: WeightIntent,
  volumeCapacity: number,
): {
  score: number;
  reason: string;
} {
  if (weightIntent === 'BULK') {
    // Prise de masse : favoriser volume élevé
    if (volumeCapacity >= 15) {
      return {
        score: 10,
        reason: `Volume élevé optimal pour prise de masse`,
      };
    }
    return {
      score: 7,
      reason: `Volume adapté pour prise de masse`,
    };
  }

  if (weightIntent === 'CUT') {
    // Perte de poids : favoriser efficacité énergétique
    if (template === 'FULL_BODY') {
      return {
        score: 10,
        reason: `Full Body économise énergie en déficit calorique`,
      };
    }
    if (volumeCapacity >= 10 && volumeCapacity <= 15) {
      return {
        score: 8,
        reason: `Volume adapté pour maintien musculaire en déficit`,
      };
    }
    return {
      score: 7,
      reason: `Compatible avec perte de poids`,
    };
  }

  if (weightIntent === 'RECOMP') {
    // Recomposition : volume modéré à élevé
    if (volumeCapacity >= 12 && volumeCapacity <= 18) {
      return {
        score: 10,
        reason: `Volume optimal pour recomposition corporelle`,
      };
    }
    return {
      score: 8,
      reason: `Adapté pour recomposition`,
    };
  }

  // MAINTENANCE
  return {
    score: 8,
    reason: `Standard pour maintenance`,
  };
}
