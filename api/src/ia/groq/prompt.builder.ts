import { Injectable } from '@nestjs/common';
import { FitnessProfile, Exercice } from '@prisma/client';

@Injectable()
export class PromptBuilder {
  buildProgramPrompt(fitnessProfile: FitnessProfile, template: string, exercices: Exercice[]): string {
    return `
Tu es un coach sportif expert.
L'utilisateur a un profil "${fitnessProfile.experienceLevel}" qui s'entraîne ${fitnessProfile.trainingFrequency} fois par semaine.
Tu dois lui proposer un programme "${template}" avec 4 à 5 exercices par séance.

Retourne STRICTEMENT du JSON valide (rien d'autre). Format attendu :
{
  "template": "${template}",
  "sessions": [
    { "name": "Upper", "exercises": [2, 3, 8, 14] },
    { "name": "Lower", "exercises": [1, 4, 6, 12] }
  ]
}

Tu peux aussi préciser les sets/reps ainsi :
{ "id": 2, "sets": 4, "reps": 8 }

Voici la liste des exercices disponibles :
${exercices.map(e => `ID: ${e.id} - ${e.name}`).join('\n')}

Ne renvoie que des IDs existants. Pas de texte, pas de phrase. JSON uniquement.
    `;
  }
}
