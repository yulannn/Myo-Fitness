import { ProgramTemplate, Goal } from '@prisma/client';

/**
 * Estime la capacité de volume hebdomadaire (sets par muscle)
 *
 * Science: Volume optimal = 10-20 sets par muscle par semaine pour hypertrophie
 * (Schoenfeld et al., 2017)
 *
 * @param template - Template de programme
 * @param trainingFrequency - Nombre de séances par semaine
 * @returns Sets estimés par muscle par semaine
 */
export function calculateVolumeCapacity(
  template: ProgramTemplate,
  trainingFrequency: number,
): number {
  switch (template) {
    case 'FULL_BODY':
      // Full Body : Volume par séance diminue avec fréquence
      // 1-2j : 20 sets/séance → 20-40 sets/semaine
      // 3j : 16 sets/séance → 48 sets/semaine (trop!)
      // 6j : 10 sets/séance → 60 sets/semaine (redistribué)
      // Formule : ajusté pour rester dans 10-20 sets/muscle/semaine
      if (trainingFrequency <= 2) return trainingFrequency * 10;
      if (trainingFrequency === 3) return 12; // Standard optimal
      if (trainingFrequency === 4) return 14;
      if (trainingFrequency >= 5) return 15; // Volume total élevé mais réparti

    case 'UPPER_LOWER':
      // 6-8 exercices par half-body
      // Plus de temps par partie du corps
      return trainingFrequency * 3;

    case 'PUSH_PULL_LEGS':
      // 5-6 exercices par groupe musculaire
      // Spécialisation maximale
      return trainingFrequency * 2.5;

    case 'CUSTOM':
      return 0;

    default:
      return 0;
  }
}

/**
 * Score la capacité de volume selon les objectifs
 *
 * @param volume - Volume hebdomadaire estimé
 * @param goals - Objectifs de l'utilisateur
 * @returns Score de 0 à 15 et raison
 */
export function scoreVolumeCapacity(
  volume: number,
  goals: Goal[],
): {
  score: number;
  reason: string;
} {
  const hasMuscleGain = goals.includes('MUSCLE_GAIN');
  const hasWeightLoss = goals.includes('WEIGHT_LOSS');

  if (hasMuscleGain) {
    if (volume >= 12 && volume <= 20) {
      return {
        score: 15,
        reason: `✅ Volume optimal pour hypertrophie (${volume.toFixed(0)} sets/muscle/semaine)`,
      };
    }

    if (volume >= 10) {
      return {
        score: 12,
        reason: `Volume suffisant pour gain musculaire (${volume.toFixed(0)} sets/muscle)`,
      };
    }

    return {
      score: 7,
      reason: `Volume un peu faible pour gain musculaire (${volume.toFixed(0)} sets/muscle)`,
    };
  }

  if (hasWeightLoss) {
    if (volume >= 10) {
      return {
        score: 12,
        reason: `Volume adapté pour maintien musculaire en déficit calorique`,
      };
    }

    return {
      score: 10,
      reason: `Volume suffisant pour perte de poids`,
    };
  }

  // ENDURANCE ou MAINTENANCE
  if (volume >= 8) {
    return {
      score: 10,
      reason: `Volume adapté pour l'objectif`,
    };
  }

  return {
    score: 8,
    reason: `Volume standard`,
  };
}
