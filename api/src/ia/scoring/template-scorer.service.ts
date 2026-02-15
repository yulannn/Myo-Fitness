import { Injectable } from '@nestjs/common';
import { ProgramTemplate, ExperienceLevel } from '@prisma/client';
import { TemplateScore, ScoringProfile } from './types/scoring.types';
import {
  TEMPLATE_CONSTRAINTS,
  SCORING_WEIGHTS,
} from './constants/template-constraints';
import {
  calculateMuscleFrequency,
  scoreMuscleFrequency,
} from './helpers/muscle-frequency.helper';
import {
  calculateVolumeCapacity,
  scoreVolumeCapacity,
} from './helpers/volume-capacity.helper';
import {
  determineRecoveryCapacity,
  determineWeightIntent,
  scoreRecoveryCompatibility,
  scoreWeightIntentCompatibility,
} from './helpers/recovery.helper';

@Injectable()
export class TemplateScorerService {
  /**
   * Score tous les templates disponibles pour un profil donné
   *
   * @param profile - Profil utilisateur
   * @returns Liste des templates triés par score décroissant
   */
  scoreTemplates(profile: ScoringProfile): TemplateScore[] {
    const allTemplates = Object.keys(TEMPLATE_CONSTRAINTS) as ProgramTemplate[];
    const scores: TemplateScore[] = [];

    for (const template of allTemplates) {
      // Ignorer CUSTOM (pas de scoring possible)
      if (template === 'CUSTOM') continue;

      const result = this.scoreTemplate(template, profile);
      scores.push(result);
    }

    // Trier par score décroissant
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Score un template spécifique
   *
   * @param template - Template à scorer
   * @param profile - Profil utilisateur
   * @returns Score et raisons
   */
  private scoreTemplate(
    template: ProgramTemplate,
    profile: ScoringProfile,
  ): TemplateScore {
    let totalScore = 0;
    const reasons: string[] = [];

    // ═══════════════════════════════════════
    // 1️⃣ CONTRAINTE DURE : Faisabilité
    // ═══════════════════════════════════════
    const constraints = TEMPLATE_CONSTRAINTS[template];

    if (profile.trainingFrequency < constraints.minFrequency) {
      return {
        template,
        score: 0,
        reasons: [
          `❌ Impossible : ${template} nécessite minimum ${constraints.minFrequency} séances/semaine`,
        ],
      };
    }

    if (profile.trainingFrequency > constraints.maxFrequency) {
      totalScore -= 20;
      reasons.push(
        `⚠️ Trop de séances pour ce template (max recommandé: ${constraints.maxFrequency})`,
      );
    }

    // ═══════════════════════════════════════
    // 2️⃣ FRÉQUENCE OPTIMALE
    // ═══════════════════════════════════════
    const isOptimal = constraints.optimalFrequency.includes(
      profile.trainingFrequency,
    );

    if (isOptimal) {
      totalScore += SCORING_WEIGHTS.FREQUENCY_MATCH;
      reasons.push(`✅ Fréquence idéale pour ${template}`);
    } else {
      const closest = this.findClosestFrequency(
        constraints.optimalFrequency,
        profile.trainingFrequency,
      );
      const diff = Math.abs(closest - profile.trainingFrequency);

      // 🚨 INCOMPATIBILITÉS MATHÉMATIQUES : Bloquer complètement

      // Push/Pull/Legs : Split en 3 parties, nécessite 3j ou 6j
      if (template === 'PUSH_PULL_LEGS') {
        const isCompatible = [3, 6].includes(profile.trainingFrequency);
        if (!isCompatible) {
          return {
            template,
            score: 0,
            reasons: [
              `❌ PPL INCOMPATIBLE avec ${profile.trainingFrequency}j/semaine`,
              `→ PPL divise l'entraînement en 3 parties (Push/Pull/Legs)`,
              `→ Nécessite 3 jours (1 cycle) ou 6 jours (2 cycles complets)`,
              `→ Avec ${profile.trainingFrequency}j, impossible d'équilibrer les 3 parties`,
            ],
          };
        }
      }

      // Upper/Lower : Split en 2 parties, nécessite fréquence PAIRE (2, 4, 6)
      if (template === 'UPPER_LOWER') {
        const isEvenFrequency = profile.trainingFrequency % 2 === 0;
        if (!isEvenFrequency) {
          return {
            template,
            score: 0,
            reasons: [
              `❌ UPPER/LOWER INCOMPATIBLE avec ${profile.trainingFrequency}j/semaine`,
              `→ Split en 2 parties (Haut du corps / Bas du corps)`,
              `→ Nécessite fréquence PAIRE : 2j, 4j ou 6j pour équilibrer`,
              `→ Avec ${profile.trainingFrequency}j, un côté serait négligé`,
            ],
          };
        }
      }

      // Si aucune incompatibilité, appliquer la pénalité standard pour fréquence non-optimale
      const partialScore = Math.max(
        0,
        SCORING_WEIGHTS.FREQUENCY_MATCH - diff * 5,
      );
      totalScore += partialScore;
      reasons.push(`Fréquence acceptable (optimal: ${closest} séances)`);
    }

    // ═══════════════════════════════════════
    // 3️⃣ FRÉQUENCE PAR MUSCLE (Science)
    // ═══════════════════════════════════════
    const muscleFrequency = calculateMuscleFrequency(
      template,
      profile.trainingFrequency,
    );
    const muscleFreqResult = scoreMuscleFrequency(muscleFrequency);
    totalScore += muscleFreqResult.score;
    reasons.push(muscleFreqResult.reason);

    // ═══════════════════════════════════════
    // 4️⃣ VOLUME SELON OBJECTIF
    // ═══════════════════════════════════════
    const volumeCapacity = calculateVolumeCapacity(
      template,
      profile.trainingFrequency,
    );
    const volumeResult = scoreVolumeCapacity(volumeCapacity, profile.goals);
    totalScore += volumeResult.score;
    reasons.push(volumeResult.reason);

    // ═══════════════════════════════════════
    // 5️⃣ ADAPTATION AU NIVEAU
    // ═══════════════════════════════════════
    const experienceScore = this.scoreExperienceLevel(
      template,
      profile.experienceLevel,
    );
    totalScore += experienceScore.score;
    if (experienceScore.reason) {
      reasons.push(experienceScore.reason);
    }

    // ═══════════════════════════════════════
    // 6️⃣ MUSCLERPRIORITIES
    // ═══════════════════════════════════════
    if (profile.musclePriorities && profile.musclePriorities.length > 0) {
      const priorityScore = this.scoreMusclePriorities(
        template,
        muscleFrequency,
      );
      totalScore += priorityScore.score;
      if (priorityScore.reason) {
        reasons.push(priorityScore.reason);
      }
    }

    // ═══════════════════════════════════════
    // 7️⃣ RÉCUPÉRATION (AGE)
    // ═══════════════════════════════════════
    const recoveryCapacity = determineRecoveryCapacity(profile.age);
    const recoveryResult = scoreRecoveryCompatibility(
      template,
      recoveryCapacity,
      profile.trainingFrequency,
    );
    totalScore += recoveryResult.score;
    if (recoveryResult.reason) {
      reasons.push(recoveryResult.reason);
    }

    // ═══════════════════════════════════════
    // 8️⃣ OBJECTIF DE POIDS (TARGETWEIGHT)
    // ═══════════════════════════════════════
    const weightIntent = determineWeightIntent(
      profile.weight,
      profile.targetWeight,
    );
    const weightResult = scoreWeightIntentCompatibility(
      template,
      weightIntent,
      volumeCapacity,
    );
    totalScore += weightResult.score;
    if (weightResult.reason) {
      reasons.push(weightResult.reason);
    }

    return {
      template,
      score: Math.max(0, totalScore), // Pas de score négatif
      reasons,
    };
  }

  /**
   * Score l'adaptation du template au niveau d'expérience
   */
  private scoreExperienceLevel(
    template: ProgramTemplate,
    level: ExperienceLevel,
  ): { score: number; reason: string } {
    const weight = SCORING_WEIGHTS.EXPERIENCE_MATCH;

    if (level === 'BEGINNER') {
      if (template === 'FULL_BODY') {
        return {
          score: weight,
          reason: `✅ Full Body optimal pour apprendre les mouvements (débutant)`,
        };
      }
      if (template === 'UPPER_LOWER') {
        return {
          score: weight * 0.6,
          reason: `Upper/Lower acceptable pour débutant`,
        };
      }
      if (template === 'PUSH_PULL_LEGS') {
        return {
          score: weight * 0.5,
          reason: `PPL possible mais complexe pour débutant`,
        };
      }

      return { score: weight * 0.3, reason: '' };
    }

    if (level === 'INTERMEDIATE') {
      if (template === 'UPPER_LOWER' || template === 'PUSH_PULL_LEGS') {
        return {
          score: weight,
          reason: `✅ Parfait pour niveau intermédiaire`,
        };
      }
      if (template === 'FULL_BODY') {
        return {
          score: weight * 0.8,
          reason: `Full Body toujours efficace pour intermédiaire`,
        };
      }

      return { score: weight * 0.7, reason: '' };
    }

    if (level === 'ADVANCED') {
      if (template === 'PUSH_PULL_LEGS') {
        return {
          score: weight * 0.9,
          reason: `PPL excellent pour avancés`,
        };
      }
      if (template === 'UPPER_LOWER') {
        return {
          score: weight * 0.7,
          reason: `Upper/Lower fonctionne mais moins de spécialisation`,
        };
      }
      if (template === 'FULL_BODY') {
        return {
          score: weight * 0.5,
          reason: `Full Body limite le volume pour un avancé`,
        };
      }
      return { score: weight * 0.7, reason: '' };
    }

    return { score: 0, reason: '' };
  }

  /**
   * Score le support des priorités musculaires
   */
  private scoreMusclePriorities(
    template: ProgramTemplate,
    muscleFrequency: number,
  ): { score: number; reason: string } {
    const weight = SCORING_WEIGHTS.MUSCLE_PRIORITIES;

    // Splits classiques permettent de mieux cibler
    if (template === 'PUSH_PULL_LEGS' || template === 'UPPER_LOWER') {
      let score = weight;
      let reason = `Split permet de cibler les priorités musculaires`;

      // Bonus si fréquence 2x/semaine
      if (muscleFrequency >= 2) {
        score += weight * 0.3;
        reason += ` (2x/semaine optimal)`;
      }

      return { score, reason };
    }

    // Full Body moins adapté pour cibler
    if (template === 'FULL_BODY') {
      return {
        score: weight * 0.4,
        reason: `Full Body difficile pour ciblage spécifique`,
      };
    }

    return { score: weight * 0.6, reason: '' };
  }

  /**
   * Trouve la fréquence optimale la plus proche
   */
  private findClosestFrequency(
    optimalFrequencies: number[],
    targetFrequency: number,
  ): number {
    if (optimalFrequencies.length === 0) return targetFrequency;

    return optimalFrequencies.reduce((prev, curr) =>
      Math.abs(curr - targetFrequency) < Math.abs(prev - targetFrequency)
        ? curr
        : prev,
    );
  }
}
