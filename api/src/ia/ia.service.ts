import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GroqClient } from './groq/groq.client';
import { PromptBuilder } from './groq/prompt.builder';
import { LlmProgramSchema } from './schemas/llm-program.schema';
import { FitnessProfile } from '@prisma/client';
import { selectTemplateByFrequency, getTemplateSelectionLog } from './template-selector.helper';


@Injectable()
export class IaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groqClient: GroqClient,
    private readonly promptBuilder: PromptBuilder,
  ) { }

  async generateProgram(fitnessProfile: FitnessProfile) {
    // 🎯 Sélection du template basée sur la fréquence d'entraînement (règles hard-codées)
    const templateSelection = selectTemplateByFrequency(fitnessProfile.trainingFrequency);

    // 📊 Log pour debugging
    console.log(getTemplateSelectionLog(fitnessProfile.trainingFrequency, templateSelection));

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
    let priorityMuscles: Awaited<ReturnType<typeof this.prisma.muscleGroup.findMany>> | undefined = undefined;
    if (fitnessProfile.musclePriorities && fitnessProfile.musclePriorities.length > 0) {
      priorityMuscles = await this.prisma.muscleGroup.findMany({
        where: {
          id: { in: fitnessProfile.musclePriorities },
        },
      });
    }

    const prompt = this.promptBuilder.buildProgramPrompt(
      fitnessProfile,
      templateSelection.template,
      exercices,
      priorityMuscles,
      templateSelection.sessionStructure  // 🎯 Passe la structure exacte des sessions
    );


    try {
      const result = await this.groqClient.generateJsonResponse(
        prompt,
        LlmProgramSchema,
        templateSelection.template,
      );
      return result;
    } catch (error) {
      console.warn(
        '⚠️ LLM failed after retries. Using backup generator. Last error:',
        error,
      );
      return this.generateProgramBackup(fitnessProfile, templateSelection.template);
    }
  }



  private async generateProgramBackup(fitnessProfile: FitnessProfile, template: string) {
    type ExerciseEntry = { id: number; sets: number; reps: number };
    type SessionEntry = { name: string; exercises: ExerciseEntry[] };

    // Template est maintenant passé en paramètre (choisi par le scoring)
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

    const defaultReps = { BEGINNER: { upper: 12, lower: 15 }, INTERMEDIATE: { upper: 10, lower: 12 }, ADVANCED: { upper: 8, lower: 10 } };
    const defaultSets = { BEGINNER: 3, INTERMEDIATE: 3, ADVANCED: 4 };

    const reps = defaultReps[fitnessProfile.experienceLevel];
    const sets = defaultSets[fitnessProfile.experienceLevel];

    const upperGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    const lowerGroups = ['quads', 'hamstrings', 'glutes', 'calves'];

    function pickExercises(groups: string[], count = 5): ExerciseEntry[] {
      const filtered = allExercises.filter(ex =>
        ex.groupes.some(g => groups.includes(g.groupe.name.toLowerCase())),
      );
      return filtered
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(ex => ({
          id: ex.id,
          sets,
          reps: groups.some(g => upperGroups.includes(g)) ? reps.upper : reps.lower,
        }));
    }

    const sessions: SessionEntry[] = [];

    switch (template) {
      case 'FULL_BODY':
        sessions.push({
          name: 'Full Body',
          exercises: pickExercises([...upperGroups, ...lowerGroups], 6),
        });
        break;

      case 'UPPER_LOWER_UPPER_LOWER':
        sessions.push(
          { name: 'Upper', exercises: pickExercises(upperGroups, 5) },
          { name: 'Lower', exercises: pickExercises(lowerGroups, 5) },
          { name: 'Upper', exercises: pickExercises(upperGroups, 5) },
          { name: 'Lower', exercises: pickExercises(lowerGroups, 5) },
        );
        break;

      case 'PUSH_PULL_LEGS':
        sessions.push(
          { name: 'Push', exercises: pickExercises(['chest', 'shoulders', 'triceps'], 5) },
          { name: 'Pull', exercises: pickExercises(['back', 'biceps'], 5) },
          { name: 'Legs', exercises: pickExercises(lowerGroups, 5) },
        );
        break;

      case 'PUSH_PULL_LEGS_UPPER_LOWER':
        sessions.push(
          { name: 'Push', exercises: pickExercises(['chest', 'shoulders', 'triceps'], 4) },
          { name: 'Pull', exercises: pickExercises(['back', 'biceps'], 4) },
          { name: 'Legs', exercises: pickExercises(lowerGroups, 4) },
          { name: 'Upper', exercises: pickExercises(upperGroups, 4) },
          { name: 'Lower', exercises: pickExercises(lowerGroups, 4) },
        );
        break;

      case 'PUSH_PULL_LEGS_PUSH_PULL_LEGS':
        sessions.push(
          { name: 'Push', exercises: pickExercises(['chest', 'shoulders', 'triceps'], 4) },
          { name: 'Pull', exercises: pickExercises(['back', 'biceps'], 4) },
          { name: 'Legs', exercises: pickExercises(lowerGroups, 4) },
          { name: 'Push', exercises: pickExercises(['chest', 'shoulders', 'triceps'], 4) },
          { name: 'Pull', exercises: pickExercises(['back', 'biceps'], 4) },
          { name: 'Legs', exercises: pickExercises(lowerGroups, 4) },
        );
        break;

      default:
        sessions.push({
          name: 'Full Body',
          exercises: pickExercises([...upperGroups, ...lowerGroups], 6),
        });
        break;
    }

    return { template, sessions };
  }

}
