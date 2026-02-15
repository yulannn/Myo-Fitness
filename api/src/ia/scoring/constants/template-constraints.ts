import { ProgramTemplate } from '@prisma/client';
import { TemplateConstraints } from '../types/scoring.types';

/**
 * Contraintes de faisabilité pour chaque template
 * Basées sur la science de l'entraînement et standards de l'industrie
 */
export const TEMPLATE_CONSTRAINTS: Record<
  ProgramTemplate,
  TemplateConstraints
> = {
  FULL_BODY: {
    minFrequency: 1,
    maxFrequency: 6,
    optimalFrequency: [1, 2],
    // Science: Full Body optimal pour 1-2j
  },

  UPPER_LOWER: {
    minFrequency: 4,
    maxFrequency: 4,
    optimalFrequency: [4],
    // Science: Upper/Lower optimal à 4j (2x upper, 2x lower)
  },

  PUSH_PULL_LEGS: {
    minFrequency: 3,
    maxFrequency: 3,
    optimalFrequency: [3],
    // Science: PPL classique à 3j
  },

  PPL_UPPER_LOWER: {
    minFrequency: 5,
    maxFrequency: 5,
    optimalFrequency: [5],
    // Science: PPL + Upper/Lower optimal à 5j
  },

  PPL_X2: {
    minFrequency: 6,
    maxFrequency: 6,
    optimalFrequency: [6],
    // Science: PPLPPL optimal à 6j (2x/semaine par muscle)
  },

  PPL_X2_FULL_BODY: {
    minFrequency: 7,
    maxFrequency: 7,
    optimalFrequency: [7],
    // Science: PPL x2 + Full Body = volume maximal à 7j
  },

  CUSTOM: {
    minFrequency: 1,
    maxFrequency: 7,
    optimalFrequency: [],
    // Custom : pas de contraintes
  },
};

/**
 * Poids de scoring pour chaque critère
 */
export const SCORING_WEIGHTS = {
  FREQUENCY_MATCH: 25, // Correspondance avec fréquence optimale
  MUSCLE_FREQUENCY: 20, // Fréquence par groupe musculaire (2x/semaine = optimal)
  VOLUME_CAPACITY: 15, // Capacité de volume selon objectif
  EXPERIENCE_MATCH: 15, // Adaptation au niveau d'expérience
  MUSCLE_PRIORITIES: 15, // Support des priorités musculaires
  RECOVERY_FACTOR: 10, // Adaptation à l'âge/récupération
  WEIGHT_INTENT: 10, // Adaptation à l'objectif de poids
};
