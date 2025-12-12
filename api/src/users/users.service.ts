import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async findUserById(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserEntity> {
    const newUser = await this.prisma.user.create({
      data,
    });
    return newUser;
  }

  async updateUser(id: number, data: Partial<UserEntity>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }


  // ========================================
  // SYSTÈME D'XP ET DE NIVEAUX
  // ========================================

  /**
   * Configuration du système d'XP
   */
  private readonly XP_PER_LEVEL = 200; // XP nécessaire pour passer au niveau supérieur

  /**
   * Calcule le niveau en fonction de l'XP total
   * Formule : niveau = floor(xp / XP_PER_LEVEL) + 1
   */
  private calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / this.XP_PER_LEVEL) + 1;
  }

  /**
   * Calcule l'XP dans le niveau actuel
   * Exemple : Si user a 450 XP total
   * - Niveau = 3 (car 450 / 200 = 2.25, floor = 2, +1 = 3)
   * - XP dans niveau actuel = 450 % 200 = 50 XP
   * - XP pour prochain niveau = 200 - 50 = 150 XP
   */
  private calculateCurrentLevelXp(totalXp: number): {
    currentLevelXp: number;
    xpForNextLevel: number;
  } {
    const currentLevelXp = totalXp % this.XP_PER_LEVEL;
    const xpForNextLevel = this.XP_PER_LEVEL - currentLevelXp;
    return { currentLevelXp, xpForNextLevel };
  }

  /**
   * Récupère le niveau et l'XP d'un utilisateur avec informations détaillées
   */
  async getUserLevelAndXp(id: number): Promise<{
    level: number;
    totalXp: number;
    currentLevelXp: number;
    xpForNextLevel: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { level: true, xp: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { currentLevelXp, xpForNextLevel } = this.calculateCurrentLevelXp(user.xp);

    return {
      level: user.level,
      totalXp: user.xp,
      currentLevelXp,
      xpForNextLevel,
    };
  }

  /**
   * Ajoute de l'XP à un utilisateur et gère automatiquement les montées de niveau
   * @param id - ID de l'utilisateur
   * @param xpGained - Quantité d'XP à ajouter
   * @returns Informations sur le niveau et l'XP après l'ajout
   */
  async gainXp(id: number, xpGained: number): Promise<{
    level: number;
    totalXp: number;
    currentLevelXp: number;
    xpForNextLevel: number;
    leveledUp: boolean;
    previousLevel?: number;
  }> {
    // Validation
    if (xpGained < 0) {
      throw new BadRequestException('XP gained cannot be negative');
    }

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { level: true, xp: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculer le nouveau XP total
    const newTotalXp = user.xp + xpGained;
    const previousLevel = user.level;
    const newLevel = this.calculateLevel(newTotalXp);
    const leveledUp = newLevel > previousLevel;

    // Mettre à jour l'utilisateur
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        xp: newTotalXp,
        level: newLevel,
      },
      select: { level: true, xp: true },
    });

    // Calculer les informations du niveau actuel
    const { currentLevelXp, xpForNextLevel } = this.calculateCurrentLevelXp(updatedUser.xp);

    return {
      level: updatedUser.level,
      totalXp: updatedUser.xp,
      currentLevelXp,
      xpForNextLevel,
      leveledUp,
      previousLevel: leveledUp ? previousLevel : undefined,
    };
  }

  /**
   * Définir l'XP et le niveau d'un utilisateur manuellement (admin)
   */
  async setUserXp(id: number, xp: number): Promise<{
    level: number;
    totalXp: number;
    currentLevelXp: number;
    xpForNextLevel: number;
  }> {
    if (xp < 0) {
      throw new BadRequestException('XP cannot be negative');
    }

    const newLevel = this.calculateLevel(xp);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        xp,
        level: newLevel,
      },
      select: { level: true, xp: true },
    });

    const { currentLevelXp, xpForNextLevel } = this.calculateCurrentLevelXp(updatedUser.xp);

    return {
      level: updatedUser.level,
      totalXp: updatedUser.xp,
      currentLevelXp,
      xpForNextLevel,
    };
  }


}
