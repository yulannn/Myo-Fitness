import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BadgeCategory, BadgeTier } from '@prisma/client';

export interface BadgeRequirement {
  type: 'count' | 'streak' | 'volume' | 'time' | 'date' | 'custom';
  target?: number;
  field?: string;
  condition?: string;
  metadata?: any;
}

@Injectable()
export class BadgeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère tous les badges du système
   */
  async getAllBadges(category?: BadgeCategory, tier?: BadgeTier) {
    return this.prisma.badge.findMany({
      where: {
        ...(category && { category }),
        ...(tier && { tier }),
      },
      orderBy: [{ category: 'asc' }, { tier: 'asc' }, { id: 'asc' }],
    });
  }

  /**
   * Récupère un badge par son code
   */
  async getBadgeByCode(code: string) {
    return this.prisma.badge.findUnique({
      where: { code },
    });
  }

  /**
   * Récupère tous les badges débloqués par un utilisateur
   */
  async getUserBadges(userId: number) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /**
   * Récupère les badges épinglés d'un utilisateur
   */
  async getPinnedBadges(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinnedBadges: true },
    });

    if (!user || user.pinnedBadges.length === 0) {
      return [];
    }

    return this.prisma.badge.findMany({
      where: {
        id: { in: user.pinnedBadges },
      },
    });
  }

  /**
   * Épingle des badges sur le profil utilisateur (max 3)
   */
  async pinBadges(userId: number, badgeIds: number[]) {
    // Limiter à 3 badges épinglés
    const pinnedIds = badgeIds.slice(0, 3);

    // Vérifier que l'utilisateur possède bien ces badges
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        badgeId: { in: pinnedIds },
      },
    });

    const ownedBadgeIds = userBadges.map((ub) => ub.badgeId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { pinnedBadges: ownedBadgeIds },
      select: {
        id: true,
        pinnedBadges: true,
      },
    });
  }

  /**
   * Récupère la progression d'un utilisateur vers les badges
   */
  async getBadgeProgress(userId: number, badgeCode?: string) {
    return this.prisma.badgeProgress.findMany({
      where: {
        userId,
        ...(badgeCode && { badgeCode }),
      },
    });
  }

  /**
   * Met à jour la progression vers un badge
   */
  async updateBadgeProgress(
    userId: number,
    badgeCode: string,
    increment: number = 1,
  ) {
    return this.prisma.badgeProgress.upsert({
      where: {
        userId_badgeCode: { userId, badgeCode },
      },
      create: {
        userId,
        badgeCode,
        currentValue: increment,
      },
      update: {
        currentValue: { increment },
      },
    });
  }

  /**
   * Définit directement la valeur de progression
   */
  async setBadgeProgress(userId: number, badgeCode: string, value: number) {
    return this.prisma.badgeProgress.upsert({
      where: {
        userId_badgeCode: { userId, badgeCode },
      },
      create: {
        userId,
        badgeCode,
        currentValue: value,
      },
      update: {
        currentValue: value,
      },
    });
  }

  /**
   * Débloque un badge pour un utilisateur
   */
  async unlockBadge(userId: number, badgeId: number) {
    // Vérifier si le badge n'est pas déjà débloqué
    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: { userId, badgeId },
      },
    });

    if (existing) {
      return null; // Badge déjà débloqué
    }

    // Créer le badge utilisateur
    const userBadge = await this.prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: {
        badge: true,
      },
    });

    // Donner l'XP bonus
    const badge = userBadge.badge;
    if (badge.xpReward > 0) {
      await this.addXpFromBadge(userId, badge.xpReward);
    }

    return userBadge;
  }

  /**
   * Ajoute de l'XP provenant d'un badge
   */
  private async addXpFromBadge(userId: number, xpAmount: number) {
    const XP_PER_LEVEL = 200;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) return;

    const newTotalXp = user.xp + xpAmount;
    const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
      },
    });
  }

  /**
   * Récupère les statistiques globales de badges d'un utilisateur
   */
  async getUserBadgeStats(userId: number) {
    const [totalBadges, unlockedBadges, badgesByTier] = await Promise.all([
      this.prisma.badge.count(),
      this.prisma.userBadge.count({ where: { userId } }),
      this.prisma.userBadge.groupBy({
        by: ['badgeId'],
        where: { userId },
        _count: true,
      }),
    ]);

    // Compter par tier
    const userBadgesWithInfo = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { tier: true } } },
    });

    const tierCounts = {
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      PLATINUM: 0,
      LEGENDARY: 0,
    };

    userBadgesWithInfo.forEach((ub) => {
      tierCounts[ub.badge.tier]++;
    });

    return {
      total: totalBadges,
      unlocked: unlockedBadges,
      percentage: Math.round((unlockedBadges / totalBadges) * 100),
      byTier: tierCounts,
    };
  }

  /**
   * Récupère les badges disponibles avec la progression
   */
  async getBadgesWithProgress(userId: number, category?: BadgeCategory) {
    const badges = await this.getAllBadges(category);
    const userBadges = await this.getUserBadges(userId);
    const progress = await this.getBadgeProgress(userId);

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));
    const progressMap = new Map(progress.map((p) => [p.badgeCode, p]));

    return badges.map((badge) => {
      const userBadge = userBadgeMap.get(badge.id);
      const badgeProgress = progressMap.get(badge.code);

      return {
        ...badge,
        unlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt,
        currentProgress: badgeProgress?.currentValue || 0,
        requirement: badge.requirement as unknown as BadgeRequirement,
      };
    });
  }
}
