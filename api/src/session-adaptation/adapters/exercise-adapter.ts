import {
    AdaptationStrategy,
    AdaptedExercise,
    AdaptationConstraints,
    AdaptationType,
    AdaptationMagnitude,
    WEIGHTED_CONSTRAINTS,
    BODYWEIGHT_CONSTRAINTS
} from '../types/adaptation.types';

/**
 * Applique les adaptations concrètes aux exercices
 */
export class ExerciseAdapter {

    private constraints: AdaptationConstraints;

    constructor() {
        this.constraints = WEIGHTED_CONSTRAINTS;
    }

    /**
     * Adapte un exercice selon la stratégie
     */
    adapt(
        currentReps: number,
        currentWeight: number | null,
        currentSets: number,
        strategy: AdaptationStrategy,
        isBodyweight: boolean
    ): AdaptedExercise {

        // Utiliser les contraintes appropriées selon le type d'exercice
        this.constraints = isBodyweight ? BODYWEIGHT_CONSTRAINTS : WEIGHTED_CONSTRAINTS;

        let newReps = currentReps;
        let newWeight = currentWeight;
        let newSets = currentSets;

        if (isBodyweight) {
            ({ reps: newReps, sets: newSets } = this.adaptBodyweight(
                currentReps,
                currentSets,
                strategy
            ));
        } else {
            ({ reps: newReps, weight: newWeight, sets: newSets } = this.adaptWeighted(
                currentReps,
                currentWeight,
                currentSets,
                strategy
            ));
        }

        // Appliquer les contraintes
        newReps = this.clamp(newReps, this.constraints.minReps, this.constraints.maxReps);
        newSets = this.clamp(newSets, this.constraints.minSets, this.constraints.maxSets);

        // ⚠️ IMPORTANT : Les exercices poids du corps ne doivent JAMAIS avoir de poids
        if (isBodyweight) {
            newWeight = null;
        } else if (newWeight !== null) {
            newWeight = Math.max(newWeight, this.constraints.minWeight);
        }

        const repsChange = newReps - currentReps;
        const weightChange = newWeight !== null && currentWeight !== null ? newWeight - currentWeight : null;
        const setsChange = newSets - currentSets;

        return {
            reps: newReps,
            weight: newWeight,
            sets: newSets,
            changeFromPrevious: {
                reps: repsChange,
                weight: weightChange,
                sets: setsChange
            },
            reasoning: strategy.reasoning,
            strategy
        };
    }

    private adaptWeighted(
        currentReps: number,
        currentWeight: number | null,
        currentSets: number,
        strategy: AdaptationStrategy
    ): { reps: number; weight: number | null; sets: number } {

        const hasWeight = currentWeight !== null && currentWeight > 0;

        switch (strategy.type) {
            case AdaptationType.INTENSITY:
                return this.increaseIntensity(currentReps, currentWeight, currentSets, strategy.magnitude, hasWeight);

            case AdaptationType.VOLUME:
                return this.increaseVolume(currentReps, currentWeight, currentSets, strategy.magnitude);

            case AdaptationType.DENSITY:
                return this.increaseDensity(currentReps, currentWeight, currentSets, strategy.magnitude, hasWeight);

            case AdaptationType.DELOAD:
                return this.deload(currentReps, currentWeight, currentSets, strategy.magnitude, hasWeight);

            case AdaptationType.MAINTAIN:
            default:
                return { reps: currentReps, weight: currentWeight, sets: currentSets };
        }
    }

    private adaptBodyweight(
        currentReps: number,
        currentSets: number,
        strategy: AdaptationStrategy
    ): { reps: number; sets: number } {

        switch (strategy.type) {
            case AdaptationType.INTENSITY:
            case AdaptationType.VOLUME:
            case AdaptationType.DENSITY:
                if (currentReps >= 15) {
                    return {
                        reps: Math.max(currentReps - 3, 10),
                        sets: Math.min(currentSets + 1, this.constraints.maxSets)
                    };
                } else {
                    const increment = strategy.magnitude === AdaptationMagnitude.MICRO ? 1 : 2;
                    return {
                        reps: currentReps + increment,
                        sets: currentSets
                    };
                }

            case AdaptationType.DELOAD:
                const decrement = strategy.magnitude === AdaptationMagnitude.MACRO ? 3 : 2;
                return {
                    reps: Math.max(currentReps - decrement, this.constraints.minReps),
                    sets: Math.max(currentSets - 1, this.constraints.minSets)
                };

            case AdaptationType.MAINTAIN:
            default:
                return { reps: currentReps, sets: currentSets };
        }
    }

    private increaseIntensity(
        reps: number,
        weight: number | null,
        sets: number,
        magnitude: AdaptationMagnitude,
        hasWeight: boolean
    ): { reps: number; weight: number | null; sets: number } {

        if (!hasWeight) {
            return {
                reps,
                weight: this.constraints.minWeight,
                sets
            };
        }

        const increment = this.getWeightIncrement(magnitude);
        const maxIncrease = weight! * this.constraints.maxWeightIncreasePerSession;
        const actualIncrement = Math.min(increment, maxIncrease);

        return {
            reps: Math.max(reps - 1, 6),
            weight: this.roundToNearestHalf(weight! + actualIncrement),
            sets
        };
    }

    private increaseVolume(
        reps: number,
        weight: number | null,
        sets: number,
        magnitude: AdaptationMagnitude
    ): { reps: number; weight: number | null; sets: number } {

        const repsIncrement = magnitude === AdaptationMagnitude.MICRO ? 1 : 2;

        if (reps + repsIncrement <= this.constraints.maxReps) {
            return { reps: reps + repsIncrement, weight, sets };
        } else if (sets < this.constraints.maxSets) {
            return { reps, weight, sets: sets + 1 };
        }

        return { reps, weight, sets };
    }

    private increaseDensity(
        reps: number,
        weight: number | null,
        sets: number,
        magnitude: AdaptationMagnitude,
        hasWeight: boolean
    ): { reps: number; weight: number | null; sets: number } {

        const newReps = Math.min(reps + 1, this.constraints.maxReps);
        let newWeight = weight;

        if (hasWeight) {
            const increment = this.constraints.weightIncrements.microloading;
            newWeight = this.roundToNearestHalf(weight! + increment);
        }

        return { reps: newReps, weight: newWeight, sets };
    }

    private deload(
        reps: number,
        weight: number | null,
        sets: number,
        magnitude: AdaptationMagnitude,
        hasWeight: boolean
    ): { reps: number; weight: number | null; sets: number } {

        const deloadFactor = magnitude === AdaptationMagnitude.MACRO ? 0.70 : 0.85;

        let newReps = reps;
        let newWeight = weight;
        let newSets = sets;

        if (hasWeight) {
            newWeight = this.roundToNearestHalf(weight! * deloadFactor);
        } else {
            newReps = Math.floor(reps * deloadFactor);
        }

        if (magnitude === AdaptationMagnitude.MACRO) {
            newSets = Math.max(sets - 1, this.constraints.minSets);
        }

        return { reps: newReps, weight: newWeight, sets: newSets };
    }

    private getWeightIncrement(magnitude: AdaptationMagnitude): number {
        switch (magnitude) {
            case AdaptationMagnitude.MICRO:
                return this.constraints.weightIncrements.microloading;
            case AdaptationMagnitude.NORMAL:
                return this.constraints.weightIncrements.standard;
            case AdaptationMagnitude.MACRO:
                return this.constraints.weightIncrements.macro;
        }
    }

    private roundToNearestHalf(value: number): number {
        return Math.round(value * 2) / 2;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}
