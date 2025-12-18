import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🔍 Script de diagnostic pour comprendre pourquoi les quadriceps ne s'affichent pas
 */
async function debugMuscleStats() {
    console.log('🔍 Diagnostic des stats musculaires...\n');

    // 1. Vérifier les exercices "leg press" et "squat" et leurs relations musculaires
    console.log('📋 1. Recherche des exercices leg press et squat...');
    const legExercises = await prisma.exercice.findMany({
        where: {
            OR: [
                { name: { contains: 'leg press', mode: 'insensitive' } },
                { name: { contains: 'squat', mode: 'insensitive' } },
                { name: { contains: 'presse', mode: 'insensitive' } },
            ],
        },
        include: {
            groupes: {
                include: {
                    groupe: true,
                },
            },
        },
    });

    console.log(`   ✅ ${legExercises.length} exercices trouvés :`);
    for (const ex of legExercises) {
        console.log(`   - ${ex.name} (ID: ${ex.id})`);
        console.log(`     Muscles associés :`);
        for (const mg of ex.groupes) {
            console.log(`       → ${mg.groupe.name} (ID: ${mg.groupeId})`);
        }
    }

    // 2. Vérifier les dernières sessions complétées avec ces exercices
    console.log('\n📊 2. Dernières sessions avec leg press ou squat...');
    const recentSessions = await prisma.trainingSession.findMany({
        where: {
            completed: true,
            exercices: {
                some: {
                    exerciceId: {
                        in: legExercises.map(e => e.id),
                    },
                },
            },
        },
        include: {
            trainingProgram: {
                include: {
                    fitnessProfile: true,
                },
            },
            exercices: {
                where: {
                    exerciceId: {
                        in: legExercises.map(e => e.id),
                    },
                },
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
            performedAt: 'desc',
        },
        take: 5,
    });

    console.log(`   ✅ ${recentSessions.length} sessions trouvées :`);
    for (const session of recentSessions) {
        const userId = session.trainingProgram.fitnessProfile.userId;
        console.log(`\n   Session #${session.id} - User ${userId} - ${session.performedAt?.toISOString()}`);

        for (const exSession of session.exercices) {
            console.log(`     📌 ${exSession.exercice.name}`);
            console.log(`        Muscles : ${exSession.exercice.groupes.map(g => g.groupe.name).join(', ')}`);
            console.log(`        Performances enregistrées : ${exSession.performances.length}`);

            if (exSession.performances.length > 0) {
                let totalVolume = 0;
                for (const perf of exSession.performances) {
                    const vol = (perf.reps_effectuees || 0) * (perf.weight || 0);
                    totalVolume += vol;
                    console.log(`          - Set ${perf.set_index}: ${perf.reps_effectuees} reps × ${perf.weight} kg = ${vol} kg`);
                }
                console.log(`        Volume total : ${totalVolume} kg`);
            } else {
                console.log(`        ⚠️ AUCUNE PERFORMANCE ENREGISTRÉE !`);
            }
        }
    }

    // 3. Vérifier les stats musculaires actuelles pour les quadriceps
    console.log('\n💪 3. Stats musculaires actuelles pour "Quadriceps"...');
    const quadriceps = await prisma.muscleGroup.findFirst({
        where: {
            name: { contains: 'quadriceps', mode: 'insensitive' },
        },
    });

    if (quadriceps) {
        console.log(`   ✅ Groupe musculaire trouvé : ${quadriceps.name} (ID: ${quadriceps.id})`);

        const quadStats = await prisma.userMuscleStats.findMany({
            where: {
                muscleGroupId: quadriceps.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (quadStats.length > 0) {
            console.log(`   ✅ ${quadStats.length} utilisateurs ont des stats pour les quadriceps :`);
            for (const stat of quadStats) {
                console.log(`     - User ${stat.user.name} (ID: ${stat.userId})`);
                console.log(`       Volume total : ${stat.totalVolume} kg`);
                console.log(`       Level : ${stat.level}`);
                console.log(`       Dernière séance : ${stat.lastTrainedAt?.toISOString()}`);
            }
        } else {
            console.log(`   ⚠️ AUCUNE STATS pour les quadriceps !`);
        }
    } else {
        console.log(`   ❌ Groupe musculaire "Quadriceps" NON TROUVÉ !`);
    }

    // 4. Vérifier tous les groupes musculaires disponibles
    console.log('\n🗂️ 4. Tous les groupes musculaires disponibles :');
    const allMuscles = await prisma.muscleGroup.findMany({
        orderBy: {
            category: 'asc',
        },
    });

    const byCategory = new Map<string, string[]>();
    for (const muscle of allMuscles) {
        if (!byCategory.has(muscle.category)) {
            byCategory.set(muscle.category, []);
        }
        byCategory.get(muscle.category)!.push(`${muscle.name} (ID: ${muscle.id})`);
    }

    for (const [category, muscles] of byCategory.entries()) {
        console.log(`   ${category} :`);
        for (const muscle of muscles) {
            console.log(`     - ${muscle}`);
        }
    }

    console.log('\n✅ Diagnostic terminé !');
}

debugMuscleStats()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
