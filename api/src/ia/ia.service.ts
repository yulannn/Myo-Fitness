import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import Groq from 'groq-sdk';
import { CreateIaDto } from './dto/create-ia.dto';
import { z } from 'zod';
import { FitnessProfile } from '@prisma/client';

const ExerciseSchema = z.union([
  z.number(),
  z.object({
    id: z.number(),
    sets: z.number().optional(),
    reps: z.number().optional(),
  }),
]);

const SessionSchema = z.object({
  name: z.string(),
  exercises: z.array(ExerciseSchema),
});

const LlmProgramSchema = z.object({
  template: z.string(),
  sessions: z.array(SessionSchema),
});


const FULL_BODY = 'FULL_BODY';
const PUSH_PULL_LEGS = 'PUSH_PULL_LEGS';
const UPPER_LOWER = 'UPPER_LOWER';
const PUSH_PULL_LEGS_UPPER_LOWER = 'PUSH_PULL_LEGS_UPPER_LOWER';
const PUSH_PULL_LEGS_PUSH_PULL_LEGS = 'PUSH_PULL_LEGS_PUSH_PULL_LEGS';
const PUSH_PULL_LEGS_CARDIO = 'PUSH_PULL_LEGS_CARDIO';

@Injectable()
export class IaService {
  private readonly groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
  });

  constructor(private prisma: PrismaService) { }

  async generateProgram(fitnessProfile: FitnessProfile) {


    const template = this.templateCreation(fitnessProfile.trainingFrequency);

    const exercices = await this.prisma.exercice.findMany({
      where: {
        difficulty: fitnessProfile.experienceLevel === 'BEGINNER'
          ? { lte: 3 }
          : fitnessProfile.experienceLevel === 'INTERMEDIATE'
            ? { lte: 4 }
            : { gte: 3 },
        bodyWeight: fitnessProfile.bodyWeight ? true : false,
      },
      include: { groupes: true, equipments: true },
    });



    const prompt = `
          Tu es un coach sportif expert.
          L'utilisateur a un profil "${fitnessProfile.experienceLevel}" qui s'entraîne ${fitnessProfile.trainingFrequency} fois par semaine.
          Tu dois lui proposer un programme ${template} en choisissant au moins 4 à 5 exercices par séance en travaillant les groupes musculaires correspondants à la séance.

          Retourne STRICTEMENT du JSON valide (Rien d'autre). Le format attendu est :
          {
            "template": "${template}",
            "sessions": [
              { "name": "Upper", "exercises": [2,3,8,14] },
              { "name": "Lower", "exercises": [2,4,8,12] }
            ]
          }

          Si tu fournis des sets/reps, la forme d'un exercice est { "id": 2, "sets": 4, "reps": 8 }.

          Voici la liste d'exercices disponibles (ID - NOM) :
          ${exercices.map(e => `ID: ${e.id} - ${e.name}`).join('\n')}

          Ne renvoie pas d'id d'exercice qui n'est pas dans cette liste.

          Respecte strictement le format JSON demandé et ne fournis aucun texte supplémentaire.
              `;

    const completion = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Tu es un assistant qui renvoie uniquement du JSON valide.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    try {
      const cleaned = response
        ?.replace(/```json/g, '')
        ?.replace(/```/g, '')
        ?.trim();

      const parsed = JSON.parse(cleaned || '{}');

      const validated = LlmProgramSchema.parse(parsed);

      if (validated.template !== template) {
        throw new Error('Template in response does not match expected template');
      }

      return validated;

    } catch (err) {
      console.error(' Failed to parse/validate LLM response:');

      if (err instanceof z.ZodError) {
        console.error('Zod validation errors:', err.issues);
      } else {
        console.error(err);
      }

      throw new Error('Invalid JSON returned by LLM or schema mismatch');
    }

  }

  templateCreation(frequency: number) {
    if (frequency < 3) return FULL_BODY;
    if (frequency === 3) return PUSH_PULL_LEGS;
    if (frequency === 4) return UPPER_LOWER;
    if (frequency === 5) return PUSH_PULL_LEGS_UPPER_LOWER;
    if (frequency === 6) return PUSH_PULL_LEGS_PUSH_PULL_LEGS;
    return PUSH_PULL_LEGS_CARDIO;
  }


}
