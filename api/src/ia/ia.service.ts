import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GroqClient } from './groq/groq.client';
import { PromptBuilder } from './groq/prompt.builder';
import { LlmProgramSchema } from './schemas/llm-program.schema';
import { FitnessProfile, ProgramTemplate } from '@prisma/client';
import {
  selectTemplateByFrequency,
  getTemplateSelectionLog,
} from './template-selector.helper';

@Injectable()
export class IaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groqClient: GroqClient,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async generateProgram(
    fitnessProfile: FitnessProfile,
    overrideTemplate?: ProgramTemplate,
  ) {
    // 🎯 Sélection du template : utilise l'override si fourni, sinon calcule selon la fréquence
    const templateSelection = selectTemplateByFrequency(
      fitnessProfile.trainingFrequency,
    );

    // Si l'utilisateur a choisi un template différent, on l'utilise
    const effectiveTemplate = overrideTemplate || templateSelection.template;
    const effectiveSessionStructure = overrideTemplate
      ? this.getSessionStructureForTemplate(
          overrideTemplate,
          fitnessProfile.trainingFrequency,
        )
      : templateSelection.sessionStructure;

    // 📊 Log pour debugging
    if (overrideTemplate) {
      console.log(`🎯 ===== USER OVERRIDE TEMPLATE =====`);
      console.log(
        `📅 Fréquence: ${fitnessProfile.trainingFrequency} jours/semaine`,
      );
      console.log(`🔄 Recommandé: ${templateSelection.template}`);
      console.log(`✅ Choisi par l'utilisateur: ${effectiveTemplate}`);
      console.log(`📋 Structure: ${effectiveSessionStructure.join(' → ')}`);
      console.log(`🎯 ================================`);
    } else {
      console.log(
        getTemplateSelectionLog(
          fitnessProfile.trainingFrequency,
          templateSelection,
        ),
      );
    }

    // Charger les exercices selon le niveau et type d'entraînement
    const exercices = await this.prisma.exercice.findMany({
      where: {
        difficulty:
          fitnessProfile.experienceLevel === 'BEGINNER'
            ? { lte: 3 }
            : fitnessProfile.experienceLevel === 'INTERMEDIATE'
              ? { lte: 4 }
              : { gte: 3 },
        bodyWeight: fitnessProfile.bodyWeight ? true : false,
      },
      include: { groupes: true, equipments: true },
    });

    // 🎯 Charger les groupes musculaires prioritaires si définis
    let priorityMuscles:
      | Awaited<ReturnType<typeof this.prisma.muscleGroup.findMany>>
      | undefined = undefined;
    if (
      fitnessProfile.musclePriorities &&
      fitnessProfile.musclePriorities.length > 0
    ) {
      priorityMuscles = await this.prisma.muscleGroup.findMany({
        where: {
          id: { in: fitnessProfile.musclePriorities },
        },
      });
    }

    const prompt = this.promptBuilder.buildProgramPrompt(
      fitnessProfile,
      effectiveTemplate,
      exercices,
      priorityMuscles,
      effectiveSessionStructure, // 🎯 Passe la structure exacte des sessions
    );

    try {
      const result = await this.groqClient.generateJsonResponse(
        prompt,
        LlmProgramSchema,
        effectiveTemplate,
      );
      return result;
    } catch (error) {
      console.warn(
        '⚠️ LLM failed after retries. Using backup generator. Last error:',
        error,
      );
      return this.generateProgramBackup(fitnessProfile, effectiveTemplate);
    }
  }

  /**
   * 🎯 Génère la structure des sessions pour un template donné
   * Chaque template a maintenant sa propre structure explicite
   */
  private getSessionStructureForTemplate(
    template: ProgramTemplate,
    frequency: number,
  ): string[] {
    switch (template) {
      case 'FULL_BODY':
        // Full Body répété selon la fréquence
        return Array(frequency).fill('Full Body');

      case 'UPPER_LOWER':
        return ['Upper', 'Lower', 'Upper', 'Lower'];

      case 'PUSH_PULL_LEGS':
        return ['Push', 'Pull', 'Legs'];

      case 'PPL_UPPER_LOWER':
        return ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];

      case 'PPL_X2':
        return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];

      case 'PPL_X2_FULL_BODY':
        return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Full Body'];

      case 'CUSTOM':
      default:
        // Pour CUSTOM, on génère des Full Body par défaut
        return Array(frequency).fill('Full Body');
    }
  }

  private async generateProgramBackup(
    fitnessProfile: FitnessProfile,
    template: ProgramTemplate,
  ) {
    type ExerciseEntry = { id: number; sets: number; reps: number };
    type SessionEntry = { name: string; exercises: ExerciseEntry[] };

    const allExercises = await this.prisma.exercice.findMany({
      where: {
        difficulty:
          fitnessProfile.experienceLevel === 'BEGINNER'
            ? { lte: 3 }
            : fitnessProfile.experienceLevel === 'INTERMEDIATE'
              ? { lte: 4 }
              : { gte: 3 },
        bodyWeight: fitnessProfile.bodyWeight,
        isDefault: true,
      },
      include: { groupes: { include: { groupe: true } } },
    });

    const defaultReps = {
      BEGINNER: { upper: 12, lower: 15 },
      INTERMEDIATE: { upper: 10, lower: 12 },
      ADVANCED: { upper: 8, lower: 10 },
    };
    const defaultSets = { BEGINNER: 3, INTERMEDIATE: 3, ADVANCED: 4 };

    const reps = defaultReps[fitnessProfile.experienceLevel];
    const sets = defaultSets[fitnessProfile.experienceLevel];

    const upperGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    const lowerGroups = ['quads', 'hamstrings', 'glutes', 'calves'];

    const pickExercises = (groups: string[], count = 5): ExerciseEntry[] => {
      const filtered = allExercises.filter((ex) =>
        ex.groupes.some((g) => groups.includes(g.groupe.name.toLowerCase())),
      );
      return filtered
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map((ex) => ({
          id: ex.id,
          sets,
          reps: groups.some((g) => upperGroups.includes(g))
            ? reps.upper
            : reps.lower,
        }));
    };

    // 🎯 Utiliser la structure de sessions exacte selon le template et la fréquence
    const sessionStructure = this.getSessionStructureForTemplate(
      template,
      fitnessProfile.trainingFrequency,
    );

    const sessions: SessionEntry[] = sessionStructure.map((sessionName) => {
      switch (sessionName) {
        case 'Push':
          return {
            name: 'Push',
            exercises: pickExercises(['chest', 'shoulders', 'triceps'], 5),
          };
        case 'Pull':
          return {
            name: 'Pull',
            exercises: pickExercises(['back', 'biceps'], 5),
          };
        case 'Legs':
          return { name: 'Legs', exercises: pickExercises(lowerGroups, 5) };
        case 'Upper':
          return { name: 'Upper', exercises: pickExercises(upperGroups, 5) };
        case 'Lower':
          return { name: 'Lower', exercises: pickExercises(lowerGroups, 5) };
        case 'Full Body':
        default:
          return {
            name: 'Full Body',
            exercises: pickExercises([...upperGroups, ...lowerGroups], 6),
          };
      }
    });

    return { template, sessions };
  }
}
