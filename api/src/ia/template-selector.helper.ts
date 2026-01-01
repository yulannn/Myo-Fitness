import { ProgramTemplate } from '@prisma/client';

/**
 * Règles de sélection de template basées sur la fréquence d'entraînement
 * 
 * | Fréquence | Template                          |
 * |-----------|-----------------------------------|
 * | 1-2 jours | FULL_BODY                         |
 * | 3 jours   | PUSH_PULL_LEGS                    |
 * | 4 jours   | UPPER_LOWER (x2)                  |
 * | 5 jours   | PUSH_PULL_LEGS + UPPER_LOWER      |
 * | 6 jours   | PUSH_PULL_LEGS x2                 |
 * | 7 jours   | PUSH_PULL_LEGS x2 + FULL_BODY     |
 */

export interface TemplateSelection {
    template: ProgramTemplate;
    sessionStructure: string[];
    description: string;
}

/**
 * Sélectionne le template optimal basé sur la fréquence d'entraînement
 * 
 * @param trainingFrequency - Nombre de jours d'entraînement par semaine (1-7)
 * @returns Template sélectionné avec structure des sessions
 */
export function selectTemplateByFrequency(trainingFrequency: number): TemplateSelection {
    switch (trainingFrequency) {
        case 1:
            return {
                template: 'FULL_BODY',
                sessionStructure: ['Full Body'],
                description: '1 séance Full Body par semaine',
            };

        case 2:
            return {
                template: 'FULL_BODY',
                sessionStructure: ['Full Body', 'Full Body'],
                description: '2 séances Full Body par semaine',
            };

        case 3:
            return {
                template: 'PUSH_PULL_LEGS',
                sessionStructure: ['Push', 'Pull', 'Legs'],
                description: 'Push/Pull/Legs classique - 1 cycle par semaine',
            };

        case 4:
            return {
                template: 'UPPER_LOWER',
                sessionStructure: ['Upper', 'Lower', 'Upper', 'Lower'],
                description: 'Upper/Lower x2 - Chaque zone 2x par semaine',
            };

        case 5:
            return {
                template: 'PPL_UPPER_LOWER',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
                description: 'PPL + Upper/Lower - Volume optimal',
            };

        case 6:
            return {
                template: 'PPL_X2',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
                description: 'PPL x2 - Chaque muscle 2x par semaine',
            };

        case 7:
            return {
                template: 'PPL_X2_FULL_BODY',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Full Body'],
                description: 'PPL x2 + Full Body - Volume maximal',
            };

        default:
            // Fallback pour valeurs hors limites
            if (trainingFrequency < 1) {
                return selectTemplateByFrequency(1);
            }
            return selectTemplateByFrequency(7);
    }
}

/**
 * Obtient une description lisible de la sélection
 */
export function getTemplateSelectionLog(
    trainingFrequency: number,
    selection: TemplateSelection,
): string {
    return `
🎯 ===== TEMPLATE SELECTION =====
📅 Fréquence: ${trainingFrequency} jours/semaine
✅ Template: ${selection.template}
📋 Structure: ${selection.sessionStructure.join(' → ')}
💡 ${selection.description}
🎯 ================================
`;
}
