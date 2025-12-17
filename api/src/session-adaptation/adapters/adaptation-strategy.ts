import {
    PerformanceStatus,
    AdaptationStrategy,
    AdaptationType,
    AdaptationPriority,
    AdaptationMagnitude
} from '../types/adaptation.types';

/**
 * Définit la stratégie d'adaptation selon la performance
 */
export class AdaptationStrategyEngine {

    /**
     * Détermine la meilleure stratégie d'adaptation
     */
    determine(
        status: PerformanceStatus,
        isBodyweight: boolean,
        currentWeight: number | null
    ): AdaptationStrategy {

        switch (status) {
            case PerformanceStatus.CRUSHING_IT:
                return this.strategyCrushingIt(isBodyweight, currentWeight);

            case PerformanceStatus.STRONG:
                return this.strategyStrong(isBodyweight);

            case PerformanceStatus.PERFECT:
                return this.strategyPerfect();

            case PerformanceStatus.CHALLENGING:
                return this.strategyChallenging(isBodyweight);

            case PerformanceStatus.STRUGGLING:
                return this.strategyStruggling(isBodyweight);

            case PerformanceStatus.OVERREACHING:
                return this.strategyOverreaching();
        }
    }

    /**
     * CRUSHING_IT : Trop facile, augmenter la difficulté
     */
    private strategyCrushingIt(isBodyweight: boolean, currentWeight: number | null): AdaptationStrategy {
        if (isBodyweight) {
            return {
                type: AdaptationType.VOLUME,
                priority: AdaptationPriority.MIXED,
                magnitude: AdaptationMagnitude.NORMAL,
                reasoning: 'Performance excellente - Augmentation du volume (reps ou sets)',
                confidence: 0.9
            };
        } else {
            // Pour exercices avec poids : priorité à l'intensité
            const canIncreaseWeight = currentWeight != null && currentWeight > 0;

            return {
                type: canIncreaseWeight ? AdaptationType.INTENSITY : AdaptationType.VOLUME,
                priority: canIncreaseWeight ? AdaptationPriority.WEIGHT : AdaptationPriority.REPS,
                magnitude: AdaptationMagnitude.NORMAL,
                reasoning: canIncreaseWeight
                    ? 'Performance excellente - Augmentation de la charge'
                    : 'Performance excellente - Introduction de charge ou augmentation volume',
                confidence: 0.9
            };
        }
    }

    /**
     * STRONG : Bon niveau, progresser prudemment
     */
    private strategyStrong(isBodyweight: boolean): AdaptationStrategy {
        return {
            type: AdaptationType.INTENSITY,
            priority: isBodyweight ? AdaptationPriority.REPS : AdaptationPriority.WEIGHT,
            magnitude: AdaptationMagnitude.MICRO,
            reasoning: 'Bon niveau - Micro-progression pour consolider',
            confidence: 0.85
        };
    }

    /**
     * PERFECT : Zone idéale, maintenir
     */
    private strategyPerfect(): AdaptationStrategy {
        return {
            type: AdaptationType.MAINTAIN,
            priority: AdaptationPriority.MIXED,
            magnitude: AdaptationMagnitude.MICRO,
            reasoning: 'Zone idéale de progression - Maintien pour consolider les acquis',
            confidence: 1.0
        };
    }

    /**
     * CHALLENGING : Difficile, évaluer avant d'ajuster
     */
    private strategyChallenging(isBodyweight: boolean): AdaptationStrategy {
        return {
            type: AdaptationType.MAINTAIN,
            priority: AdaptationPriority.MIXED,
            magnitude: AdaptationMagnitude.MICRO,
            reasoning: 'Difficulté gérée - Maintien pour évaluer sur 1-2 séances supplémentaires',
            confidence: 0.7
        };
    }

    /**
     * STRUGGLING : Trop dur, réduire
     */
    private strategyStruggling(isBodyweight: boolean): AdaptationStrategy {
        return {
            type: AdaptationType.DELOAD,
            priority: isBodyweight ? AdaptationPriority.REPS : AdaptationPriority.WEIGHT,
            magnitude: AdaptationMagnitude.NORMAL,
            reasoning: 'Difficulté excessive - Réduction pour améliorer la technique',
            confidence: 0.8
        };
    }

    /**
     * OVERREACHING : Surentraînement, deload important
     */
    private strategyOverreaching(): AdaptationStrategy {
        return {
            type: AdaptationType.DELOAD,
            priority: AdaptationPriority.MIXED,
            magnitude: AdaptationMagnitude.MACRO,
            reasoning: 'Signes de surentraînement - Deload important nécessaire',
            confidence: 0.95
        };
    }
}
