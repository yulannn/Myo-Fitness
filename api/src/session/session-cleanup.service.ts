import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';

/**
 * 🧹 Service de nettoyage automatique des sessions abandonnées
 * 
 * Détecte et annule les sessions IN_PROGRESS qui n'ont pas été mises à jour
 * depuis plus de 12 heures.
 * 
 * Configuration :
 * - Timeout: 12 heures (hardcodé)
 * - Cron: Toutes les 6 heures (00h, 06h, 12h, 18h)
 */
@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private readonly TIMEOUT_HOURS = 12; // Timeout en dur : 12 heures

  constructor(private readonly prisma: PrismaService) {
    this.logger.log(`🔧 SessionCleanupService initialisé avec timeout de ${this.TIMEOUT_HOURS}h`);
  }

  /**
   * 🕐 Cron Job : S'exécute toutes les 6 heures (00h, 06h, 12h, 18h)
   */
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'cleanup-abandoned-sessions',
    timeZone: 'Europe/Paris',
  })
  async handleCron() {
    this.logger.log('🚀 Démarrage du cleanup des sessions abandonnées...');

    try {
      const result = await this.cleanupAbandonedSessions();

      if (result.cleanedCount > 0) {
        this.logger.warn(
          `✅ ${result.cleanedCount} session(s) abandonnée(s) annulée(s) (timeout: ${this.TIMEOUT_HOURS}h)`
        );
      } else {
        this.logger.log('✅ Aucune session abandonnée détectée');
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors du cleanup des sessions', error.stack);
    }
  }

  /**
   * 🧹 Nettoie les sessions abandonnées
   * 
   * Critères :
   * - Status: IN_PROGRESS
   * - Dernière mise à jour: > SESSION_TIMEOUT_HOURS (défaut 12h)
   * 
   * Actions :
   * - Supprime SetPerformances
   * - Supprime ExerciceSessions
   * - Supprime SessionSummary
   * - Marque la session comme CANCELLED
   * 
   * @returns Nombre de sessions nettoyées et date limite utilisée
   */
  async cleanupAbandonedSessions(): Promise<{
    cleanedCount: number;
    cutoffDate: Date;
    sessionIds: number[];
  }> {
    // Calculer la date limite (maintenant - 12 heures)
    const cutoffDate = new Date(Date.now() - this.TIMEOUT_HOURS * 60 * 60 * 1000);

    this.logger.debug(
      `🔍 Recherche des sessions IN_PROGRESS non modifiées depuis ${cutoffDate.toISOString()}`
    );

    // 1️⃣ Trouver les sessions abandonnées
    const abandonedSessions = await this.prisma.trainingSession.findMany({
      where: {
        status: 'IN_PROGRESS',
        updatedAt: { lt: cutoffDate },
      },
      select: {
        id: true,
        sessionName: true,
        updatedAt: true,
        trainingProgram: {
          select: {
            name: true,
            fitnessProfile: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (abandonedSessions.length === 0) {
      return {
        cleanedCount: 0,
        cutoffDate,
        sessionIds: [],
      };
    }

    this.logger.log(
      `🧹 ${abandonedSessions.length} session(s) abandonnée(s) détectée(s)`
    );

    const cleanedSessionIds: number[] = [];

    // 2️⃣ Pour chaque session, appliquer la logique de CANCELLED
    for (const session of abandonedSessions) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Supprimer les SetPerformances
          const deletedPerformances = await tx.setPerformance.deleteMany({
            where: {
              exerciceSession: {
                sessionId: session.id,
              },
            },
          });

          // Supprimer les ExerciceSessions
          const deletedExercices = await tx.exerciceSession.deleteMany({
            where: { sessionId: session.id },
          });

          // Supprimer le SessionSummary s'il existe
          await tx.sessionSummary.deleteMany({
            where: { sessionId: session.id },
          });

          // Marquer la session comme CANCELLED
          await tx.trainingSession.update({
            where: { id: session.id },
            data: {
              status: 'CANCELLED',
              completed: false,
              performedAt: null,
            },
          });

          this.logger.debug(
            `  ✓ Session #${session.id} "${session.sessionName || 'Sans nom'}" annulée ` +
            `(userId: ${session.trainingProgram.fitnessProfile.userId}, ` +
            `${deletedPerformances.count} performances, ${deletedExercices.count} exercices)`
          );
        });

        cleanedSessionIds.push(session.id);
      } catch (error) {
        this.logger.error(
          `  ✗ Erreur lors de l'annulation de la session #${session.id}`,
          error.stack
        );
        // Continue avec les autres sessions même si une échoue
      }
    }

    return {
      cleanedCount: cleanedSessionIds.length,
      cutoffDate,
      sessionIds: cleanedSessionIds,
    };
  }

  /**
   * 🔧 Méthode manuelle pour forcer le cleanup (utile pour tests)
   * 
   * @returns Résultat du cleanup
   */
  async forceCleanup() {
    this.logger.log('🔧 Cleanup manuel déclenché');
    return this.cleanupAbandonedSessions();
  }
}
