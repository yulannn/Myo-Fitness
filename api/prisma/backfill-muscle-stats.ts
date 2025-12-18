import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🔄 Script pour mettre à jour rétroactivement les stats musculaires
 * à partir de toutes les sessions complétées
 */
async function backfillMuscleStats() {
    console.log('🔄 Démarrage du backfill des stats musculaires...');

    // Récupérer toutes les sessions complétées
    const completedSessions = await prisma.trainingSession.findMany({
        where: {
            completed: true,
        },
        include: {
            trainingProgram: {
                include: {
                    fitnessProfile: true,
                },
            },
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
        orderBy: {
            performedAt: 'asc', // Traiter dans l'ordre chronologique
        },
    });

    console.log(`📊 ${completedSessions.length} sessions complétées trouvées`);

    // Grouper par utilisateur
    const sessionsByUser = new Map<number, any[]>();
    for (const session of completedSessions) {
        const userId = session.trainingProgram.fitnessProfile.userId;
        if (!sessionsByUser.has(userId)) {
            sessionsByUser.set(userId, []);
        }
        sessionsByUser.get(userId)!.push(session);
    }

    console.log(`👥 ${sessionsByUser.size} utilisateurs à traiter`);

    // Traiter chaque utilisateur
    let totalUpdated = 0;
    for (const [userId, sessions] of sessionsByUser.entries()) {
        console.log(`\n🔄 Traitement de l'utilisateur ${userId}...`);
        console.log(`   ${sessions.length} sessions à traiter`);

        // Reset les stats de cet utilisateur
        await prisma.userMuscleStats.deleteMany({
            where: { userId },
        });

        // Traiter toutes les sessions en batch
        for (const session of sessions) {
            await updateMuscleStatsForSession(userId, session);
            totalUpdated++;
        }

        console.log(`   ✅ ${sessions.length} sessions traitées`);
    }

    console.log(`\n🎉 Backfill terminé ! ${totalUpdated} sessions traitées`);
}

async function updateMuscleStatsForSession(userId: number, session: any) {
    // Grouper les performances par muscle
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

    // ✅ Récupérer toutes les stats existantes en une seule query
    const existingStats = await prisma.userMuscleStats.findMany({
        where: { userId },
        select: {
            muscleGroupId: true,
            totalVolume: true,
        },
    });

    const statsMap = new Map(
        existingStats.map(stat => [stat.muscleGroupId, stat])
    );

    // ✅ Préparer tous les upserts
    const upsertOperations = Array.from(muscleVolumes.entries()).map(([muscleId, data]) => {
        const existingStat = statsMap.get(muscleId);
        const newVolume = (existingStat?.totalVolume || 0) + data.volume;
        const newLevel = calculateLevel(newVolume);

        return prisma.userMuscleStats.upsert({
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
                lastTrainedAt: session.performedAt || new Date(),
            },
            update: {
                totalVolume: newVolume,
                level: newLevel,
                lastTrainedAt: session.performedAt || new Date(),
            },
        });
    });

    // ✅ Exécuter tous les upserts dans une transaction
    if (upsertOperations.length > 0) {
        await prisma.$transaction(upsertOperations);
    }
}

function calculateLevel(totalVolume: number): number {
    const thresholds = [0, 10000, 30000, 60000, 100000, 150000];
    for (let level = 5; level >= 0; level--) {
        if (totalVolume >= thresholds[level]) {
            return level;
        }
    }
    return 0;
}



backfillMuscleStats()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
