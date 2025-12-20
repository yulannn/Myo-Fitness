import { ProgramTemplate } from '@prisma/client';

/**
 * Calcule la fréquence d'entraînement par groupe musculaire
 * 
 * Science: Fréquence 2x/semaine par muscle = optimal pour hypertrophie
 * (Schoenfeld et al., 2016)
 * 
 * @param template - Template de programme
 * @param trainingFrequency - Nombre de séances par semaine
 * @returns Nombre de fois par semaine qu'un muscle est travaillé
 */
export function calculateMuscleFrequency(
    template: ProgramTemplate,
    trainingFrequency: number,
): number {
    switch (template) {
        case 'FULL_BODY':
            // Chaque muscle travaillé à chaque séance
            // Mais volume par séance diminue avec haute fréquence
            return trainingFrequency;

        case 'UPPER_LOWER':
            // Chaque moitié du corps travaillée tous les 2 jours
            return trainingFrequency / 2;

        case 'PUSH_PULL_LEGS':
            // Chaque groupe (push/pull/legs) travaillé tous les 3 jours
            return trainingFrequency / 3;

        case 'BRO_SPLIT':
            // 1 muscle par jour = 1x/semaine par muscle
            // Sauf si 6 jours avec répétition
            return trainingFrequency >= 6 ? 1.2 : 1;

        case 'ARNOLD_SPLIT':
            // Chaque combinaison muscle 2x/semaine (6 jours)
            // Ex: Chest+Back le Lun et Jeu
            return 2;

        case 'CUSTOM':
            // Impossible à déterminer
            return 0;

        default:
            return 0;
    }
}

/**
 * Évalue la qualité de la fréquence musculaire
 * 
 * @param frequency - Fréquence par muscle par semaine
 * @returns Score de 0 à 20 et raison
 */
export function scoreMuscleFrequency(frequency: number): {
    score: number;
    reason: string;
} {
    if (frequency === 2) {
        return {
            score: 20,
            reason: `✅ Fréquence 2x/semaine par muscle (optimal pour hypertrophie)`,
        };
    }

    if (frequency >= 1.5 && frequency <= 2.5) {
        return {
            score: 15,
            reason: `Bonne fréquence musculaire (${frequency.toFixed(1)}x/semaine)`,
        };
    }

    if (frequency === 1) {
        return {
            score: 10,
            reason: `Fréquence 1x/semaine (maintenance musculaire)`,
        };
    }

    if (frequency < 1) {
        return {
            score: 5,
            reason: `⚠️ Fréquence sous-optimale (${frequency.toFixed(1)}x/semaine)`,
        };
    }

    if (frequency > 3 && frequency <= 4) {
        return {
            score: 12,
            reason: `Haute fréquence (${frequency.toFixed(1)}x/semaine) - avancés uniquement`,
        };
    }

    if (frequency > 4) {
        return {
            score: 8,
            reason: `⚠️ Fréquence très élevée (${frequency.toFixed(1)}x/semaine) - risque surmenage`,
        };
    }

    return {
        score: 12,
        reason: `Fréquence acceptable (${frequency.toFixed(1)}x/semaine)`,
    };
}
