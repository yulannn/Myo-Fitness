import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GroqClient } from './groq/groq.client';
import { PromptBuilder } from './groq/prompt.builder';
import { LlmProgramSchema } from './schemas/llm-program.schema';
import { FitnessProfile } from '@prisma/client';

const FULL_BODY = 'FULL_BODY';
const PUSH_PULL_LEGS = 'PUSH_PULL_LEGS';
const UPPER_LOWER_UPPER_LOWER = 'UPPER_LOWER_UPPER_LOWER';
const PUSH_PULL_LEGS_UPPER_LOWER = 'PUSH_PULL_LEGS_UPPER_LOWER';
const PUSH_PULL_LEGS_PUSH_PULL_LEGS = 'PUSH_PULL_LEGS_PUSH_PULL_LEGS';

@Injectable()
export class IaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groqClient: GroqClient,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async generateProgram(fitnessProfile: FitnessProfile) {
    const template = this.templateCreation(fitnessProfile.trainingFrequency);

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

    const prompt = this.promptBuilder.buildProgramPrompt(fitnessProfile, template, exercices);

    try {
      const result = await this.groqClient.generateJsonResponse(
        prompt,
        LlmProgramSchema,
        template,
      );
      return result;
    } catch (error) {
      console.warn(
        'LLM failed after retries. Using backup generator. Last error:',
        error,
      );
      return this.generateProgramBackup(fitnessProfile);
    }
  }

  private templateCreation(frequency: number): string {
    if (frequency < 3) return FULL_BODY;
    if (frequency === 3) return PUSH_PULL_LEGS;
    if (frequency === 4) return UPPER_LOWER_UPPER_LOWER;
    if (frequency === 5) return PUSH_PULL_LEGS_UPPER_LOWER;
    if (frequency === 6) return PUSH_PULL_LEGS_PUSH_PULL_LEGS;
    return FULL_BODY;
  }

  private async generateProgramBackup(fitnessProfile: FitnessProfile) {
    type ExerciseEntry = { id: number; sets: number; reps: number };
    type SessionEntry = { name: string; exercises: ExerciseEntry[] };
  
    const template = this.templateCreation(fitnessProfile.trainingFrequency);
  
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
  
    return {template, sessions};
  }
  
}
  