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
      console.error('LLM failed after retries. Using backup generator. Last error:', error);
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

  private async generateProgramBackup(_fitnessProfile: FitnessProfile) {
    // Fallback logique si Groq échoue
    return {
      template: FULL_BODY,
      sessions: [
        {
          name: 'Full Body',
          exercises: [1, 2, 3, 4, 5],
        },
      ],
    };
  }
}
