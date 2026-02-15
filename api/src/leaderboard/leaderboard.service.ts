import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LeaderboardType } from './dto/leaderboard-type.enum';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🎯 Récupère le leaderboard pour un type donné, limité aux amis de l'utilisateur
   * Performance optimisée : utilise les stats précalculées
   */
  async getFriendsLeaderboard(
    userId: number,
    type: LeaderboardType,
  ): Promise<LeaderboardResponseDto> {
    // 1. Récupérer tous les amis de l'utilisateur (bidirectionnel)
    const friendIds = await this.getUserFriendIds(userId);

    // 2. Inclure l'utilisateur lui-même
    const participantIds = [...friendIds, userId];

    // 3. Récupérer les stats selon le type de leaderboard
    const entries = await this.getLeaderboardEntries(
      participantIds,
      type,
      userId,
    );

    // 4. Trouver le rang de l'utilisateur connecté
    const currentUserEntry = entries.find((e) => e.userId === userId);
    const currentUserRank = currentUserEntry?.rank;

    return {
      type,
      entries,
      currentUserRank,
      totalParticipants: participantIds.length,
    };
  }

  /**
   * 🔍 Récupère les IDs des amis d'un utilisateur (relation bidirectionnelle)
   */
  private async getUserFriendIds(userId: number): Promise<number[]> {
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    // Extraire les IDs (exclure l'utilisateur connecté)
    const friendIds = friends
      .map((f) => (f.userId === userId ? f.friendId : f.userId))
      .filter((id) => id !== userId);

    return [...new Set(friendIds)]; // Dédupliquer
  }

  /**
   * 📊 Génère les entrées du leaderboard selon le type
   */
  private async getLeaderboardEntries(
    userIds: number[],
    type: LeaderboardType,
    currentUserId: number,
  ): Promise<LeaderboardEntryDto[]> {
    let orderBy: any;
    let selectField: string;

    // Déterminer le champ et l'ordre selon le type
    switch (type) {
      case LeaderboardType.TOTAL_SESSIONS:
        orderBy = { LeaderboardStats: { totalSessionsCompleted: 'desc' } };
        selectField = 'totalSessionsCompleted';
        break;
      case LeaderboardType.CURRENT_STREAK:
        orderBy = { LeaderboardStats: { currentStreak: 'desc' } };
        selectField = 'currentStreak';
        break;
      case LeaderboardType.LEVEL:
        orderBy = { level: 'desc' };
        selectField = 'level';
        break;
      case LeaderboardType.TOTAL_VOLUME:
        orderBy = { LeaderboardStats: { totalVolume: 'desc' } };
        selectField = 'totalVolume';
        break;
      default:
        orderBy = { LeaderboardStats: { totalSessionsCompleted: 'desc' } };
        selectField = 'totalSessionsCompleted';
    }

    // Récupérer les utilisateurs avec leurs stats
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        profilePictureUrl: true,
        level: true,
        LeaderboardStats: {
          select: {
            totalSessionsCompleted: true,
            currentStreak: true,
            totalVolume: true,
          },
        },
      },
      orderBy,
    });

    // Construire les entrées avec rang
    const entries: LeaderboardEntryDto[] = users.map((user, index) => {
      let value: number;

      if (type === LeaderboardType.LEVEL) {
        value = user.level;
      } else {
        const stats = user.LeaderboardStats;
        if (!stats) {
          value = 0;
        } else {
          switch (selectField) {
            case 'totalSessionsCompleted':
              value = stats.totalSessionsCompleted;
              break;
            case 'currentStreak':
              value = stats.currentStreak;
              break;
            case 'totalVolume':
              value = stats.totalVolume;
              break;
            default:
              value = 0;
          }
        }
      }

      return {
        userId: user.id,
        userName: user.name,
        profilePictureUrl: user.profilePictureUrl,
        rank: index + 1,
        value,
        level: user.level,
        isCurrentUser: user.id === currentUserId,
      };
    });

    return entries;
  }

  /**
   * 🔄 Met à jour les statistiques d'un utilisateur
   * Appelé après chaque action pertinente (session complétée, etc.)
   */
  async updateUserStats(userId: number): Promise<void> {
    try {
      // Calculer les stats
      const stats = await this.calculateUserStats(userId);

      // Upsert dans la table LeaderboardStats
      await this.prisma.leaderboardStats.upsert({
        where: { userId },
        create: {
          userId,
          ...stats,
        },
        update: stats,
      });

      this.logger.log(`Leaderboard stats updated for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update leaderboard stats for user ${userId}`,
        error,
      );
    }
  }

  /**
   * 📐 Calcule les statistiques d'un utilisateur
   */
  private async calculateUserStats(userId: number) {
    // 1. Nombre total de sessions complétées
    const totalSessionsCompleted = await this.prisma.trainingSession.count({
      where: {
        trainingProgram: { fitnessProfile: { userId } },
        completed: true,
      },
    });

    // 2. Streak actuel et plus long
    const streakData = await this.calculateStreak(userId);

    // 3. Volume total
    const volumeData = await this.prisma.setPerformance.aggregate({
      where: {
        exerciceSession: {
          trainingSession: {
            trainingProgram: { fitnessProfile: { userId } },
            completed: true,
          },
        },
        weight: { not: null },
        reps_effectuees: { not: null },
      },
      _sum: {
        weight: true,
      },
    });

    // Calculer volume réel (poids × reps)
    const performances = await this.prisma.setPerformance.findMany({
      where: {
        exerciceSession: {
          trainingSession: {
            trainingProgram: { fitnessProfile: { userId } },
            completed: true,
          },
        },
        weight: { not: null },
        reps_effectuees: { not: null },
      },
      select: {
        weight: true,
        reps_effectuees: true,
      },
    });

    const totalVolume = performances.reduce((sum, perf) => {
      return sum + (perf.weight || 0) * (perf.reps_effectuees || 0);
    }, 0);

    // 4. Durée moyenne des sessions
    const sessionsWithDuration = await this.prisma.trainingSession.findMany({
      where: {
        trainingProgram: { fitnessProfile: { userId } },
        completed: true,
        duration: { not: null },
      },
      select: {
        duration: true,
      },
    });

    const averageSessionDuration =
      sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) /
          sessionsWithDuration.length
        : null;

    // 5. Nombre de PRs (activités PERSONAL_RECORD)
    const personalRecordsCount = await this.prisma.activity.count({
      where: {
        userId,
        type: 'PERSONAL_RECORD',
      },
    });

    // 6. Date de la dernière session
    const lastSession = await this.prisma.trainingSession.findFirst({
      where: {
        trainingProgram: { fitnessProfile: { userId } },
        completed: true,
      },
      orderBy: {
        performedAt: 'desc',
      },
      select: {
        performedAt: true,
      },
    });

    return {
      totalSessionsCompleted,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalVolume,
      totalWorkouts: totalSessionsCompleted,
      averageSessionDuration,
      personalRecordsCount,
      lastWorkoutDate: lastSession?.performedAt || null,
    };
  }

  /**
   * 📅 Calcule le streak actuel et le plus long
   */
  private async calculateStreak(userId: number): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        trainingProgram: { fitnessProfile: { userId } },
        completed: true,
        performedAt: { not: null },
      },
      orderBy: {
        performedAt: 'desc',
      },
      select: {
        performedAt: true,
      },
    });

    if (sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = sessions[0].performedAt;

    // Vérifier si la dernière session est aujourd'hui ou hier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastDate) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const lastSessionDate = new Date(lastDate);
    lastSessionDate.setHours(0, 0, 0, 0);

    if (lastSessionDate >= yesterday) {
      currentStreak = 1;
    }

    // Calculer les streaks
    for (let i = 1; i < sessions.length; i++) {
      const currentPerformedAt = sessions[i].performedAt;
      if (!currentPerformedAt || !lastDate) {
        continue;
      }

      const currentDate = new Date(currentPerformedAt);
      currentDate.setHours(0, 0, 0, 0);
      const prevDate = new Date(lastDate);
      prevDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        tempStreak++;
        if (lastSessionDate >= yesterday) {
          currentStreak++;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
        if (lastSessionDate >= yesterday) {
          currentStreak = 1;
        }
      }

      lastDate = currentPerformedAt;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * ⏰ Cron job : Mise à jour des stats chaque nuit à 3h
   * Recalcule les stats de tous les utilisateurs pour maintenir la cohérence
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateAllUsersStats(): Promise<void> {
    this.logger.log('Starting daily leaderboard stats update...');

    try {
      const users = await this.prisma.user.findMany({
        select: { id: true },
      });

      let updated = 0;
      for (const user of users) {
        await this.updateUserStats(user.id);
        updated++;
      }

      this.logger.log(
        `Daily leaderboard stats update completed: ${updated} users updated`,
      );
    } catch (error) {
      this.logger.error('Failed to update all leaderboard stats', error);
    }
  }
}
