import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import Groq from 'groq-sdk';
import { CreateIaDto } from './dto/create-ia.dto';

const FULL_BODY = 'FULL_BODY';
const PUSH_PULL_LEGS = 'PUSH_PULL_LEGS';
const UPPER_LOWER = 'UPPER_LOWER';
const UPPER_LOWER_PUSH_PULL = 'UPPER_LOWER_PUSH_PULL';
const PUSH_PULL_LEGS_CARDIO = 'PUSH_PULL_LEGS_CARDIO';

@Injectable()
export class IaService {
  private readonly groq = new Groq({
    apiKey: process.env.GROK_API_KEY,
  });

  constructor(private prisma: PrismaService) { }

  async generateProgram(createIaDto: CreateIaDto, userId: number) {
    const fitnessProfile = await this.prisma.fitnessProfile.findFirst({
      where: { id: createIaDto.fitnessProfileId, userId },
    });

    if (!fitnessProfile) {
      throw new Error('Fitness profile not found for this user');
    }

    const template = this.templateCreation(fitnessProfile.trainingFrequency);

    // récupère tous les exercices (pour que le LLM choisisse parmi eux)
    const exercices = await this.prisma.exercice.findMany({
      select: { id: true, name: true },
    });

    const prompt = `
Tu es un coach sportif expert.
L'utilisateur a un profil "${fitnessProfile.experienceLevel}" qui s'entraîne ${fitnessProfile.trainingFrequency} fois par semaine.
Tu dois lui proposer un programme ${template} en choisissant 3 à 4 exercices adaptés dans la liste ci-dessous.

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

Respecte strictement le format JSON demandé et ne fournis aucun texte supplémentaire.
    `;

    const completion = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: 'Tu es un assistant qui renvoie uniquement du JSON valide.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    console.log('LLM Response:', response);

    try {
      const parsed = JSON.parse(response || '{}');

      // Basic runtime validation
      if (!parsed || typeof parsed !== 'object') throw new Error('Parsed response is not an object');
      if (parsed.template !== template) throw new Error('Template in response does not match expected template');
      if (!Array.isArray(parsed.sessions)) throw new Error('Missing sessions array in LLM response');

      // Validate sessions structure
      for (const session of parsed.sessions) {
        if (typeof session.name !== 'string') throw new Error('Each session must have a name');
        if (!Array.isArray(session.exercises)) throw new Error('Each session must include an exercises array');
        for (const ex of session.exercises) {
          if (typeof ex === 'number') continue;
          if (typeof ex === 'object' && typeof ex.id === 'number') continue;
          throw new Error('Invalid exercise entry in sessions (must be number or {id:number, ...})');
        }
      }

      return parsed as unknown;
    } catch (err) {
      console.error('Failed to parse/validate LLM response:', err);
      throw new Error('Invalid JSON returned by LLM or schema mismatch');
    }
  }

  templateCreation(frequency: number) {
    if (frequency < 3) return FULL_BODY;
    if (frequency === 3) return PUSH_PULL_LEGS;
    if (frequency === 4) return UPPER_LOWER;
    if (frequency === 5) return UPPER_LOWER_PUSH_PULL;
    if (frequency === 6) return PUSH_PULL_LEGS;
    return PUSH_PULL_LEGS_CARDIO;
  }
}
