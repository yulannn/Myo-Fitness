import { ProgramTemplate } from '@prisma/client';
import { TemplateConstraints } from '../types/scoring.types';

/**
 * Contraintes de faisabilité pour chaque template
 * Basées sur la science de l'entraînement et standards de l'industrie
 */
export const TEMPLATE_CONSTRAINTS: Record<ProgramTemplate, TemplateConstraints> = {
    FULL_BODY: {
        minFrequency: 1,
        maxFrequency: 6,
        optimalFrequency: [2, 3],
        // Science: Full Body flexible 1-6j
        // 1-3j : Optimal pour débutants/intermédiaires
        // 4-6j : Haute fréquence pour avancés (volume modéré par séance)
    },

    UPPER_LOWER: {
        minFrequency: 2,
        maxFrequency: 6,
        optimalFrequency: [4],
        // Science: Upper/Lower optimal à 4j (2x upper, 2x lower)
        // Possible 2-6j avec adaptation volume
    },

    PUSH_PULL_LEGS: {
        minFrequency: 3,
        maxFrequency: 6,
        optimalFrequency: [3, 6],
        // Science: PPL classique à 3j OU PPLPPL à 6j
        // 3j = 1x/semaine par muscle, 6j = 2x/semaine (optimal)
    },

    PHAT: {
        minFrequency: 5,
        maxFrequency: 5,
        optimalFrequency: [5],
        // PHAT (Power Hypertrophy Adaptive Training) par Layne Norton
        // Structure fixe : 2 jours power + 3 jours hypertrophy
    },

    BRO_SPLIT: {
        minFrequency: 5,
        maxFrequency: 6,
        optimalFrequency: [5, 6],
        // Bro Split : 1 groupe musculaire majeur par jour
        // 5j standard (Chest/Back/Shoulders/Arms/Legs)
        // 6j avec jour supplémentaire (ex: Arms split en Biceps/Triceps)
    },

    ARNOLD_SPLIT: {
        minFrequency: 6,
        maxFrequency: 6,
        optimalFrequency: [6],
        // Arnold Split : Chest+Back / Shoulders+Arms / Legs (2x chacun)
        // Antagonistes entraînés ensemble
        // Structure fixe à 6 jours
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
    FREQUENCY_MATCH: 25,      // Correspondance avec fréquence optimale
    MUSCLE_FREQUENCY: 20,     // Fréquence par groupe musculaire (2x/semaine = optimal)
    VOLUME_CAPACITY: 15,      // Capacité de volume selon objectif
    EXPERIENCE_MATCH: 15,     // Adaptation au niveau d'expérience
    MUSCLE_PRIORITIES: 15,    // Support des priorités musculaires
    RECOVERY_FACTOR: 10,      // Adaptation à l'âge/récupération
    WEIGHT_INTENT: 10,        // Adaptation à l'objectif de poids
};
