import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMuscleStats() {
    console.log('🔍 Vérification des stats musculaires en base...\n');

    // 1. Vérifier les groupes musculaires existants
    const muscleGroups = await prisma.muscleGroup.findMany({
        orderBy: { name: 'asc' },
    });

    console.log(`📦 ${muscleGroups.length} groupes musculaires dans la BDD:`);
    muscleGroups.forEach(g => console.log(`  - ${g.name} (ID: ${g.id}, Catégorie: ${g.category})`));
    console.log('');

    // 2. Vérifier les stats musculaires de tous les utilisateurs
    const stats = await prisma.userMuscleStats.findMany({
        include: {
            muscleGroup: true,
            user: {
                select: { id: true, name: true }
            }
        },
        orderBy: [
            { userId: 'asc' },
            { totalVolume: 'desc' }
        ]
    });

    if (stats.length === 0) {
        console.log('❌ Aucune stat musculaire trouvée!');
        console.log('   → Vous n\'avez probablement jamais complété de session');
        console.log('   → OU le updateMuscleStats n\'a jamais été appelé');
    } else {
        console.log(`📊 ${stats.length} stats musculaires trouvées:\n`);

        const byUser = new Map<number, any[]>();
        stats.forEach(s => {
            if (!byUser.has(s.userId)) {
                byUser.set(s.userId, []);
            }
            byUser.get(s.userId)!.push(s);
        });

        byUser.forEach((userStats, userId) => {
            const userName = userStats[0].user.name;
            console.log(`👤 User: ${userName} (ID: ${userId})`);
            userStats.forEach(s => {
                console.log(`  - ${s.muscleGroup.name}: ${Math.round(s.totalVolume)}kg (niveau ${s.level})`);
            });
            console.log('');
        });
    }

    // 3. Vérifier les sessions complétées
    const completedSessions = await prisma.trainingSession.findMany({
        where: { completed: true },
        include: {
            exercices: {
                include: {
                    exercice: {
                        include: {
                            groupes: {
                                include: {
                                    groupe: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { performedAt: 'desc' },
        take: 5
    });

    console.log(`🏋️ ${completedSessions.length} sessions complétées (5 dernières):\n`);
    completedSessions.forEach((session, idx) => {
        console.log(`Session #${session.id} - ${session.performedAt?.toLocaleDateString() || 'N/A'}`);
        const musclesWorked = new Set<string>();
        session.exercices.forEach(ex => {
            console.log(`  • ${ex.exercice.name}`);
            ex.exercice.groupes.forEach(g => {
                musclesWorked.add(g.groupe.name);
            });
        });
        console.log(`  → Muscles: ${Array.from(musclesWorked).join(', ')}`);
        console.log('');
    });

    await prisma.$disconnect();
}

checkMuscleStats().catch(console.error);
