import {
  PerformanceAnalysis,
  PerformanceStatus,
  FailurePattern,
} from '../types/adaptation.types';

/**
 * Analyseur professionnel de performance
 * Inspiré des algorithmes de Strong, Hevy, JEFIT
 */
export class PerformanceAnalyzer {
  /**
   * Analyse complète des performances d'un exercice
   */
  analyze(
    performances: any[],
    targetReps: number,
    targetWeight: number | null,
    targetSets: number,
  ): PerformanceAnalysis {
    // 1. Métriques de base
    const totalSets = performances.length;
    const successfulSets = performances.filter(
      (p) => p.success === true,
    ).length;
    const successRate = totalSets > 0 ? successfulSets / totalSets : 0;

    // 2. Performance sur les reps
    const avgRepsCompleted =
      totalSets > 0
        ? performances.reduce((sum, p) => sum + (p.reps_effectuees || 0), 0) /
          totalSets
        : 0;
    const repsCompletionRate =
      targetReps > 0 ? avgRepsCompleted / targetReps : 1;

    // 3. Performance sur le poids
    let avgWeightUsed: number | null = null;
    let weightCompletionRate = 1.0;

    if (targetWeight && targetWeight > 0) {
      const performancesWithWeight = performances.filter(
        (p) => p.weight != null && p.weight > 0,
      );
      if (performancesWithWeight.length > 0) {
        avgWeightUsed =
          performancesWithWeight.reduce((sum, p) => sum + p.weight, 0) /
          performancesWithWeight.length;
        weightCompletionRate = avgWeightUsed / targetWeight;
      }
    }

    // 4. Volume total
    const totalVolume = performances.reduce((sum, p) => {
      const reps = p.reps_effectuees || 0;
      const weight = p.weight || 0;
      return sum + reps * weight;
    }, 0);

    // 5. Détection du pattern d'échec
    const failurePattern = this.detectFailurePattern(performances);

    // 6. Consistance entre les séries
    const consistencyScore = this.calculateConsistency(
      performances,
      targetReps,
    );

    // 7. Calcul du score de difficulté (0-100)
    const difficultyScore = this.calculateDifficultyScore({
      successRate,
      repsCompletionRate,
      weightCompletionRate,
      failurePattern,
      consistencyScore,
    });

    // 8. Recommandation finale
    const recommendation = this.categorizePerformance(difficultyScore);

    return {
      successRate,
      totalVolume,
      avgRepsCompleted,
      avgWeightUsed,
      repsCompletionRate,
      weightCompletionRate,
      volumeChangeVsPrevious: 0, // À calculer avec historique
      failurePattern,
      consistencyScore,
      difficultyScore,
      recommendation,
      totalSets,
      successfulSets,
    };
  }

  /**
   * Détecte le pattern d'échec dans les séries
   */
  private detectFailurePattern(performances: any[]): FailurePattern {
    const failures = performances.map((p, idx) => ({
      index: idx,
      failed: !p.success,
    }));
    const failureCount = failures.filter((f) => f.failed).length;

    if (failureCount === 0) return FailurePattern.NONE;

    const totalSets = performances.length;
    const firstHalfFailures = failures
      .slice(0, Math.ceil(totalSets / 2))
      .filter((f) => f.failed).length;
    const secondHalfFailures = failureCount - firstHalfFailures;

    // Échec précoce : >70% des échecs dans la première moitié
    if (firstHalfFailures / failureCount > 0.7) {
      return FailurePattern.EARLY;
    }

    // Échec tardif : >70% des échecs dans la seconde moitié
    if (secondHalfFailures / failureCount > 0.7) {
      return FailurePattern.LATE;
    }

    return FailurePattern.DISTRIBUTED;
  }

  /**
   * Calcule la consistance entre les séries
   * Score élevé = performances similaires (bon)
   * Score faible = forte variance (mauvais)
   */
  private calculateConsistency(
    performances: any[],
    targetReps: number,
  ): number {
    if (performances.length < 2) return 1;

    const reps = performances.map((p) => p.reps_effectuees || 0);
    const avgReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;

    // Calculer la variance
    const variance =
      reps.reduce((sum, r) => sum + Math.pow(r - avgReps, 2), 0) / reps.length;
    const stdDev = Math.sqrt(variance);

    // Normaliser par rapport aux reps cibles
    const coefficientOfVariation = avgReps > 0 ? stdDev / avgReps : 0;

    // Convertir en score de consistance (1 = parfait, 0 = très variable)
    return Math.max(0, 1 - coefficientOfVariation);
  }

  /**
   * Calcule le score de difficulté composite (0-100)
   * Plus le score est élevé, plus c'était facile
   */
  private calculateDifficultyScore(metrics: {
    successRate: number;
    repsCompletionRate: number;
    weightCompletionRate: number;
    failurePattern: FailurePattern;
    consistencyScore: number;
  }): number {
    let score = 0;

    // 1. Taux de réussite : 35% du score
    score += metrics.successRate * 35;

    // 2. Complétion des reps : 30% du score
    score += Math.min(metrics.repsCompletionRate, 1.2) * 30;

    // 3. Complétion du poids : 20% du score
    score += Math.min(metrics.weightCompletionRate, 1.2) * 20;

    // 4. Pattern d'échec : 10% du score
    const patternScore = {
      [FailurePattern.NONE]: 10,
      [FailurePattern.LATE]: 7, // Fatigue normale
      [FailurePattern.DISTRIBUTED]: 4, // Problème de charge
      [FailurePattern.EARLY]: 2, // Trop lourd dès le départ
    };
    score += patternScore[metrics.failurePattern];

    // 5. Consistance : 5% du score
    score += metrics.consistencyScore * 5;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Catégorise la performance selon le score
   */
  private categorizePerformance(score: number): PerformanceStatus {
    if (score >= 90) return PerformanceStatus.CRUSHING_IT;
    if (score >= 75) return PerformanceStatus.STRONG;
    if (score >= 60) return PerformanceStatus.PERFECT;
    if (score >= 45) return PerformanceStatus.CHALLENGING;
    if (score >= 30) return PerformanceStatus.STRUGGLING;
    return PerformanceStatus.OVERREACHING;
  }
}
