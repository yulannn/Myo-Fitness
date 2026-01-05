import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MuscleHeat, MuscleCategory } from '@prisma/client';

/**
 * 💪 Coefficients biomécaniques pour exercices poids du corps
 * Représente la proportion du poids du corps réellement soulevée
 * Source : Biomechanical Analysis of Common Bodyweight Exercises
 */
const BODYWEIGHT_COEFFICIENTS: Record<string, number> = {
    // === POITRINE & TRICEPS ===
    'Pompes': 0.65,                     // ~65% du poids (position horizontale)
    'Pompes inclinées': 0.50,           // Pieds surélevés = moins de charge
    'Pompes déclinées': 0.75,           // Mains surélevées = plus de charge
    'Pompes diamant': 0.65,
    'Pompes sur les genoux': 0.45,      // Moins de charge
    'Pompes archer': 0.70,
    'Dips sur chaise': 0.60,
    'Dips aux barres parallèles': 0.80, // Presque tout le poids

    // === DOS & BICEPS ===
    'Tractions': 1.0,                   // 100% du poids du corps
    'Tractions assistées': 0.70,        // Assistance réduit la charge
    'Tractions lestées': 1.0,           // + le lest sera ajouté
    'Muscle-ups': 1.0,

    // === JAMBES ===
    'Squats': 0.55,                     // ~55% (pas tout le poids)
    'Squats sautés': 0.60,
    'Squats bulgares': 0.50,            // Une jambe = ~50% par jambe
    'Pistol Squats': 1.0,               // Une jambe = 100% sur une jambe
    'Fentes': 0.50,
    'Wall Sits': 0.55,
    'Calf Raises': 1.0,                 // Mollets supportent tout
    'Glute Bridges': 0.60,
    'Single Leg Glute Bridges': 1.0,

    // === CORE ===
    'Planche': 0.70,                    // Position statique
    'Planche latérale': 0.70,
    'Mountain Climbers': 0.60,
    'Hollow Hold': 0.70,
    'V-ups': 0.50,
    'Russian Twists': 0.40,
    'L-sit': 0.80,
    'Burpees': 0.65,

    // === ÉPAULES ===
    'Handstand Push-ups': 0.95,         // Presque tout le poids en vertical
    'Pompes piquées': 0.75,
};

@Injectable()
export class BodyAtlasService {
    private readonly logger = new Logger(BodyAtlasService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Récupère les données complètes du Body Atlas d'un utilisateur
     */
    async getBodyAtlasData(userId: number) {
        this.logger.log(`Fetching Body Atlas data for user ${userId}`);

        // Récupérer TOUS les groupes musculaires de la DB
        const allMuscleGroups = await this.prisma.muscleGroup.findMany({
            orderBy: {
                category: 'asc',
            },
        });

        // 2 Récupérer les stats existantes de l'utilisateur
        const userStats = await this.prisma.userMuscleStats.findMany({
            where: { userId },
            include: {
                muscleGroup: true,
            },
        });

        // 3 Créer une map des stats existantes pour lookup rapide O(1)
        const statsMap = new Map(userStats.map(stat => [stat.muscleGroupId, stat]));

        // 4 Construire la liste complète : merger tous les muscles avec les stats utilisateur
        const allMuscleStats = allMuscleGroups.map(muscle => {
            const existingStat = statsMap.get(muscle.id);

            if (existingStat) {
                // Muscle déjà travaillé : retourner les stats avec chaleur calculée
                return {
                    ...existingStat,
                    heat: this.calculateHeat(existingStat.lastTrainedAt, existingStat.totalVolume),
                };
            } else {
                // Muscle jamais travaillé : créer une entrée vide
                return {
                    id: 0, // ID fictif (non persisté en BDD)
                    userId,
                    muscleGroupId: muscle.id,
                    muscleGroup: muscle,
                    totalVolume: 0,
                    level: 0,
                    lastTrainedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    heat: null,
                };
            }
        });

        // 5️ Trier intelligemment : muscles travaillés d'abord, puis par niveau, puis par catégorie
        const sortedStats = allMuscleStats.sort((a, b) => {
            // Priorité 1 : Muscles travaillés en premier
            if (a.totalVolume > 0 && b.totalVolume === 0) return -1;
            if (a.totalVolume === 0 && b.totalVolume > 0) return 1;

            // Priorité 2 : Par niveau (décroissant) pour les muscles travaillés
            if (a.totalVolume > 0 && b.totalVolume > 0 && a.level !== b.level) {
                return b.level - a.level;
            }

            // Priorité 3 : Par catégorie
            return a.muscleGroup.category.localeCompare(b.muscleGroup.category);
        });

        // 6 Calculer les scores uniquement avec les muscles travaillés
        const workedMuscles = allMuscleStats.filter(s => s.totalVolume > 0);
        const scores = this.calculateScores(workedMuscles);

        return {
            muscleStats: sortedStats,
            overallScore: scores.overall,
            balanceScore: scores.balance,
            dominantMuscles: scores.dominant,
            weakMuscles: scores.weak,
        };
    }

    /**
     *  Calcule les scores et identifie les muscles dominants/faibles
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
     *  Met à jour les stats musculaires après une session
     */
    async updateMuscleStats(userId: number, sessionId: number) {
        this.logger.log(`Updating muscle stats for user ${userId} from session ${sessionId}`);

        //  Récupérer le poids du corps de l'utilisateur depuis FitnessProfile
        const fitnessProfile = await this.prisma.fitnessProfile.findUnique({
            where: { userId },
            select: { weight: true },
        });

        const userBodyWeight = fitnessProfile?.weight || null;

        if (!userBodyWeight) {
            this.logger.warn(`User ${userId} has no bodyWeight set in FitnessProfile. Bodyweight exercises will have reduced volume.`);
        }

        // 1️ Récupérer la session avec les exercices et performances
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

        // 2 Grouper les performances par muscle avec calcul adaptatif du volume
        const muscleVolumes = new Map<number, { volume: number; sets: number; category: MuscleCategory }>();

        for (const exerciceSession of session.exercices) {
            const exercice = exerciceSession.exercice;
            const muscleGroups = exercice.groupes;

            for (const performance of exerciceSession.performances) {
                //  Calcul adaptatif du volume (gère poids du corps + lestage)
                const volume = this.calculateVolumeForAtlas(
                    performance.weight || 0,
                    performance.reps_effectuees || 0,
                    exercice.bodyWeight,
                    exercice.name,
                    userBodyWeight
                );

                for (const muscleGroupRelation of muscleGroups) {
                    const muscleId = muscleGroupRelation.groupeId;
                    const muscleCategory = muscleGroupRelation.groupe.category;
                    const current = muscleVolumes.get(muscleId) || { volume: 0, sets: 0, category: muscleCategory };

                    muscleVolumes.set(muscleId, {
                        volume: current.volume + volume,
                        sets: current.sets + 1,
                        category: muscleCategory,
                    });
                }
            }
        }

        // 3 Récupérer TOUTES les stats existantes de l'utilisateur en UNE SEULE query
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

        // 4 Préparer tous les upserts
        const upsertOperations = Array.from(muscleVolumes.entries()).map(([muscleId, data]) => {
            const existingStat = statsMap.get(muscleId);
            const newVolume = (existingStat?.totalVolume || 0) + data.volume;
            const newLevel = this.calculateLevel(newVolume, data.category);

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

        // 5 Exécuter TOUS les upserts dans UNE SEULE transaction
        await this.prisma.$transaction(upsertOperations);

        this.logger.log(`✅ Muscle stats updated successfully (${upsertOperations.length} muscles)`);
    }

    /**
     *  Calcule le niveau d'un muscle de manière scalable et infinie
     * 
     * @param totalVolume Volume total cumulé pour ce muscle (kg)
     * @param muscleCategory Catégorie du muscle (LEGS, ARMS, etc.)
     * @returns Niveau du muscle (0 à ∞)
     */
    private calculateLevel(totalVolume: number, muscleCategory: MuscleCategory): number {
        if (totalVolume === 0) return 0;


        const BASE_VOLUMES: Record<MuscleCategory, number> = {
            LEGS: 8000,       // Squats, leg press → charges lourdes
            BACK: 6000,       // Deadlift, rows → charges moyennes-lourdes
            CHEST: 6000,      // Bench press → charges moyennes-lourdes
            SHOULDERS: 4000,  // Overhead press → charges moyennes
            ARMS: 3000,       // Curls, extensions → charges légères
            CORE: 2000,       // Souvent poids du corps ou charges faibles
            OTHER: 5000,      // Fallback conservateur
        };


        const PROGRESSION_FACTOR = 1.55;

        const baseVolume = BASE_VOLUMES[muscleCategory] || BASE_VOLUMES.OTHER;

        const level = Math.floor(
            Math.log(totalVolume / baseVolume) / Math.log(PROGRESSION_FACTOR)
        );

        // Garantir un minimum de 0 (si volume < baseVolume)
        return Math.max(0, level);
    }


    getLevelLabel(level: number): string {
        if (level === 0) return 'Novice';
        if (level === 1) return 'Débutant';
        if (level === 2) return 'Apprenti';
        if (level === 3) return 'Intermédiaire';
        if (level === 4) return 'Confirmé';
        if (level === 5) return 'Avancé';
        if (level === 6) return 'Expert';
        if (level === 7) return 'Maître';
        if (level === 8) return 'Élite';
        if (level === 9) return 'Champion';
        if (level >= 10 && level < 15) return 'Légende';
        if (level >= 15 && level < 20) return 'Titan';
        if (level >= 20) return 'Divin';
        return 'Inconnu';
    }


    private calculateVolumeForAtlas(
        weight: number,
        reps: number,
        isBodyWeight: boolean,
        exerciseName: string,
        userBodyWeight: number | null
    ): number {
        // Cas 1: Exercice avec charges classiques
        if (!isBodyWeight) {
            return weight * reps;
        }

        if (!userBodyWeight || userBodyWeight <= 0) {
            // Si pas de poids du corps renseigné, fallback sur le weight uniquement
            this.logger.warn(`User bodyWeight not set, using weight only for ${exerciseName}`);
            return weight * reps;
        }

        // Récupérer le coefficient biomécanique (70% par défaut si non trouvé)
        const coefficient = BODYWEIGHT_COEFFICIENTS[exerciseName] || 0.7;

        // Total weight = poids du corps + lest éventuel
        const totalWeight = userBodyWeight + weight;

        return totalWeight * coefficient * reps;
    }

    private calculateHeat(lastTrainedAt: Date | null, totalVolume: number): MuscleHeat | null {
        if (totalVolume === 0 || !lastTrainedAt) return null;

        const now = new Date();
        const hoursSince = (now.getTime() - lastTrainedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSince <= 72) return 'HOT';      // 0-3 jours
        if (hoursSince <= 120) return 'WARM';    // 3-5 jours
        if (hoursSince <= 168) return 'COLD';    // 5-7 jours
        return 'FROZEN';                          // 7+ jours
    }

    /**
     *  Compare deux Body Atlas
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
