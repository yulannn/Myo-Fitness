import type { ProgramTemplate } from '../types/program.type';

/**
 * 🎯 Informations sur un template d'entraînement
 */
export interface TemplateInfo {
    template: ProgramTemplate;
    label: string;
    description: string;
    sessionStructure: string[];
    isRecommended: boolean;
}

/**
 * 📊 Règles de sélection de template basées sur la fréquence d'entraînement
 * 
 * | Fréquence | Template                          |
 * |-----------|-----------------------------------|
 * | 1-2 jours | FULL_BODY                         |
 * | 3 jours   | PUSH_PULL_LEGS                    |
 * | 4 jours   | UPPER_LOWER                       |
 * | 5 jours   | PPL_UPPER_LOWER                   |
 * | 6 jours   | PPL_X2                            |
 * | 7 jours   | PPL_X2_FULL_BODY                  |
 */

interface TemplateConfig {
    template: Exclude<ProgramTemplate, 'CUSTOM'>;
    label: string;
    description: string;
    sessionStructure: string[];
}

/**
 * 🎯 Retourne la configuration exacte du template recommandé selon la fréquence
 * (Miroir exact du backend template-selector.helper.ts)
 */
function getRecommendedConfig(trainingFrequency: number): TemplateConfig {
    switch (trainingFrequency) {
        case 1:
            return {
                template: 'FULL_BODY',
                label: 'Full Body',
                sessionStructure: ['Full Body'],
                description: '1 séance Full Body par semaine',
            };

        case 2:
            return {
                template: 'FULL_BODY',
                label: 'Full Body',
                sessionStructure: ['Full Body', 'Full Body'],
                description: '2 séances Full Body par semaine',
            };

        case 3:
            return {
                template: 'PUSH_PULL_LEGS',
                label: 'Push/Pull/Legs',
                sessionStructure: ['Push', 'Pull', 'Legs'],
                description: 'Push/Pull/Legs classique - 1 cycle par semaine',
            };

        case 4:
            return {
                template: 'UPPER_LOWER',
                label: 'Upper/Lower',
                sessionStructure: ['Upper', 'Lower', 'Upper', 'Lower'],
                description: 'Upper/Lower x2 - Chaque zone 2x par semaine',
            };

        case 5:
            return {
                template: 'PPL_UPPER_LOWER',
                label: 'PPL + Upper/Lower',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
                description: 'PPL + Upper/Lower - Volume optimal',
            };

        case 6:
            return {
                template: 'PPL_X2',
                label: 'Push/Pull/Legs x2',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
                description: 'PPL x2 - Chaque muscle 2x par semaine',
            };

        case 7:
        default:
            return {
                template: 'PPL_X2_FULL_BODY',
                label: 'PPL x2 + Full Body',
                sessionStructure: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Full Body'],
                description: 'PPL x2 + Full Body - Volume maximal',
            };
    }
}

/**
 * 🎯 Génère la structure Full Body pour une fréquence donnée
 */
function getFullBodyConfig(trainingFrequency: number): TemplateConfig {
    const sessions = Array(trainingFrequency).fill('Full Body');
    return {
        template: 'FULL_BODY',
        label: 'Full Body',
        sessionStructure: sessions,
        description: `${trainingFrequency} séance${trainingFrequency > 1 ? 's' : ''} Full Body par semaine`,
    };
}

/**
 * 🎯 Retourne les templates disponibles pour une fréquence donnée
 * 
 * Règles :
 * - Affiche toujours le template recommandé (marqué comme tel)
 * - Affiche FULL_BODY comme alternative SI le recommandé n'est pas déjà FULL_BODY
 */
export function getAvailableTemplates(trainingFrequency: number): TemplateInfo[] {
    // Clamp pour les valeurs invalides
    const freq = Math.max(1, Math.min(7, trainingFrequency));

    const recommended = getRecommendedConfig(freq);
    const templates: TemplateInfo[] = [];

    // Toujours ajouter le template recommandé
    templates.push({
        ...recommended,
        isRecommended: true,
    });

    // Ajouter FULL_BODY comme alternative si le recommandé n'est pas déjà FULL_BODY
    if (recommended.template !== 'FULL_BODY') {
        const fullBodyConfig = getFullBodyConfig(freq);
        templates.push({
            ...fullBodyConfig,
            isRecommended: false,
        });
    }

    return templates;
}

/**
 * 🎯 Retourne les infos du template recommandé pour une fréquence
 */
export function getRecommendedTemplate(trainingFrequency: number): TemplateInfo {
    const freq = Math.max(1, Math.min(7, trainingFrequency));
    const config = getRecommendedConfig(freq);
    return {
        ...config,
        isRecommended: true,
    };
}

/**
 * 🎯 Retourne le label formaté pour un template
 */
export function getTemplateLabel(template: ProgramTemplate): string {
    switch (template) {
        case 'FULL_BODY':
            return 'Full Body';
        case 'UPPER_LOWER':
            return 'Upper/Lower';
        case 'PUSH_PULL_LEGS':
            return 'Push/Pull/Legs';
        case 'PPL_UPPER_LOWER':
            return 'PPL + Upper/Lower';
        case 'PPL_X2':
            return 'Push/Pull/Legs x2';
        case 'PPL_X2_FULL_BODY':
            return 'PPL x2 + Full Body';
        case 'CUSTOM':
            return 'Personnalisé';
        default:
            return 'Template';
    }
}
