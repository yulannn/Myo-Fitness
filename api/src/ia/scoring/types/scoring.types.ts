import { ProgramTemplate, ExperienceLevel, Goal } from '@prisma/client';

/**
 * Résultat du scoring d'un template
 */
export interface TemplateScore {
  template: ProgramTemplate;
  score: number;
  reasons: string[];
}

/**
 * Contraintes de faisabilité d'un template
 */
export interface TemplateConstraints {
  minFrequency: number;
  maxFrequency: number;
  optimalFrequency: number[];
}

/**
 * Profil simplifié pour le scoring
 */
export interface ScoringProfile {
  trainingFrequency: number;
  experienceLevel: ExperienceLevel;
  goals: Goal[];
  musclePriorities: number[];
  age: number;
  weight: number;
  targetWeight?: number | null;
}

/**
 * Pattern de récupération basé sur l'âge
 */
export type RecoveryCapacity = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'REDUCED';

/**
 * Intention de poids (gain, perte, maintenance)
 */
export type WeightIntent = 'BULK' | 'CUT' | 'RECOMP' | 'MAINTENANCE';
