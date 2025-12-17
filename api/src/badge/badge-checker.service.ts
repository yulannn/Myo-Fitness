import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BadgeService, BadgeRequirement } from './badge.service';

/**
 * Service responsable de la vérification et du déclenchement des badges
 * Utilise un système de cache pour éviter les requêtes répétées
 */
@Injectable()
export class BadgeCheckerService {
  private readonly logger = new Logger(BadgeCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
  ) { }

  /**
   * Vérifie et débloque les badges liés aux sessions après une session complétée
   * ✅ OPTIMISÉ: Batch des requêtes pour éviter N+1
   */
  async checkSessionBadges(userId: number, sessionId: number) {
    const unlockedBadges: any[] = [];

    try {
      // Récupérer les statistiques nécessaires
      const stats = await this.getSessionStats(userId);

      // Liste des badges Training à vérifier
      const badgeCodes = [
        'FIRST_SESSION',
        'SESSIONS_10',
        'SESSIONS_50',
        'SESSIONS_100',
        'SESSIONS_500',
        'EARLY_BIRD',
        'NIGHT_OWL',
      ];

      // ✅ OPTIMISÉ: Récupérer tous les badges ET tous les badges déjà débloqués en parallèle
      const [badges, existingUserBadges] = await Promise.all([
        this.prisma.badge.findMany({
          where: {
            code: { in: badgeCodes },
          },
        }),
        this.prisma.userBadge.findMany({
          where: {
            userId,
            badge: { code: { in: badgeCodes } },
          },
          select: {
            badge: { select: { code: true } },
          },
        }),
      ]);

      // Créer un Set des codes de badges déjà débloqués pour O(1) lookup
      const unlockedBadgeCodes = new Set(
        existingUserBadges.map((ub) => ub.badge.code),
      );

      // Vérifier chaque badge
      for (const badge of badges) {
        // ✅ Vérifier si déjà débloqué sans requête
        if (unlockedBadgeCodes.has(badge.code)) {
          continue; // Déjà débloqué, passer au suivant
        }

        const shouldUnlock = await this.checkBadgeRequirementWithoutDBCheck(
          userId,
          badge.code,
          badge.requirement as any,
          stats,
        );

        if (shouldUnlock) {
          const unlocked = await this.badgeService.unlockBadge(
            userId,
            badge.id,
          );
          if (unlocked) {
            this.logger.log(
              `Badge ${badge.name} débloqué pour l'utilisateur ${userId}`,
            );
            unlockedBadges.push(unlocked);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification des badges session: ${error.message}`,
      );
    }

    return unlockedBadges;
  }

  /**
   * Vérifie les badges liés au volume après une session
   */
  async checkVolumeBadges(userId: number) {
    const unlockedBadges: any[] = [];

    try {
      const stats = await this.getVolumeStats(userId);

      const badgeCodes = ['VOLUME_10000', 'VOLUME_100000'];

      const badges = await this.prisma.badge.findMany({
        where: {
          code: { in: badgeCodes },
        },
      });

      for (const badge of badges) {
        const shouldUnlock = await this.checkBadgeRequirement(
          userId,
          badge.code,
          badge.requirement as any,
          stats,
        );

        if (shouldUnlock) {
          const unlocked = await this.badgeService.unlockBadge(
            userId,
            badge.id,
          );
          if (unlocked) {
            this.logger.log(
              `Badge ${badge.name} débloqué pour l'utilisateur ${userId}`,
            );
            unlockedBadges.push(unlocked);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification des badges volume: ${error.message}`,
      );
    }

    return unlockedBadges;
  }

  /**
   * Vérifie le badge "Semaine Parfaite"
   */
  async checkPerfectWeekBadge(userId: number) {
    try {
      const stats = await this.getWeekStats(userId);

      const badge = await this.prisma.badge.findUnique({
        where: { code: 'PERFECT_WEEK' },
      });

      if (!badge) return null;

      const shouldUnlock = await this.checkBadgeRequirement(
        userId,
        badge.code,
        badge.requirement as any,
        stats,
      );

      if (shouldUnlock) {
        const unlocked = await this.badgeService.unlockBadge(userId, badge.id);
        if (unlocked) {
          this.logger.log(
            `Badge ${badge.name} débloqué pour l'utilisateur ${userId}`,
          );
          return unlocked;
        }
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification du badge Perfect Week: ${error.message}`,
      );
    }

    return null;
  }

  /**
   * Vérifie si un badge doit être débloqué selon son requirement
   * ⚠️ DEPRECATED: Utilisez checkBadgeRequirementWithoutDBCheck quand les badges débloqués sont déjà récupérés
   */
  private async checkBadgeRequirement(
    userId: number,
    badgeCode: string,
    requirement: BadgeRequirement,
    stats: any,
  ): Promise<boolean> {
    // Vérifier si le badge est déjà débloqué
    const existing = await this.prisma.userBadge.findFirst({
      where: {
        userId,
        badge: { code: badgeCode },
      },
    });

    if (existing) return false;

    return this.checkBadgeRequirementWithoutDBCheck(
      userId,
      badgeCode,
      requirement,
      stats,
    );
  }

  /**
   * Vérifie si un badge doit être débloqué (sans vérification DB)
   * ✅ OPTIMISÉ: Utiliser quand les badges débloqués sont déjà vérifiés avant
   */
  private async checkBadgeRequirementWithoutDBCheck(
    userId: number,
    badgeCode: string,
    requirement: BadgeRequirement,
    stats: any,
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'count':
        return this.checkCountRequirement(
          userId,
          badgeCode,
          requirement,
          stats,
        );

      case 'time':
        return this.checkTimeRequirement(userId, badgeCode, requirement, stats);

      case 'custom':
        return this.checkCustomRequirement(
          userId,
          badgeCode,
          requirement,
          stats,
        );

      default:
        return false;
    }
  }

  /**
   * Vérifie un requirement de type "count"
   */
  private async checkCountRequirement(
    userId: number,
    badgeCode: string,
    requirement: BadgeRequirement,
    stats: any,
  ): Promise<boolean> {
    const field = requirement.field || 'sessions';
    const target = requirement.target || 0;
    const currentValue = stats[field] || 0;

    // Mettre à jour la progression
    await this.badgeService.setBadgeProgress(userId, badgeCode, currentValue);

    return currentValue >= target;
  }

  /**
   * Vérifie un requirement de type "time"
   */
  private async checkTimeRequirement(
    userId: number,
    badgeCode: string,
    requirement: BadgeRequirement,
    stats: any,
  ): Promise<boolean> {
    const condition = requirement.condition || 'before';
    const target = requirement.target || 8;

    if (condition === 'before') {
      const earlyCount = stats.earlyBirdCount || 0;
      await this.badgeService.setBadgeProgress(userId, badgeCode, earlyCount);
      return earlyCount >= 10;
    } else if (condition === 'after') {
      const nightCount = stats.nightOwlCount || 0;
      await this.badgeService.setBadgeProgress(userId, badgeCode, nightCount);
      return nightCount >= 10;
    }

    return false;
  }

  /**
   * Vérifie un requirement de type "custom"
   */
  private async checkCustomRequirement(
    userId: number,
    badgeCode: string,
    requirement: BadgeRequirement,
    stats: any,
  ): Promise<boolean> {
    // Pour les badges custom comme PERFECT_WEEK
    if (badgeCode === 'PERFECT_WEEK') {
      return stats.isPerfectWeek || false;
    }

    return false;
  }

  /**
   * Récupère les statistiques de sessions pour un utilisateur
   * ✅ OPTIMISÉ: Utilise des agrégations SQL au lieu de charger en mémoire
   */
  private async getSessionStats(userId: number) {
    // Compter toutes les sessions complétées
    const totalSessions = await this.prisma.trainingSession.count({
      where: {
        completed: true,
        trainingProgram: {
          fitnessProfile: { userId },
        },
      },
    });

    // ✅ OPTIMISÉ: Utiliser Prisma raw query pour compter efficacement
    // Compter les sessions tôt le matin (avant 8h) avec agrégation SQL
    const earlyBirdResult = await this.prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::int as count
      FROM "TrainingSession" ts
      INNER JOIN "TrainingProgram" tp ON ts."programId" = tp.id
      INNER JOIN "FitnessProfile" fp ON tp."fitnessProfileId" = fp.id
      WHERE fp."userId" = ${userId}
        AND ts.completed = true
        AND ts."performedAt" IS NOT NULL
        AND EXTRACT(HOUR FROM ts."performedAt") < 8
    `;

    // Compter les sessions tard le soir (après 22h) avec agrégation SQL
    const nightOwlResult = await this.prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::int as count
      FROM "TrainingSession" ts
      INNER JOIN "TrainingProgram" tp ON ts."programId" = tp.id
      INNER JOIN "FitnessProfile" fp ON tp."fitnessProfileId" = fp.id
      WHERE fp."userId" = ${userId}
        AND ts.completed = true
        AND ts."performedAt" IS NOT NULL
        AND EXTRACT(HOUR FROM ts."performedAt") >= 22
    `;

    return {
      sessions: totalSessions,
      earlyBirdCount: Number(earlyBirdResult[0]?.count || 0),
      nightOwlCount: Number(nightOwlResult[0]?.count || 0),
    };
  }

  /**
   * Récupère les statistiques de volume pour un utilisateur
   * ✅ OPTIMISÉ: Utilise SUM() SQL au lieu de reduce() JavaScript
   */
  private async getVolumeStats(userId: number) {
    // ✅ Utiliser aggregate pour calculer la somme côté base de données
    const result = await this.prisma.sessionSummary.aggregate({
      where: {
        session: {
          completed: true,
          trainingProgram: {
            fitnessProfile: { userId },
          },
        },
      },
      _sum: {
        totalVolume: true,
      },
    });

    return {
      totalVolume: result._sum.totalVolume || 0,
    };
  }

  /**
   * Récupère les stats de la semaine en cours
   */
  private async getWeekStats(userId: number) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
    endOfWeek.setHours(23, 59, 59, 999);

    // Récupérer le profil fitness pour les jours d'entraînement prévus
    const fitnessProfile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
      select: { trainingDays: true },
    });

    if (!fitnessProfile || fitnessProfile.trainingDays.length === 0) {
      return { isPerfectWeek: false };
    }

    const plannedDays = fitnessProfile.trainingDays.filter(
      (d) => d !== 'CUSTOM',
    ).length;

    // Compter les sessions complétées cette semaine
    const completedSessions = await this.prisma.trainingSession.count({
      where: {
        completed: true,
        trainingProgram: {
          fitnessProfile: { userId },
        },
        performedAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    const isPerfectWeek = completedSessions >= plannedDays && plannedDays > 0;

    return {
      isPerfectWeek,
      completedThisWeek: completedSessions,
      plannedDays,
    };
  }
}
