import { Injectable } from '@nestjs/common';
import { FitnessProfile, Exercice, MuscleGroup } from '@prisma/client';

@Injectable()
export class PromptBuilder {
  buildProgramPrompt(
    fitnessProfile: FitnessProfile,
    template: string,
    exercices: Exercice[],
    priorityMuscles?: MuscleGroup[],
    sessionStructure?: string[],
  ): string {
    // Construction des informations de personnalisation
    const weightGoalInfo = fitnessProfile.targetWeight
      ? `\n🎯 Objectif de poids: ${fitnessProfile.targetWeight}kg (actuellement ${fitnessProfile.weight}kg, delta: ${(fitnessProfile.targetWeight - fitnessProfile.weight).toFixed(1)}kg).`
      : '';

    const musclePrioritiesInfo =
      priorityMuscles && priorityMuscles.length > 0
        ? `\n💪 Priorités musculaires: ${priorityMuscles.map((m) => m.name).join(', ')}. AUGMENTER le volume pour ces groupes musculaires.`
        : '';

    const environmentInfo = fitnessProfile.trainingEnvironment
      ? `\n🏋️ Environnement: ${fitnessProfile.trainingEnvironment} - ${fitnessProfile.trainingEnvironment === 'HOME' ? 'Privilégier exercices au poids du corps et équipement minimal' : 'Accès à tous les équipements'}.`
      : '';

    // 🎯 Structure des sessions explicite
    const sessionNames =
      sessionStructure && sessionStructure.length > 0
        ? sessionStructure
        : this.getDefaultSessionNames(
            template,
            fitnessProfile.trainingFrequency,
          );

    const sessionStructureInfo = `\n📋 Sessions à générer (dans cet ordre EXACT): ${sessionNames.join(', ')}`;

    // Générer l'exemple JSON avec les vrais noms de sessions
    const exampleSessions = sessionNames
      .slice(0, 2)
      .map(
        (name) =>
          `    { "name": "${name}", "exercises": [{ "id": 2, "sets": 4, "reps": 8 }, { "id": 3, "sets": 3, "reps": 10 }] }`,
      )
      .join(',\n');

    return `
Tu es un coach sportif expert.
L'utilisateur a un profil "${fitnessProfile.experienceLevel}" qui s'entraîne ${fitnessProfile.trainingFrequency} fois par semaine.
Objectifs: ${fitnessProfile.goals.join(', ')}.${weightGoalInfo}${musclePrioritiesInfo}${environmentInfo}${sessionStructureInfo}

⚠️ IMPORTANT: Tu DOIS créer EXACTEMENT ${sessionNames.length} sessions avec ces noms EXACTS dans cet ordre:
${sessionNames.map((name, i) => `${i + 1}. "${name}"`).join('\n')}

Chaque session doit contenir 4 à 5 exercices adaptés au type de session:
- "Push" = Pectoraux, épaules, triceps
- "Pull" = Dos, biceps
- "Legs" = Quadriceps, ischio-jambiers, mollets, fessiers
- "Upper" = Tout le haut du corps (pectoraux, dos, épaules, bras)
- "Lower" = Tout le bas du corps (jambes complètes)
- "Full Body" = Corps entier

Retourne STRICTEMENT du JSON valide (rien d'autre). Format attendu :
{
  "template": "${template}",
  "sessions": [
${exampleSessions}
  ]
}

Voici la liste des exercices disponibles :
${exercices.map((e) => `ID: ${e.id} - ${e.name}`).join('\n')}

Ne renvoie que des IDs existants. Pas de texte, pas de phrase. JSON uniquement.
    `;
  }

  /**
   * Retourne les noms de sessions par défaut selon le template (fallback)
   */
  private getDefaultSessionNames(
    template: string,
    frequency: number,
  ): string[] {
    switch (template) {
      case 'FULL_BODY':
        return Array(frequency).fill('Full Body');
      case 'UPPER_LOWER':
        return ['Upper', 'Lower', 'Upper', 'Lower'].slice(0, frequency);
      case 'PUSH_PULL_LEGS':
        if (frequency <= 3) return ['Push', 'Pull', 'Legs'];
        if (frequency === 6)
          return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
        return ['Push', 'Pull', 'Legs'];
      default:
        return ['Session 1', 'Session 2', 'Session 3'].slice(0, frequency);
    }
  }
}
