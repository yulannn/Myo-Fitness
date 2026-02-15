/**
 * Types et interfaces pour le système d'adaptation professionnel
 */

export enum PerformanceStatus {
  CRUSHING_IT = 'crushing_it', // Score > 90 - Trop facile
  STRONG = 'strong', // Score 75-90 - Bon niveau
  PERFECT = 'perfect', // Score 60-75 - Zone idéale
  CHALLENGING = 'challenging', // Score 45-60 - Difficile mais gérable
  STRUGGLING = 'struggling', // Score 30-45 - Trop dur
  OVERREACHING = 'overreaching', // Score < 30 - Surentraînement
}

export enum FailurePattern {
  NONE = 'none', // Aucun échec
  EARLY = 'early', // Échec dès les premières séries
  LATE = 'late', // Échec sur les dernières séries (fatigue)
  DISTRIBUTED = 'distributed', // Échecs répartis
}

export enum AdaptationType {
  VOLUME = 'volume', // Augmenter le volume (reps/sets)
  INTENSITY = 'intensity', // Augmenter l'intensité (poids)
  DENSITY = 'density', // Les deux
  DELOAD = 'deload', // Diminuer la charge
  MAINTAIN = 'maintain', // Maintenir pour consolider
}

export enum AdaptationPriority {
  REPS = 'reps',
  WEIGHT = 'weight',
  SETS = 'sets',
  MIXED = 'mixed',
}

export enum AdaptationMagnitude {
  MICRO = 'micro', // Progression minimale (+1.25kg, +1 rep)
  NORMAL = 'normal', // Progression standard (+2.5kg, +2 reps)
  MACRO = 'macro', // Progression importante (+5kg, +3 reps)
}

export interface PerformanceAnalysis {
  // Métriques de base
  successRate: number; // 0-1 (pourcentage de séries validées)
  totalVolume: number; // Total Reps × Weight
  avgRepsCompleted: number; // Moyenne des reps effectuées
  avgWeightUsed: number | null; // Moyenne des poids utilisés

  // Métriques calculées
  repsCompletionRate: number; // Ratio reps effectuées / prévues
  weightCompletionRate: number; // Ratio poids utilisé / prévu
  volumeChangeVsPrevious: number; // Variation depuis dernière session

  // Patterns détectés
  failurePattern: FailurePattern;
  consistencyScore: number; // 0-1 (variance entre séries)

  // Score final
  difficultyScore: number; // 0-100 (0 = impossible, 100 = trop facile)
  recommendation: PerformanceStatus;

  // Contexte
  totalSets: number;
  successfulSets: number;
}

export interface AdaptationStrategy {
  type: AdaptationType;
  priority: AdaptationPriority;
  magnitude: AdaptationMagnitude;
  reasoning: string;
  confidence: number; // 0-1
}

export interface AdaptedExercise {
  reps: number;
  weight: number | null;
  sets: number;

  // Métadonnées
  changeFromPrevious: {
    reps: number;
    weight: number | null;
    sets: number;
  };
  reasoning: string;
  strategy: AdaptationStrategy;
}

export interface AdaptationConstraints {
  // Limites physiques
  minReps: number;
  maxReps: number;
  minSets: number;
  maxSets: number;
  minWeight: number;

  // Incréments standards (en kg)
  weightIncrements: {
    microloading: number; // 1.25kg
    standard: number; // 2.5kg
    macro: number; // 5kg
  };

  // Règles métier
  maxWeightIncreasePerSession: number; // Ratio (0.10 = 10%)
  maxRepsIncreasePerSession: number;
  maxSetsIncreasePerSession: number;

  // Sécurité
  preventOvertraining: boolean;
  requireConsolidationSessions: number; // Nombre de sessions avant progression
}

/**
 * Contraintes pour exercices AVEC CHARGE
 * Objectif : Force / Hypertrophie
 * Reps modérées, focus sur la progression en poids
 */
export const WEIGHTED_CONSTRAINTS: AdaptationConstraints = {
  minReps: 5,
  maxReps: 12, // ⚠️ Max 12 reps pour garder focus sur la charge
  minSets: 3,
  maxSets: 5,
  minWeight: 2.5,

  weightIncrements: {
    microloading: 1.25, // Micro-progression fine
    standard: 2.5, // Progression standard
    macro: 5, // Progression rapide
  },

  maxWeightIncreasePerSession: 0.1, // Max +10% par session
  maxRepsIncreasePerSession: 2, // Max +2 reps (plus conservateur)
  maxSetsIncreasePerSession: 1, // Max +1 set

  preventOvertraining: true,
  requireConsolidationSessions: 2,
};

/**
 * Contraintes pour exercices POIDS DU CORPS
 * Objectif : Endurance / Volume
 * Reps élevées OK, progression par volume
 */
export const BODYWEIGHT_CONSTRAINTS: AdaptationConstraints = {
  minReps: 5,
  maxReps: 25, // ⚠️ Max 25 reps (endurance musculaire)
  minSets: 3,
  maxSets: 5,
  minWeight: 0, // Pas de poids pour bodyweight

  weightIncrements: {
    microloading: 0,
    standard: 0,
    macro: 0,
  },

  maxWeightIncreasePerSession: 0,
  maxRepsIncreasePerSession: 3, // Max +3 reps
  maxSetsIncreasePerSession: 1, // Max +1 set

  preventOvertraining: true,
  requireConsolidationSessions: 2,
};

/**
 * Contraintes par défaut (utilise weighted comme référence)
 * @deprecated Utiliser WEIGHTED_CONSTRAINTS ou BODYWEIGHT_CONSTRAINTS
 */
export const DEFAULT_CONSTRAINTS = WEIGHTED_CONSTRAINTS;
