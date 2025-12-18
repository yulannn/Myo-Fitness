import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MuscleHeat } from '@prisma/client';

@Injectable()
export class BodyAtlasService {
    private readonly logger = new Logger(BodyAtlasService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * 🎯 Récupère les données complètes du Body Atlas d'un utilisateur
     */
    async getBodyAtlasData(userId: number) {
        this.logger.log(`Fetching Body Atlas data for user ${userId}`);

        // Récupérer toutes les stats musculaires
        const muscleStats = await this.prisma.userMuscleStats.findMany({
            where: { userId },
            include: {
                muscleGroup: true,
            },
            orderBy: {
                level: 'desc',
            },
        });

        // ✅ Calculer la chaleur dynamiquement pour chaque muscle
        const enrichedStats = muscleStats.map(stat => ({
            ...stat,
            heat: this.calculateHeat(stat.lastTrainedAt),
        }));

        // Calculer les scores avec les stats enrichies
        const scores = this.calculateScores(enrichedStats);

        return {
            muscleStats: enrichedStats,
            overallScore: scores.overall,
            balanceScore: scores.balance,
            dominantMuscles: scores.dominant,
            weakMuscles: scores.weak,
        };
    }

    /**
     * 📊 Calcule les scores et identifie les muscles dominants/faibles
     */
    private calculateScores(muscleStats: any[]) {
        if (muscleStats.length === 0) {
            return {
                overall: 0,
                balance: 0,
                dominant: [],
                weak: [],
            };
        }

        // Score global = moyenne des niveaux
        const totalLevel = muscleStats.reduce((sum, stat) => sum + stat.level, 0);
        const overall = Math.round((totalLevel / (muscleStats.length * 5)) * 100);

        // Score d'équilibre = écart-type inversé
        const avgLevel = totalLevel / muscleStats.length;
        const variance =
            muscleStats.reduce((sum, stat) => sum + Math.pow(stat.level - avgLevel, 2), 0) /
            muscleStats.length;
        const stdDev = Math.sqrt(variance);
        const balance = Math.max(0, Math.round(100 - stdDev * 20));

        // Muscles dominants (niveau > moyenne)
        const dominant = muscleStats
            .filter((stat) => stat.level > avgLevel)
            .slice(0, 3)
            .map((stat) => stat.muscleGroup.name);

        // Muscles faibles (niveau < moyenne && chaleur COLD/FROZEN)
        const weak = muscleStats
            .filter((stat) => stat.level < avgLevel || stat.heat === 'FROZEN' || stat.heat === 'COLD')
            .slice(0, 3)
            .map((stat) => stat.muscleGroup.name);

        return {
            overall,
            balance,
            dominant,
            weak,
        };
    }

    /**
     * 🔄 Met à jour les stats musculaires après une session
     * ✅ Optimisé : Utilise une transaction batch pour éviter N+1 queries
     */
    async updateMuscleStats(userId: number, sessionId: number) {
        this.logger.log(`Updating muscle stats for user ${userId} from session ${sessionId}`);

        // 1️⃣ Récupérer la session avec les exercices et performances
        const session = await this.prisma.trainingSession.findUnique({
            where: { id: sessionId },
            include: {
                exercices: {
                    include: {
                        exercice: {
                            include: {
                                groupes: {
                                    include: {
                                        groupe: true,
                                    },
                                },
                            },
                        },
                        performances: true,
                    },
                },
            },
        });

        if (!session) {
            throw new Error('Session not found');
        }

        // 2️⃣ Grouper les performances par muscle (calcul en mémoire)
        const muscleVolumes = new Map<number, { volume: number; sets: number }>();

        for (const exerciceSession of session.exercices) {
            const muscleGroups = exerciceSession.exercice.groupes;

            for (const performance of exerciceSession.performances) {
                const volume = (performance.reps_effectuees || 0) * (performance.weight || 0);

                for (const muscleGroupRelation of muscleGroups) {
                    const muscleId = muscleGroupRelation.groupeId;
                    const current = muscleVolumes.get(muscleId) || { volume: 0, sets: 0 };

                    muscleVolumes.set(muscleId, {
                        volume: current.volume + volume,
                        sets: current.sets + 1,
                    });
                }
            }
        }

        // 3️⃣ Récupérer TOUTES les stats existantes de l'utilisateur en UNE SEULE query
        const existingStats = await this.prisma.userMuscleStats.findMany({
            where: { userId },
            select: {
                id: true,
                muscleGroupId: true,
                totalVolume: true,
            },
        });

        // Créer une Map pour lookup O(1)
        const statsMap = new Map(
            existingStats.map(stat => [stat.muscleGroupId, stat])
        );

        // 4️⃣ Préparer tous les upserts
        const upsertOperations = Array.from(muscleVolumes.entries()).map(([muscleId, data]) => {
            const existingStat = statsMap.get(muscleId);
            const newVolume = (existingStat?.totalVolume || 0) + data.volume;
            const newLevel = this.calculateLevel(newVolume);

            return this.prisma.userMuscleStats.upsert({
                where: {
                    userId_muscleGroupId: {
                        userId,
                        muscleGroupId: muscleId,
                    },
                },
                create: {
                    userId,
                    muscleGroupId: muscleId,
                    totalVolume: newVolume,
                    level: newLevel,
                    lastTrainedAt: new Date(),
                },
                update: {
                    totalVolume: newVolume,
                    level: newLevel,
                    lastTrainedAt: new Date(),
                },
            });
        });

        // 5️⃣ Exécuter TOUS les upserts dans UNE SEULE transaction
        await this.prisma.$transaction(upsertOperations);

        this.logger.log(`✅ Muscle stats updated successfully (${upsertOperations.length} muscles)`);
    }

    /**
     * 📈 Calcule le niveau d'un muscle en fonction du volume total
     */
    private calculateLevel(totalVolume: number): number {
        // Paliers de volume pour chaque niveau (ajustables)
        const thresholds = [0, 10000, 30000, 60000, 100000, 150000];

        for (let level = 5; level >= 0; level--) {
            if (totalVolume >= thresholds[level]) {
                return level;
            }
        }

        return 0;
    }

    /**
     * 🌡️ Calcule la "chaleur" d'un muscle (HOT, WARM, COLD, FROZEN)
     * ✅ Calculé dynamiquement basé sur lastTrainedAt
     */
    private calculateHeat(lastTrainedAt: Date | null): MuscleHeat {
        if (!lastTrainedAt) return 'FROZEN';

        const now = new Date();
        const hoursSince = (now.getTime() - lastTrainedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSince <= 72) return 'HOT';      // 0-3 jours
        if (hoursSince <= 120) return 'WARM';    // 3-5 jours
        if (hoursSince <= 168) return 'COLD';    // 5-7 jours
        return 'FROZEN';                          // 7+ jours
    }

    /**
     * 🤝 Compare deux Body Atlas
     */
    async compareAtlas(userId1: number, userId2: number) {
        const [atlas1, atlas2] = await Promise.all([
            this.getBodyAtlasData(userId1),
            this.getBodyAtlasData(userId2),
        ]);

        // Comparer muscle par muscle
        const comparison = {
            user1: {
                score: atlas1.overallScore,
                balance: atlas1.balanceScore,
                dominant: atlas1.dominantMuscles,
            },
            user2: {
                score: atlas2.overallScore,
                balance: atlas2.balanceScore,
                dominant: atlas2.dominantMuscles,
            },
            winner: atlas1.overallScore > atlas2.overallScore ? userId1 : userId2,
            muscleComparison: this.compareMuscles(atlas1.muscleStats, atlas2.muscleStats),
        };

        return comparison;
    }

    private compareMuscles(stats1: any[], stats2: any[]) {
        const map2 = new Map(stats2.map((s) => [s.muscleGroupId, s]));

        return stats1.map((stat1) => {
            const stat2 = map2.get(stat1.muscleGroupId);

            return {
                muscleName: stat1.muscleGroup.name,
                user1Level: stat1.level,
                user2Level: stat2?.level || 0,
                advantage: stat1.level > (stat2?.level || 0) ? 'user1' : 'user2',
            };
        });
    }
}
