import { WeekDay } from '@prisma/client';

/**
 * Service helper pour gérer la planification automatique des séances
 * basée sur les jours d'entraînement configurés (trainingDays)
 */
export class SessionSchedulingHelper {
  /**
   * Convertit WeekDay enum en numéro de jour JavaScript (0 = Dimanche, 1 = Lundi, ...)
   */
  private static weekDayToJsDay(weekDay: WeekDay): number {
    const mapping: Record<WeekDay, number> = {
      [WeekDay.SUNDAY]: 0,
      [WeekDay.MONDAY]: 1,
      [WeekDay.TUESDAY]: 2,
      [WeekDay.WEDNESDAY]: 3,
      [WeekDay.THURSDAY]: 4,
      [WeekDay.FRIDAY]: 5,
      [WeekDay.SATURDAY]: 6,
      [WeekDay.CUSTOM]: -1, // Non utilisé pour la planification auto
    };
    return mapping[weekDay];
  }

  /**
   * Calcule la prochaine occurrence d'un jour spécifique à partir d'une date donnée
   * @param fromDate Date de référence
   * @param targetWeekDay Jour cible
   * @param inclusive Si true, peut retourner fromDate si c'est déjà le bon jour
   */
  private static getNextOccurrenceOfDay(
    fromDate: Date,
    targetWeekDay: WeekDay,
    inclusive = false,
  ): Date {
    const targetJsDay = this.weekDayToJsDay(targetWeekDay);
    if (targetJsDay === -1) return fromDate; // CUSTOM = pas de planification

    const result = new Date(fromDate);
    result.setHours(0, 0, 0, 0); // Normaliser à minuit

    const currentDay = result.getDay();
    let daysToAdd = targetJsDay - currentDay;

    if (daysToAdd < 0 || (!inclusive && daysToAdd === 0)) {
      daysToAdd += 7;
    }

    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  /**
   * Détermine la date de début du programme
   * @param userStartDate Date choisie par l'utilisateur (optionnelle)
   * @param trainingDays Jours d'entraînement configurés
   * @returns Date de début ou null si trainingDays est vide
   */
  static determineStartDate(
    userStartDate: string | undefined,
    trainingDays: WeekDay[],
  ): Date | null {
    // Cas: pas de planification auto
    if (!trainingDays || trainingDays.length === 0) {
      return null;
    }

    // Si l'utilisateur a fourni une startDate, la vérifier
    if (userStartDate) {
      const requestedDate = new Date(userStartDate);
      requestedDate.setHours(0, 0, 0, 0);

      const requestedDay = requestedDate.getDay();
      // Convertir les trainingDays en jours JS
      const validDays = trainingDays.map((wd) => this.weekDayToJsDay(wd));

      // Si la date demandée tombe sur un jour valide, l'utiliser
      if (validDays.includes(requestedDay)) {
        return requestedDate;
      }

      // Sinon, trouver la prochaine occurrence d'un jour valide
      return this.getNextSessionDate(requestedDate, trainingDays);
    }

    // Pas de startDate fournie: utiliser aujourd'hui + prochain jour valide
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getNextSessionDate(today, trainingDays);
  }

  /**
   * Calcule la prochaine date de session à partir d'une date donnée
   * @param fromDate Date de référence
   * @param trainingDays Jours d'entraînement configurés
   * @returns Prochaine date ou null si pas de planification
   */
  static getNextSessionDate(
    fromDate: Date,
    trainingDays: WeekDay[],
  ): Date | null {
    if (!trainingDays || trainingDays.length === 0) {
      return null;
    }

    // Trouver la prochaine occurrence parmi tous les jours valides
    const nextDates = trainingDays
      .filter((wd) => wd !== WeekDay.CUSTOM)
      .map((wd) => this.getNextOccurrenceOfDay(fromDate, wd, false));

    if (nextDates.length === 0) {
      return null;
    }

    // Retourner la date la plus proche
    return nextDates.reduce((earliest, current) =>
      current < earliest ? current : earliest,
    );
  }

  /**
   * Génère toutes les dates de sessions pour un programme
   * @param startDate Date de début du programme
   * @param trainingDays Jours d'entraînement
   * @param numberOfSessions Nombre total de sessions à planifier
   * @returns Tableau de dates ou tableau vide si pas de planification auto
   */
  static generateSessionDates(
    startDate: Date | null,
    trainingDays: WeekDay[],
    numberOfSessions: number,
  ): (Date | null)[] {
    // Pas de planification auto
    if (!startDate || !trainingDays || trainingDays.length === 0) {
      return Array(numberOfSessions).fill(null);
    }

    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Première session = startDate
    dates.push(new Date(currentDate));

    // Générer les sessions suivantes
    for (let i = 1; i < numberOfSessions; i++) {
      const nextDate = this.getNextSessionDate(currentDate, trainingDays);
      if (!nextDate) break;

      dates.push(nextDate);
      currentDate = new Date(nextDate);
    }

    return dates;
  }
}
